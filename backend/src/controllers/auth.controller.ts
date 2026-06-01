import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/appError';
import { sendTokenResponse } from '../utils/cookie.util';
import { User } from '../models/user.model'; // <-- FIX LỖI: Chuyển lên dùng Import tĩnh ở đây

const authService = new AuthService();

// --- ĐĂNG KÝ TÀI KHOẢN ---
export const register = asyncHandler(async (req: Request, res: Response) => {
    await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP kích hoạt tài khoản.'
    });
});

// --- XÁC THỰC OTP ---
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyOTP(email, otp);

    sendTokenResponse(res, 200, 'Xác thực OTP thành công! Tài khoản của bạn đã được kích hoạt.', user, accessToken, refreshToken);
});

// --- ĐĂNG NHẬP ---
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    sendTokenResponse(res, 200, 'Đăng nhập thành công!', user, accessToken, refreshToken);
});

// --- ĐĂNG XUẤT ---
export const logout = asyncHandler(async (req: Request, res: Response) => {
    // Xóa cookie jwt_refresh triệt để
    res.clearCookie('jwt_refresh', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
    });
    
    // Xóa thêm cookie 'jwt' cũ (từ kiến trúc cũ) nếu vẫn còn kẹt trong trình duyệt
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
    });

    res.status(200).json({
        status: 'success',
        message: 'Đăng xuất thành công!'
    });
});

// --- REFRESH TOKEN ---
export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.jwt_refresh;

    if (!refreshToken) {
        throw new AppError('Bạn chưa đăng nhập. Không có Refresh Token!', 401);
    }

    try {
        const { verifyRefreshToken, generateAccessToken } = require('../utils/jwt.util');
        const decoded = verifyRefreshToken(refreshToken);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser || !currentUser.is_active) {
            throw new AppError('Tài khoản không hợp lệ hoặc đã bị khóa.', 401);
        }

        // Cấp lại Access Token mới (15 phút)
        const newAccessToken = generateAccessToken(currentUser._id.toString());

        res.status(200).json({
            status: 'success',
            data: { accessToken: newAccessToken }
        });
    } catch (error) {
        throw new AppError('Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 401);
    }
});

// --- GỬI LẠI OTP ---
export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Vui lòng cung cấp email để nhận lại mã OTP.', 400);
    }

    await authService.resendOTP(email);

    res.status(200).json({
        status: 'success',
        message: 'Đã gửi lại mã OTP. Vui lòng kiểm tra hòm thư của bạn.'
    });
});

// --- LẤY THÔNG TIN CÁ NHÂN (YÊU CẦU TOKEN) ---
export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});

// --- LẤY DANH SÁCH TẤT CẢ USERS (CHỈ ADMIN) ---
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    // Đã gọi Model an toàn thông qua Static Import
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users }
    });
});

// --- QUÊN MẬT KHẨU (GỬI OTP) ---
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const response = await authService.forgotPassword(email);

    res.status(200).json({
        status: 'success',
        message: response.message
    });
});

// --- ĐẶT LẠI MẬT KHẨU (XÁC THỰC OTP) ---
export const verifyResetOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const { resetToken } = await authService.verifyResetOTP(email, otp);

    res.status(200).json({
        status: 'success',
        message: 'Xác thực OTP thành công!',
        data: { resetToken }
    });
});

// --- ĐẶT LẠI MẬT KHẨU BẰNG TOKEN ---
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { resetToken, newPassword } = req.body;
    await authService.resetPassword(resetToken, newPassword);

    res.status(200).json({
        status: 'success',
        message: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập bằng mật khẩu mới.'
    });
});