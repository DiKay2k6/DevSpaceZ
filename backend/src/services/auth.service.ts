import { UserRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';
import { addEmailToQueue } from '../queues/email.queue';
import { AppError } from '../utils/appError'; // <-- Thêm dòng này ở trên cùng
import { Organization } from '../models/organization.model';

const userRepository = new UserRepository();

export class AuthService {

    // --- 1. LUỒNG ĐĂNG KÝ ---
    async register(data: any) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            // Lỗi 409 Conflict: Dữ liệu bị trùng đột
            throw new AppError('Email này đã được đăng ký trong hệ thống.', 409);
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const newUser = await userRepository.create({
            email: data.email,
            password_hash: data.password,
            full_name: data.fullName,
            role: 'Developer',
            otp_code: otpCode,
            otp_expires_at: otpExpiresAt
        });

        console.log(`\n🔑 [MOCK EMAIL] MÃ OTP CỦA ${data.email} LÀ: ${otpCode}\n`);

        const emailHTML = `<div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #3B82F6;">Chào mừng bạn đến với DevSpacez!</h2>
                <p>Để hoàn tất đăng ký, vui lòng sử dụng mã xác nhận sau:</p>
                <h1 style="color: #0F172A; letter-spacing: 5px;">${otpCode}</h1>
                <p><i>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</i></p>
            </div>`;
        // Đẩy email vào Queue chạy ngầm, không block luồng trả về
        await addEmailToQueue(data.email, 'Mã xác nhận kích hoạt tài khoản DevSpacez', emailHTML);

        return { email: newUser.email };
    }

    // --- 2. LUỒNG XÁC THỰC OTP ---
    async verifyOTP(email: string, otp: string) {
        const user = await userRepository.findByEmailWithOTP(email);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản.', 404); // 404 Not Found
        }
        if (user.is_active) {
            throw new AppError('Tài khoản đã được kích hoạt từ trước.', 400); // 400 Bad Request
        }
        if (user.otp_code !== otp) {
            throw new AppError('Mã OTP không chính xác.', 401); // 401 Unauthorized
        }
        if (user.otp_expires_at && user.otp_expires_at < new Date()) {
            throw new AppError('Mã OTP đã hết hạn. Vui lòng đăng ký lại để nhận mã mới.', 400);
        }

        user.is_active = true;
        user.otp_code = undefined;
        user.otp_expires_at = undefined;
        await userRepository.save(user);

        // Tạo tổ chức cá nhân mặc định
        const newOrg = await Organization.create({
            name: `Tổ chức của ${user.full_name}`,
            description: 'Tổ chức cá nhân mặc định',
            ownerId: user._id,
            members: [{
                userId: user._id,
                role: 'Owner',
                status: 'Joined',
                joinedAt: new Date()
            }]
        });

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        const userObj = user.toObject();
        delete userObj.password_hash;
        delete userObj.otp_code;
        delete userObj.otp_expires_at;

        return { user: userObj, accessToken, refreshToken };
    }

    // --- 3. LUỒNG ĐĂNG NHẬP (ĐÃ ĐƯỢC TỐI ƯU BẢO MẬT) ---
    async login(email: string, password: string) {
        // Bước 1: Tìm user
        const user = await userRepository.findByEmailForAuth(email);
        if (!user) {
            throw new AppError('Email này chưa được đăng ký trong hệ thống.', 401);
        }

        // Bước 2: KIỂM TRA MẬT KHẨU TRƯỚC (Rất quan trọng để tránh spam OTP)
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
        }

        // Bước 3: NẾU MẬT KHẨU ĐÚNG, mới kiểm tra xem đã kích hoạt chưa
        if (!user.is_active) {
            throw new AppError('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác thực.', 403);
        }

        // Bước 4: Thành công thì tạo token
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());
        const userObj = user.toObject();
        delete userObj.password_hash;

        return { user: userObj, accessToken, refreshToken };
    }

    // --- 4. LUỒNG GỬI LẠI OTP ---
    async resendOTP(email: string) {
        // 1. Kiểm tra user có tồn tại không
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản với email này.', 404);
        }

        // 2. Chặn nếu tài khoản đã kích hoạt rồi
        if (user.is_active) {
            throw new AppError('Tài khoản đã được kích hoạt, không cần gửi lại OTP.', 400);
        }

        // 3. Sinh mã OTP mới và cập nhật thời gian
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        user.otp_code = otpCode;
        user.otp_expires_at = otpExpiresAt;
        await userRepository.save(user); // Lưu lại OTP mới vào DB

        console.log(`\n🔑 [MOCK EMAIL] MÃ OTP MỚI CỦA ${email} LÀ: ${otpCode}\n`);

        // 4. Gửi email mới
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #3B82F6;">Yêu cầu gửi lại mã xác nhận</h2>
                <p>Mã xác nhận (OTP) mới của bạn là:</p>
                <h1 style="color: #0F172A; letter-spacing: 5px;">${otpCode}</h1>
                <p><i>Mã này sẽ hết hạn sau 5 phút.</i></p>
            </div>
        `;
        await addEmailToQueue(email, 'Mã xác nhận MỚI kích hoạt DevSpacez', emailHTML);
    }

    // --- 5. LUỒNG QUÊN MẬT KHẨU (GỬI OTP) ---
    async forgotPassword(email: string) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            // Vẫn trả về thành công để tránh kẻ tấn công dò tìm email
            return { message: 'Nếu email tồn tại, một mã OTP đã được gửi đến.' };
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

        user.reset_password_otp = otpCode;
        user.reset_password_expires_at = otpExpiresAt;
        await userRepository.save(user);

        console.log(`\n🔑 [MOCK EMAIL] MÃ OTP RESET PASSWORD CỦA ${email} LÀ: ${otpCode}\n`);

        const emailHTML = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #3B82F6;">Yêu cầu đặt lại mật khẩu</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã xác nhận sau để tiếp tục:</p>
                <h1 style="color: #0F172A; letter-spacing: 5px;">${otpCode}</h1>
                <p><i>Mã này sẽ hết hạn sau 5 phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</i></p>
            </div>
        `;
        await addEmailToQueue(email, 'Mã OTP đặt lại mật khẩu DevSpacez', emailHTML);
        
        return { message: 'Nếu email tồn tại, một mã OTP đã được gửi đến.' };
    }

    // --- 6. LUỒNG XÁC THỰC OTP ĐỂ RESET PASSWORD ---
    async verifyResetOTP(email: string, otp: string) {
        const user = await userRepository.findByEmailWithResetOTP(email);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản.', 404);
        }

        if (!user.reset_password_otp || user.reset_password_otp !== otp) {
            throw new AppError('Mã OTP không chính xác.', 401);
        }

        if (user.reset_password_expires_at && user.reset_password_expires_at < new Date()) {
            throw new AppError('Mã OTP đã hết hạn. Vui lòng yêu cầu lại.', 400);
        }

        // OTP đúng, xóa OTP đi và sinh ra resetToken
        user.reset_password_otp = undefined;
        user.reset_password_expires_at = undefined;
        await userRepository.save(user);

        // Import từ jwt.util ở trên cùng (sẽ sửa sau nếu cần, hoặc assume đã import, vì generateResetToken chưa import)
        // Vì vậy ta require tạm ở đây để tránh sửa chunk khác
        const { generateResetToken } = require('../utils/jwt.util');
        const resetToken = generateResetToken(email);

        return { resetToken };
    }

    // --- 7. LUỒNG ĐẶT LẠI MẬT KHẨU BẰNG TOKEN ---
    async resetPassword(resetToken: string, newPassword: string) {
        const { verifyToken } = require('../utils/jwt.util');
        
        let decoded: any;
        try {
            decoded = verifyToken(resetToken);
        } catch (error) {
            throw new AppError('Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.', 401);
        }

        const user = await userRepository.findByEmail(decoded.email);
        if (!user) {
            throw new AppError('Không tìm thấy tài khoản liên kết với token này.', 404);
        }

        user.password_hash = newPassword;
        await userRepository.save(user);
    }
}