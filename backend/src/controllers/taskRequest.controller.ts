import { Request, Response } from 'express';
import { TaskRequest } from '../models/taskRequest.model';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';
import { SubTeam } from '../models/subteam.model';
import { Organization } from '../models/organization.model';
import { Workspace } from '../models/workspace.model';
import { AppError } from '../utils/appError';
import { Notification } from '../models/notification.model';
import { getIO } from '../utils/socket';
import mongoose from 'mongoose';

export const taskRequestController = {
    // 1. Tạo yêu cầu tham gia/rời
    createRequest: async (req: Request, res: Response) => {
        try {
        const { type, reason } = req.body;
        const taskId = req.params.taskId as string;
        const userId = (req as any).user.id;

        const task = await Task.findById(taskId);
        if (!task) throw new AppError(404, 'Không tìm thấy thẻ công việc');

        const boardId = task.boardId;
        const board = await Board.findById(boardId);
        if (!board) throw new AppError(404, 'Không tìm thấy bảng');

        const workspace = await Workspace.findById(board.workspaceId);
        if (!workspace) throw new AppError(404, 'Không tìm thấy dự án');
        
        const organizationId = workspace.organizationId;

        // Kiểm tra xem đã có request Pending nào chưa
        const existingRequest = await TaskRequest.findOne({ taskId, userId, status: 'Pending' });
        if (existingRequest) {
            throw new AppError(400, 'Bạn đã có một yêu cầu đang chờ duyệt cho thẻ này');
        }

        // Tạo Request
        const request = await TaskRequest.create({
            taskId,
            boardId,
            userId,
            type,
            reason
        });

        // Tìm Approvers (Người có quyền duyệt)
        const subteams = await SubTeam.find({ organizationId });
        const userSubteams = subteams.filter(st => st.members.some(m => m.userId.toString() === userId));
        
        let approverIds: string[] = [];
        
        if (userSubteams.length > 0) {
            // Tìm Leader của các phòng ban đó
            userSubteams.forEach(st => {
                st.members.forEach(m => {
                    if (m.role === 'Leader') approverIds.push(m.userId.toString());
                });
            });
        }

        // Nếu không có Leader nào, lấy Manager và Owner của Organization
        if (approverIds.length === 0) {
            const org = await Organization.findById(organizationId);
            if (org) {
                org.members.forEach(m => {
                    if (m.role === 'Manager' || m.role === 'Owner') {
                        approverIds.push(m.userId.toString());
                    }
                });
            }
        }

        // Bắn Notification cho các Approvers
        const uniqueApprovers = [...new Set(approverIds)];
        for (const approverId of uniqueApprovers) {
            if (approverId === userId) continue; // Không gửi cho chính mình nếu mình là Leader
            
            const notif = await Notification.create({
                userId: new mongoose.Types.ObjectId(approverId),
                type: 'TaskUpdated',
                content: `${(req as any).user.full_name} đã gửi yêu cầu ${type === 'Join' ? 'Tham gia' : 'Rời'} thẻ công việc: ${task.title}`,
                relatedTaskId: new mongoose.Types.ObjectId(taskId),
                workspaceId: board.workspaceId,
                senderId: new mongoose.Types.ObjectId(userId)
            });
            
            getIO().to(approverId).emit('new_notification', notif);
        }

        res.status(201).json({
            status: 'success',
            data: request
        });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // 2. Lấy danh sách yêu cầu chờ duyệt (Dành cho Leader/Manager)
    getPendingRequests: async (req: Request, res: Response) => {
        try {
        const userId = (req as any).user.id;
        const { boardId } = req.query;

        // Để đơn giản, ta lấy tất cả requests của board này. Ở thực tế có thể query theo quyền.
        const query: any = { status: 'Pending' };
        if (boardId) query.boardId = boardId;

        const requests = await TaskRequest.find(query)
            .populate('userId', 'full_name avatar_url')
            .populate('taskId', 'title')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            data: requests
        });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // 3. Duyệt/Từ chối yêu cầu
    processRequest: async (req: Request, res: Response) => {
        try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved' | 'Rejected'
        const approverId = (req as any).user.id;

        const request = await TaskRequest.findById(id);
        if (!request) throw new AppError(404, 'Không tìm thấy yêu cầu');
        if (request.status !== 'Pending') throw new AppError(400, 'Yêu cầu này đã được xử lý');

        request.status = status;
        request.approverId = new mongoose.Types.ObjectId(approverId);
        await request.save();

        const task = await Task.findById(request.taskId);
        if (task && status === 'Approved') {
            const currentAssignees = task.assignees.map(id => id.toString());
            const reqUserIdStr = request.userId.toString();

            if (request.type === 'Join' && !currentAssignees.includes(reqUserIdStr)) {
                task.assignees.push(request.userId);
            } else if (request.type === 'Leave') {
                task.assignees = task.assignees.filter(id => id.toString() !== reqUserIdStr);
            }
            await task.save();
            
            // Emit socket board update
            getIO().to(request.boardId.toString()).emit('board_updated', { action: 'update_task', taskId: task._id });
        }

        // Gửi Notification cho người xin
        const notif = await Notification.create({
            userId: request.userId,
            type: 'TaskUpdated',
            content: `Yêu cầu ${request.type === 'Join' ? 'Tham gia' : 'Rời'} thẻ ${task?.title || '(đã bị xóa)'} của bạn đã ${status === 'Approved' ? 'được Chấp nhận' : 'bị Từ chối'}`,
            relatedTaskId: request.taskId,
            senderId: new mongoose.Types.ObjectId(approverId)
        });
        getIO().to(request.userId.toString()).emit('new_notification', notif);

        res.status(200).json({
            status: 'success',
            data: request
        });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    }
};
