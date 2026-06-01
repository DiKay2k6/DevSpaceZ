import { User, IUser } from '../models/user.model';

export class UserRepository {
    // Tìm user bằng email (Bao gồm cả password_hash để so sánh lúc Login)
    async findByEmailForAuth(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).select('+password_hash');
    }

    // Tìm user bình thường (Tuyệt đối không lấy password ra)
    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    // TÌM USER KÈM OTP ĐỂ XÁC THỰC
    async findByEmailWithOTP(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).select('+otp_code +otp_expires_at');
    }

    // TÌM USER KÈM OTP ĐỂ RESET PASSWORD
    async findByEmailWithResetOTP(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).select('+reset_password_otp +reset_password_expires_at');
    }

    // Tạo user mới
    async create(userData: Partial<IUser>): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    // Cập nhật/Lưu user đã tồn tại (Chuẩn Layered Architecture)
    async save(user: IUser): Promise<IUser> {
        return await user.save();
    }

    // Tìm user bằng ID
    async findById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }
}