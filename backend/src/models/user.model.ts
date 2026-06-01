import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// 1. Khai báo Interface cho User Document (chuẩn TypeScript)
export interface IUser extends Document {
    email: string;
    password_hash?: string;
    auth_providers?: { provider: string; provider_id: string }[];
    full_name: string;
    avatar_url?: string;
    role: 'Manager' | 'Developer' | 'Viewer';
    specialization?: string;
    is_active: boolean;
    otp_code?: string;        // Thêm trường OTP
    otp_expires_at?: Date;    // Thêm hạn sử dụng OTP
    reset_password_otp?: string;
    reset_password_expires_at?: Date;
    pinned_boards?: mongoose.Types.ObjectId[];

    // Phương thức kiểm tra mật khẩu
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Định nghĩa Schema cho MongoDB
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
        },
        password_hash: {
            type: String,
            required: false, // Bắt buộc false vì OAuth không có mật khẩu
            minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
            select: false // KHÔNG tự động query password ra để tránh lộ bảo mật
        },
        auth_providers: [{
            provider: { type: String, enum: ['google', 'github'] },
            provider_id: { type: String }
        }],
        full_name: {
            type: String,
            required: [true, 'Họ và tên là bắt buộc'],
            trim: true
        },
        avatar_url: {
            type: String,
            default: ''
        },
        role: {
            type: String,
            enum: ['Manager', 'Developer', 'Viewer'],
            default: 'Developer'
        },
        specialization: {
            type: String,
            default: ''
        },
        is_active: {
            type: Boolean,
            default: false // Đổi thành false vì chờ kích hoạt OTP
        },
        otp_code: {
            type: String,
            select: false // KHÔNG tự động query OTP ra ngoài
        },
        otp_expires_at: {
            type: Date,
            select: false // KHÔNG tự động query ra ngoài
        },
        reset_password_otp: {
            type: String,
            select: false
        },
        reset_password_expires_at: {
            type: Date,
            select: false
        },
        pinned_boards: [{
            type: Schema.Types.ObjectId,
            ref: 'Board'
        }]
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

// 3. Middleware (Mongoose Hook): Tự động băm mật khẩu trước khi lưu (Save)
userSchema.pre('save', async function (this: IUser) {
    // Chỉ băm lại nếu trường password bị thay đổi (hoặc tạo mới)
    if (!this.isModified('password_hash') || !this.password_hash) {
        return;
    }

    // Vì dùng async/await, Mongoose sẽ tự bắt lỗi nếu bcrypt ném ra ngoại lệ
    const salt = await bcrypt.genSalt(10);
    this.password_hash = await bcrypt.hash(this.password_hash, salt);
});

// 4. Instance Method: So sánh mật khẩu lúc người dùng đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password_hash) return false;
    return await bcrypt.compare(candidatePassword, this.password_hash);
};

export const User = mongoose.model<IUser>('User', userSchema);