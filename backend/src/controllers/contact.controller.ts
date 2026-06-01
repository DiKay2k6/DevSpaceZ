import { Request, Response } from 'express';
import { Contact } from '../models/contact.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';

export const contactController = {
    // Tìm kiếm người dùng bằng email
    searchUsers: async (req: Request, res: Response) => {
        try {
            const { email } = req.query;
            if (!email) {
                throw new AppError(400, 'Vui lòng cung cấp email để tìm kiếm');
            }

            const currentUserId = (req as any).user.id;
            
            const users = await User.find({ 
                email: { $regex: email as string, $options: 'i' },
                _id: { $ne: currentUserId } // Không tìm chính mình
            }).select('_id full_name email avatar_url').limit(10);

            res.status(200).json({ status: 'success', data: users });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    // Gửi lời mời / Thêm vào danh bạ
    addContact: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { friendId } = req.body;

            if (userId === friendId) {
                throw new AppError(400, 'Không thể tự kết bạn với chính mình');
            }

            const existingContact = await Contact.findOne({
                $or: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            });

            if (existingContact) {
                throw new AppError(400, 'Người này đã có trong danh bạ hoặc đã có lời mời gửi đi');
            }

            // Tự động accepted để đơn giản hoá cho Personal Space
            const newContact = await Contact.create({
                userId,
                friendId,
                status: 'accepted'
            });

            res.status(201).json({ status: 'success', data: newContact });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    // Lấy danh sách bạn bè
    getContacts: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;

            const contacts = await Contact.find({
                $or: [{ userId }, { friendId: userId }],
                status: 'accepted'
            })
            .populate('userId', '_id full_name email avatar_url')
            .populate('friendId', '_id full_name email avatar_url');

            // Format data để trả về danh sách User (loại bỏ chính mình)
            const friends = contacts.map(c => {
                if (c.userId._id.toString() === userId) return c.friendId;
                return c.userId;
            });

            res.status(200).json({ status: 'success', data: friends });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    // Xoá khỏi danh bạ
    removeContact: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { friendId } = req.params;

            await Contact.findOneAndDelete({
                $or: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            });

            res.status(200).json({ status: 'success', message: 'Đã xoá khỏi danh bạ' });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    }
};
