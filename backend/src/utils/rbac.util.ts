import { AppError } from './appError';
import { Workspace } from '../models/workspace.model';
import mongoose from 'mongoose';

export const checkWorkspaceRole = async (workspaceId: string | mongoose.Types.ObjectId, userId: string | mongoose.Types.ObjectId, allowedRoles: ('Manager' | 'Developer' | 'Viewer')[]) => {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        throw new AppError(404, 'Không tìm thấy Workspace');
    }

    // Owner luôn có toàn quyền Manager ngầm định
    if (workspace.ownerId.toString() === userId.toString() && allowedRoles.includes('Manager')) {
        return true;
    }

    const member = workspace.members.find(m => m.userId.toString() === userId.toString());
    if (!member) {
        throw new AppError(403, 'Bạn không phải là thành viên của Workspace này');
    }

    if (!allowedRoles.includes(member.role as any)) {
        throw new AppError(403, `Quyền truy cập bị từ chối. Cần quyền: ${allowedRoles.join(' hoặc ')}`);
    }

    return true;
};
