import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { userService } from '../services/user.service';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import { Workspace } from '../models/workspace.model';
import { AppError } from '../utils/appError';
import { Task } from '../models/task.model';
import mongoose from 'mongoose';

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    // req.user được gán từ middleware protect
    const userId = (req as any).user._id.toString();
    const { full_name, specialization } = req.body;

    const updatedUser = await userService.updateProfile(userId, { full_name, specialization });

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật thông tin thành công.',
        data: {
            user: updatedUser
        }
    });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id.toString();
    
    if (!req.file) {
        throw new AppError('Vui lòng chọn một file ảnh để tải lên.', 400);
    }

    const updatedUser = await userService.updateAvatar(userId, req.file.filename);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật ảnh đại diện thành công.',
        data: {
            user: updatedUser
        }
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user._id.toString();
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
        throw new AppError('Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.', 400);
    }

    await userService.changePassword(userId, old_password, new_password);

    res.status(200).json({
        status: 'success',
        message: 'Đổi mật khẩu thành công.'
    });
});

/**
 * @route POST /api/v1/users/me/pinned-boards/:boardId
 * @desc Thêm/xóa ghim dự án
 */
export const togglePinBoard = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { boardId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    if (!user.pinned_boards) {
        user.pinned_boards = [];
    }

    const boardIndex = user.pinned_boards.findIndex(id => id.toString() === boardId);

    if (boardIndex === -1) {
        // Find the target board to get its workspace context
        const targetBoard = await Board.findById(boardId).populate('workspaceId');
        if (!targetBoard) throw new AppError('Không tìm thấy dự án', 404);
        
        const targetOrgId = (targetBoard.workspaceId as any)?.organizationId?.toString() || null;

        // Fetch all pinned boards with their workspaces
        const pinnedBoards = await Board.find({ _id: { $in: user.pinned_boards } }).populate('workspaceId');
        
        // Count how many pinned boards are in the SAME context
        let pinnedInSameContext = 0;
        pinnedBoards.forEach(b => {
            const orgId = (b.workspaceId as any)?.organizationId?.toString() || null;
            if (orgId === targetOrgId) {
                pinnedInSameContext++;
            }
        });

        if (pinnedInSameContext >= 3) {
            throw new AppError('Bạn chỉ có thể ghim tối đa 3 dự án trong cùng một không gian', 400);
        }
        
        user.pinned_boards.push(boardId as any);
    } else {
        // Gỡ ghim
        user.pinned_boards.splice(boardIndex, 1);
    }

    await user.save();

    res.status(200).json({ status: 'success', data: { pinned_boards: user.pinned_boards } });
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        res.status(200).json({ status: 'success', data: { users: [] } });
        return;
    }

    const currentUserId = (req as any).user._id;

    // Tìm kiếm bằng RegEx không phân biệt hoa thường, giới hạn 5 kết quả
    const users = await User.find({
        email: { $regex: email, $options: 'i' },
        _id: { $ne: currentUserId } // Không tự tìm chính mình
    })
    .select('_id full_name email avatar_url')
    .limit(5)
    .lean();

    res.status(200).json({
        status: 'success',
        data: { users }
    });
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError('ID người dùng không hợp lệ', 400);
    }

    const targetUser = await User.findById(id).select('-password').lean();
    if (!targetUser) {
        throw new AppError('Không tìm thấy người dùng', 404);
    }

    // Lấy danh sách subTeam của user
    const SubTeam = mongoose.model('SubTeam');
    const userSubTeams = await SubTeam.find({ 'members.userId': id }).lean();
    const subTeamIds = userSubTeams.map(st => st._id);

    // Lấy danh sách các workspace mà user này tham gia
    const workspaces = await Workspace.find({ 
        $or: [
            { 'members.userId': id },
            { ownerId: id },
            { subTeamIds: { $in: subTeamIds } }
        ]
    }).lean();
    const workspaceIds = workspaces.map(w => w._id);

    // Lấy danh sách các project (board) thuộc các workspace đó
    const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).lean();
    const boardIds = boards.map(b => b._id);

    const objectId = new mongoose.Types.ObjectId(id);

    // Tính toán số lượng task của người dùng này trong các bảng đó
    // Đang làm (In Progress)
    const inProgressCount = await Task.countDocuments({
        boardId: { $in: boardIds },
        assignees: objectId,
        status: 'In Progress'
    });

    // Hoàn thành (Done)
    const doneCount = await Task.countDocuments({
        boardId: { $in: boardIds },
        assignees: objectId,
        status: 'Done'
    });

    // Quá hạn (Overdue) - Not Done and past due date
    const overdueCount = await Task.countDocuments({
        boardId: { $in: boardIds },
        assignees: objectId,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() }
    });

    // 5 công việc gần nhất đang làm
    const recentTasks = await Task.find({
        boardId: { $in: boardIds },
        assignees: objectId,
        status: { $ne: 'Done' }
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('boardId', 'title')
    .lean();

    // Calculate Git Stats for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Lazy import inside function to avoid circular dependencies if any, but better to import at top.
    // We will just require it here to avoid replacing the top of the file since we don't know the imports layout precisely.
    const { GitDailyStat } = require('../models/gitStat.model');
    const gitStatsDoc = await GitDailyStat.find({
        userId: objectId,
        date: { $gte: sevenDaysAgo }
    }).lean();

    const gitStats = gitStatsDoc.reduce((acc: any, curr: any) => {
        acc.commits += curr.commits || 0;
        acc.prsMerged += curr.prsMerged || 0;
        return acc;
    }, { commits: 0, prsMerged: 0 });

    res.status(200).json({
        status: 'success',
        data: {
            user: targetUser,
            stats: {
                inProgress: inProgressCount,
                done: doneCount,
                overdue: overdueCount
            },
            recentTasks: recentTasks.map(t => ({
                _id: t._id,
                title: t.title,
                status: t.status,
                boardName: (t.boardId as any)?.title || 'Không rõ'
            })),
            gitStats
        }
    });
});
