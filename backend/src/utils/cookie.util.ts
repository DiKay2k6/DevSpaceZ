import { Response } from 'express';

export const sendTokenResponse = (res: Response, statusCode: number, message: string, user: any, accessToken: string, refreshToken: string) => {
    // Thiết lập tùy chọn cho Cookie (Refresh Token)
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Hết hạn sau 7 ngày
        httpOnly: true, // Mã JavaScript ở Frontend không thể đọc được (Chống XSS)
        secure: process.env.NODE_ENV === 'production', // Chạy HTTPS ở môi trường Production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as const // Bảo vệ khỏi tấn công CSRF (dùng 'none' cho Cross-Origin)
    };

    // Gắn Refresh Token vào Cookie có tên là 'jwt_refresh'
    res.status(statusCode).cookie('jwt_refresh', refreshToken, cookieOptions).json({
        status: 'success',
        message,
        data: { 
            user,
            accessToken // Trả về Access Token qua JSON để Frontend lưu vào bộ nhớ (Zustand)
        } 
    });
};