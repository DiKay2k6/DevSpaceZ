import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model';
import { Board } from '../models/board.model';
import { AppError } from '../utils/appError';
import { getIO } from '../utils/socket';
import { IUser } from '../models/user.model';

export const getMessagesByBoard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        // Kiểm tra xem board có tồn tại không
        const board = await Board.findById(boardId);
        if (!board) {
            return next(new AppError('Không tìm thấy bảng (Dự án)', 404));
        }

        // Lấy danh sách tin nhắn (sắp xếp giảm dần theo thời gian, sau đó đảo ngược để hiển thị)
        const messages = await Message.find({ boardId })
            .populate('senderId', 'full_name avatar_url email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Đảo ngược lại để tin nhắn mới nhất ở cuối
        const sortedMessages = messages.reverse();

        res.status(200).json({
            status: 'success',
            data: {
                messages: sortedMessages
            }
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId, content, mediaUrl, mediaType } = req.body;
        const user = req.user as IUser;
        const senderId = user._id;

        const board = await Board.findById(boardId);
        if (!board) {
            return next(new AppError('Không tìm thấy bảng', 404));
        }

        if (board.status === 'Completed') {
            return next(new AppError('Bảng này đã hoàn tất, không thể gửi tin nhắn mới', 403));
        }

        if (!content && !mediaUrl) {
            return next(new AppError('Tin nhắn không được để trống', 400));
        }

        const newMessage = await Message.create({
            boardId,
            senderId,
            content,
            mediaUrl,
            mediaType: mediaType || 'none'
        });

        const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'full_name avatar_url email');

        // Phát sự kiện qua Socket.io cho những người trong phòng
        getIO().to(boardId).emit('receive_message', populatedMessage);

        res.status(201).json({
            status: 'success',
            data: {
                message: populatedMessage
            }
        });
    } catch (error) {
        next(error);
    }
};
