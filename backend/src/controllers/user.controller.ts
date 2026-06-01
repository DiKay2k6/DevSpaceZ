import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { userService } from '../services/user.service';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import { Workspace } from '../models/workspace.model';
import { AppError } from '../utils/appError';

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
