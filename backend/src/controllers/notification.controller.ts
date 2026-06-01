import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import { AppError } from '../utils/appError';

export const notificationController = {
    /**
     * @route GET /api/v1/notifications
     * @desc Lấy danh sách thông báo của user
     */
    getNotifications: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            
            const notifications = await Notification.find({ userId })
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('senderId', '_id full_name avatar_url')
                .populate('workspaceId', '_id name')
                .lean();
                
            res.status(200).json({
                status: 'success',
                data: notifications
            });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route PATCH /api/v1/notifications/:id/read
     * @desc Đánh dấu thông báo đã đọc
     */
    markAsRead: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;

            const notification = await Notification.findOneAndUpdate(
                { _id: id, userId },
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                throw new AppError('Không tìm thấy thông báo', 404);
            }

            res.status(200).json({
                status: 'success',
                data: notification
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    /**
     * @route PATCH /api/v1/notifications/read-all
     * @desc Đánh dấu tất cả thông báo là đã đọc
     */
    markAllAsRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;

            await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true }
            );

            res.status(200).json({
                status: 'success',
                message: 'Đã đánh dấu tất cả là đã đọc'
            });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }
};
