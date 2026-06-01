import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

// Sử dụng Rest Parameter (...roles) để gom tất cả các quyền được truyền vào thành 1 mảng
export const restrictTo = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // req.user đã được truyền qua từ middleware "protect" trước đó
        if (!req.user) {
            return next(new AppError('Bạn chưa đăng nhập.', 401));
        }

        // Nếu role của user hiện tại KHÔNG NẰM TRONG danh sách được phép
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
        }

        next(); // Đủ quyền thì cho đi tiếp
    };
};