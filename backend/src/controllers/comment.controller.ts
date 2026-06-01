import { Request, Response } from 'express';
import { Comment } from '../models/comment.model';
import { Task } from '../models/task.model';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { sendNotificationToUser } from '../utils/socket';

export const commentController = {
    /**
     * @route GET /api/v1/tasks/:taskId/comments
     * @desc Lấy danh sách bình luận của một Task
     * @access Private
     */
    getCommentsByTask: async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params;

            // Kiểm tra task tồn tại
            const task = await Task.findById(taskId).lean();
            if (!task) {
                throw new AppError(404, 'Không tìm thấy thẻ công việc');
            }

            const comments = await Comment.find({ taskId })
                .sort({ createdAt: -1 }) // Mới nhất lên trên
                .populate('userId', '_id full_name avatar_url email')
                .lean();

            res.status(200).json({
                status: 'success',
                data: { comments }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/tasks/:taskId/comments
     * @desc Thêm bình luận mới vào Task
     * @access Private
     */
    createComment: async (req: Request, res: Response) => {
        try {
            const { taskId } = req.params;
            const { content } = req.body;
            const userId = (req as any).user.id;

            if (!content || !content.trim()) {
                throw new AppError(400, 'Nội dung bình luận không được để trống');
            }

            const task = await Task.findById(taskId);
            if (!task) {
                throw new AppError(404, 'Không tìm thấy thẻ công việc');
            }

            const newComment = await Comment.create({
                taskId: new mongoose.Types.ObjectId(taskId as string),
                userId: new mongoose.Types.ObjectId(userId as string),
                content
            });

            // Populate thông tin người dùng ngay lập tức để trả về cho frontend hiển thị
            await newComment.populate('userId', '_id full_name avatar_url email');

            // Xử lý @mention (tìm kiếm user dựa trên text)
            // Ví dụ content: "Hello @NguyenVanA"
            const mentionRegex = /@([A-ZÀ-Ỹa-zà-ỹ0-9_]+)/g;
            const matches = content.match(mentionRegex);
            
            if (matches) {
                // Lấy ra danh sách tên
                const mentionedNames = matches.map((m: string) => m.substring(1));
                
                // Tìm trong DB xem có user nào khớp (full_name không khoảng trắng để match)
                const allUsers = await User.find().select('_id full_name');
                const mentionedUsers = allUsers.filter(u => 
                    mentionedNames.includes(u.full_name.replace(/\s+/g, ''))
                );

                // Lưu Notification & Emit qua Socket
                for (const user of mentionedUsers) {
                    if (user._id.toString() !== userId) {
                        const notif = await Notification.create({
                            userId: user._id,
                            type: 'Mention',
                            content: `${(req as any).user.full_name} đã nhắc đến bạn trong một bình luận ở Thẻ công việc.`,
                            relatedTaskId: task._id,
                            senderId: userId
                        });

                        sendNotificationToUser(user._id.toString(), 'new_notification', notif);
                    }
                }
            }

            res.status(201).json({
                status: 'success',
                message: 'Đã thêm bình luận',
                data: { comment: newComment }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route DELETE /api/v1/comments/:id
     * @desc Xóa bình luận
     * @access Private
     */
    deleteComment: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;

            const comment = await Comment.findById(id);
            if (!comment) {
                throw new AppError(404, 'Không tìm thấy bình luận');
            }

            // Chỉ người tạo mới được quyền xóa
            if (comment.userId.toString() !== userId) {
                throw new AppError(403, 'Bạn không có quyền xóa bình luận này');
            }

            await Comment.findByIdAndDelete(id);

            res.status(200).json({
                status: 'success',
                message: 'Đã xóa bình luận'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    }
};
