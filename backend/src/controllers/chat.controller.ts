import { Request, Response, NextFunction } from 'express';
import { Message } from '../models/message.model';
import { Board } from '../models/board.model';
import { Conversation } from '../models/conversation.model';
import { AppError } from '../utils/appError';
import { getIO } from '../utils/socket';
import { IUser } from '../models/user.model';
import mongoose from 'mongoose';

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { boardId, conversationId } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        if (!boardId && !conversationId) {
            return next(new AppError('Cần cung cấp boardId hoặc conversationId', 400));
        }

        let query: any = {};
        if (boardId) query.boardId = boardId;
        if (conversationId) query.conversationId = conversationId;

        // Nếu là board, kiểm tra sự tồn tại của board
        if (boardId) {
            const board = await Board.findById(boardId);
            if (!board) {
                return next(new AppError('Không tìm thấy bảng (Dự án)', 404));
            }
        }

        // Lấy danh sách tin nhắn
        const messages = await Message.find(query)
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
        const { boardId, conversationId, content, mediaUrl, mediaType } = req.body;
        const user = req.user as IUser;
        const senderId = user._id;

        if (!boardId && !conversationId) {
            return next(new AppError('Cần cung cấp boardId hoặc conversationId', 400));
        }

        if (boardId) {
            const board = await Board.findById(boardId);
            if (!board) {
                return next(new AppError('Không tìm thấy bảng', 404));
            }

            if (board.status === 'Completed') {
                return next(new AppError('Bảng này đã hoàn tất, không thể gửi tin nhắn mới', 403));
            }
        }

        if (!content && !mediaUrl) {
            return next(new AppError('Tin nhắn không được để trống', 400));
        }

        const newMessage = await Message.create({
            boardId: boardId || undefined,
            conversationId: conversationId || undefined,
            senderId,
            content,
            mediaUrl,
            mediaType: mediaType || 'none'
        });

        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
        }

        const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'full_name avatar_url email');

        // Phát sự kiện qua Socket.io
        const roomId = boardId ? boardId.toString() : conversationId.toString();
        getIO().to(roomId).emit('receive_message', populatedMessage);

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

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as IUser;
        
        const conversations = await Conversation.find({
            participants: user._id
        })
        .populate('participants', 'full_name avatar_url email')
        .sort({ lastMessageAt: -1 })
        .lean();

        res.status(200).json({
            status: 'success',
            data: { conversations }
        });
    } catch (error) {
        next(error);
    }
};

export const findOrCreateConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as IUser;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return next(new AppError('Cần cung cấp targetUserId', 400));
        }

        if (targetUserId === user._id.toString()) {
            return next(new AppError('Không thể tự chat với chính mình', 400));
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [user._id, new mongoose.Types.ObjectId(targetUserId)] }
        }).populate('participants', 'full_name avatar_url email');

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [user._id, targetUserId]
            });
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'full_name avatar_url email')
                .lean() as any;
        }

        res.status(200).json({
            status: 'success',
            data: { conversation }
        });
    } catch (error) {
        next(error);
    }
};
