import { z } from 'zod';

// Quy tắc cho Đăng ký
export const registerSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email là bắt buộc' }) // Dùng "message" thay cho "required_error"
            .email('Định dạng email không hợp lệ'),
        password: z.string({ message: 'Mật khẩu là bắt buộc' })
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .max(32, 'Mật khẩu không được vượt quá 32 ký tự')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
        fullName: z.string({ message: 'Họ và tên là bắt buộc' })
            .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    })
});

// Quy tắc cho Đăng nhập
export const loginSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email là bắt buộc' })
            .email('Định dạng email không hợp lệ'),
        password: z.string({ message: 'Mật khẩu là bắt buộc' })
            .min(1, 'Vui lòng nhập mật khẩu')
    })
});

// Quy tắc cho Xác thực OTP
export const verifyOtpSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email là bắt buộc' })
            .email('Định dạng email không hợp lệ'),
        otp: z.string({ message: 'Mã OTP là bắt buộc' })
            .length(6, 'Mã OTP phải có chính xác 6 chữ số')
    })
});

// Quy tắc cho Gửi lại OTP
export const resendOtpSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email là bắt buộc' })
            .email('Định dạng email không hợp lệ')
    })
});

// Quy tắc cho Quên mật khẩu
export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string({ message: 'Email là bắt buộc' })
            .email('Định dạng email không hợp lệ')
    })
});

// Quy tắc cho Đặt lại mật khẩu (Dùng resetToken)
export const resetPasswordSchema = z.object({
    body: z.object({
        resetToken: z.string({ message: 'Reset token là bắt buộc' }),
        newPassword: z.string({ message: 'Mật khẩu là bắt buộc' })
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .max(32, 'Mật khẩu không được vượt quá 32 ký tự')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
    })
});