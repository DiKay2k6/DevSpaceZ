import { Request, Response } from 'express';
import { getIO } from '../utils/socket';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';
import { AppError } from '../utils/appError';
import { Activity } from '../models/activity.model';
import { cacheService } from '../services/cache.service';
import { Notification } from '../models/notification.model';
import mongoose from 'mongoose';

export const taskController = {
    /**
     * @route POST /api/v1/tasks
     * @desc Tạo một Thẻ (Task) mới trong cột
     * @access Private
     */
    createTask: async (req: Request, res: Response) => {
        try {
            const { title, listId, boardId } = req.body;
            const userId = (req as any).user.id;

            const board = await Board.findById(boardId).lean() as any;
            if (!board) {
                throw new AppError(404, 'Không tìm thấy Bảng Kanban');
            }

            // Tính toán order: Đặt thẻ mới vào vị trí cuối cùng của cột hiện tại
            const count = await Task.countDocuments({ listId });

            const newTask = await Task.create({
                title,
                listId,
                boardId,
                order: count,
                priority: 'Medium',
                assignees: [] // Có thể mặc định gán cho người tạo
            });

            // Ghi Log Activity
            await Activity.create({
                workspaceId: board.workspaceId,
                userId: userId,
                action: 'tạo',
                targetName: `Công việc "${title}"`,
                targetType: 'Task'
            });

            getIO().to(boardId).emit('board_updated', { action: 'create_task', taskId: newTask._id });

            // Xóa cache thống kê
            await cacheService.delByPattern('dashboard:metrics:*');
            await cacheService.delByPattern('analytics:overview:*');

            res.status(201).json({
                status: 'success',
                data: {
                    task: newTask
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống'
            });
        }
    },

    /**
     * @route PUT /api/v1/tasks/move
     * @desc Cập nhật vị trí (listId, order) của nhiều Thẻ cùng lúc (BulkWrite)
     * @access Private
     */
    moveTask: async (req: Request, res: Response) => {
        try {
            const { items } = req.body; 
            // items là một mảng: [{ _id: '...', listId: '...', order: 0 }, ...]
            
            if (!items || !Array.isArray(items)) {
                throw new AppError(400, 'Dữ liệu không hợp lệ');
            }

            // Tạo các lệnh cập nhật cho MongoDB BulkWrite
            const bulkOps = items.map((item: any) => ({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { listId: item.listId, order: item.order } }
                }
            }));

            if (bulkOps.length > 0) {
                await Task.bulkWrite(bulkOps);
                
                // Emit socket event
                const firstTask = await Task.findById(items[0]._id).select('boardId');
                if (firstTask) {
                    getIO().to(firstTask.boardId.toString()).emit('board_updated', { action: 'move_tasks' });
                }

                // Xóa cache thống kê
                await cacheService.delByPattern('dashboard:metrics:*');
                await cacheService.delByPattern('analytics:overview:*');
            }

            res.status(200).json({
                status: 'success',
                message: 'Cập nhật vị trí thành công'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi khi cập nhật vị trí thẻ'
            });
        }
    },

    /**
     * @route PUT /api/v1/tasks/:id
     * @desc Cập nhật thông tin chi tiết của một Thẻ
     * @access Private
     */
    updateTask: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Xoá các trường không được phép cập nhật trực tiếp qua API này
            delete updateData._id;
            delete updateData.boardId;

            const oldTask = await Task.findById(id).lean();
            if (!oldTask) {
                throw new AppError(404, 'Không tìm thấy thẻ công việc');
            }

            const updatedTask = await Task.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true } // Trả về doc mới và chạy validate
            ).populate('assignees', 'full_name avatar_url email');

            if (!updatedTask) {
                throw new AppError(404, 'Không tìm thấy thẻ công việc');
            }

            getIO().to(updatedTask.boardId.toString()).emit('board_updated', { action: 'update_task', taskId: id });

            // Notification Logic: Check if assignees changed
            if (updateData.assignees) {
                const oldAssignees = (oldTask.assignees || []).map(a => a.toString());
                const newAssignees = updateData.assignees;
                
                const addedAssignees = newAssignees.filter((a: string) => !oldAssignees.includes(a) && a !== (req as any).user.id);
                
                if (addedAssignees.length > 0) {
                    const board = await Board.findById(updatedTask.boardId).select('workspaceId title').lean();
                    
                    for (const userId of addedAssignees) {
                        const notif = await Notification.create({
                            userId: new mongoose.Types.ObjectId(userId),
                            type: 'TaskAssigned',
                            content: `Bạn vừa được giao thẻ "${updatedTask.title}" trong dự án "${board?.title}"`,
                            relatedTaskId: updatedTask._id,
                            workspaceId: board?.workspaceId,
                            senderId: new mongoose.Types.ObjectId((req as any).user.id)
                        });
                        getIO().to(userId.toString()).emit('new_notification', notif);
                    }
                }
            }

            // Xóa cache thống kê
            await cacheService.delByPattern('dashboard:metrics:*');
            await cacheService.delByPattern('analytics:overview:*');

            res.status(200).json({
                status: 'success',
                data: {
                    task: updatedTask
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi khi cập nhật thẻ'
            });
        }
    },

    /**
     * @route DELETE /api/v1/tasks/:id
     * @desc Xóa công việc
     * @access Private
     */
    deleteTask: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const taskToDelete = await Task.findById(id);
            if (!taskToDelete) {
                throw new AppError(404, 'Không tìm thấy công việc');
            }
            
            const boardId = taskToDelete.boardId.toString();
            await Task.findByIdAndDelete(id);
            
            getIO().to(boardId).emit('board_updated', { action: 'delete_task', taskId: id });

            // Xóa cache thống kê
            await cacheService.delByPattern('dashboard:metrics:*');
            await cacheService.delByPattern('analytics:overview:*');

            res.status(200).json({
                status: 'success',
                message: 'Xóa công việc thành công'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi xóa công việc'
            });
        }
    },

    /**
     * @route POST /api/v1/tasks/:id/attachments
     * @desc Thêm file đính kèm vào Task
     */
    addAttachment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { filename, url, mimetype } = req.body;
            const userId = (req as any).user.id;

            const task = await Task.findById(id);
            if (!task) {
                throw new AppError(404, 'Không tìm thấy thẻ công việc');
            }

            const newAttachment = {
                filename,
                url,
                mimetype,
                uploadedBy: userId,
                createdAt: new Date()
            };

            task.attachments = task.attachments || [];
            task.attachments.push(newAttachment as any);
            await task.save();

            res.status(200).json({
                status: 'success',
                message: 'Thêm đính kèm thành công',
                data: {
                    attachment: newAttachment
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống'
            });
        }
    }
};
