import { Request, Response, NextFunction } from 'express';
import { Board } from '../models/board.model';
import { Task } from '../models/task.model';
import { Workspace } from '../models/workspace.model';
import mongoose from 'mongoose';

export const searchController = {
    /**
     * @route GET /api/v1/search?q=...&orgId=...
     * @desc Tìm kiếm toàn cục Projects và Tasks
     */
    globalSearch: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user.id;
            const query = req.query.q as string;
            const orgId = req.query.orgId as string;

            if (!query || query.trim().length < 2) {
                return res.status(200).json({
                    status: 'success',
                    data: {
                        boards: [],
                        tasks: []
                    }
                });
            }

            const regex = new RegExp(query, 'i');

            // 1. Xác định các workspace mà user có quyền truy cập
            let workspaceIds: mongoose.Types.ObjectId[] = [];
            const userObjectId = new mongoose.Types.ObjectId(userId);

            if (orgId && orgId !== 'undefined' && orgId !== 'null') {
                // Lấy tất cả các subteams mà user đang tham gia trong org này
                const SubTeam = mongoose.model('SubTeam');
                const userSubTeams = await SubTeam.find({
                    organizationId: orgId,
                    'members.userId': userId
                }).lean();
                const userSubTeamIds = userSubTeams.map((t: any) => t._id);

                const workspaces = await Workspace.find({ 
                    organizationId: orgId,
                    $or: [
                        { 'members.userId': userId },
                        { ownerId: userId },
                        { subTeamIds: { $in: userSubTeamIds } }
                    ]
                }).lean();
                workspaceIds = workspaces.map(w => w._id as mongoose.Types.ObjectId);
            } else {
                const workspaces = await Workspace.find({ 
                    $or: [
                        { 'members.userId': userId },
                        { ownerId: userId }
                    ]
                }).lean();
                workspaceIds = workspaces.map(w => w._id as mongoose.Types.ObjectId);
            }

            // Lấy danh sách Board ID thuộc các workspace trên
            const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).lean();
            const boardIds = boards.map(b => b._id);

            // 2. Tìm kiếm Boards
            const matchedBoards = boards.filter(b => regex.test(b.title) || (b.description && regex.test(b.description))).slice(0, 5);

            // 3. Tìm kiếm Tasks trong các Boards đó
            const matchedTasks = await Task.find({
                boardId: { $in: boardIds },
                $or: [
                    { title: regex },
                    { description: regex }
                ]
            }).select('title boardId status order type priority').limit(10).lean();

            // Gắn thêm tên Board vào Task để UI hiển thị đẹp hơn
            const tasksWithBoard = matchedTasks.map(task => {
                const b = boards.find(b => b._id.toString() === task.boardId.toString());
                return {
                    ...task,
                    boardName: b ? b.title : 'Dự án không rõ'
                };
            });

            res.status(200).json({
                status: 'success',
                data: {
                    boards: matchedBoards,
                    tasks: tasksWithBoard
                }
            });
        } catch (error) {
            next(error);
        }
    }
};
