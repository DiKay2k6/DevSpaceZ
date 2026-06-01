import { User, IUser } from '../models/user.model';
import { AppError } from '../utils/appError';
import fs from 'fs';
import path from 'path';

export const userService = {
    /**
     * Cập nhật thông tin profile cơ bản
     */
    async updateProfile(userId: string, data: { full_name?: string; specialization?: string }) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản.', 404);
        }

        if (data.full_name) user.full_name = data.full_name;
        if (data.specialization !== undefined) user.specialization = data.specialization; // Cho phép rỗng

        await user.save();
        
        return user;
    },

    /**
     * Cập nhật ảnh đại diện (Avatar)
     */
    async updateAvatar(userId: string, filename: string) {
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản.', 404);
        }

        // Xóa ảnh cũ nếu có (để tiết kiệm dung lượng)
        if (user.avatar_url && user.avatar_url.startsWith('/uploads/avatars/')) {
            const oldAvatarPath = path.join(__dirname, '../../public', user.avatar_url);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Cập nhật đường dẫn ảnh mới
        user.avatar_url = `/uploads/avatars/${filename}`;
        await user.save();

        return user;
    },

    /**
     * Đổi mật khẩu
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string) {
        // Cần select('+password_hash') vì mặc định đã bị ẩn
        const user = await User.findById(userId).select('+password_hash');
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản.', 404);
        }

        // 1. Kiểm tra mật khẩu cũ
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            throw new AppError('Mật khẩu cũ không chính xác.', 400);
        }

        // 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
        const isSame = await user.comparePassword(newPassword);
        if (isSame) {
            throw new AppError('Mật khẩu mới không được trùng với mật khẩu cũ.', 400);
        }

        // 3. Cập nhật mật khẩu mới (Mongoose pre-save hook sẽ tự động hash)
        user.password_hash = newPassword;
        await user.save();

        return true;
    }
};
