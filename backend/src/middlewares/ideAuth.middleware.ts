import { Request, Response, NextFunction } from 'express';
import { Workspace } from '../models/workspace.model';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

export const ideAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // workspaceId
        const userId = (req as any).user.id;

        if (!id) return next();

        const workspace = await Workspace.findById(id);
        if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

        const member = workspace.members.find(m => m.userId.toString() === userId);
        if (member && member.isBlockedFromIDE) {
            throw new AppError(403, 'Bạn đã bị quản trị viên chặn quyền truy cập vào Cloud IDE của dự án này.');
        }

        next();
    } catch (error) {
        next(error);
    }
};
