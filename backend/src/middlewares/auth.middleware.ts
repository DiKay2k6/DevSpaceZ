import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { Role, Permission } from '../models/role.model';
import mongoose from 'mongoose';

const userRepository = new UserRepository();

interface JwtPayload {
    id: string;
}

export const protect = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Lấy token từ Header HOẶC từ Cookie
    let token;

    // Kiểm tra header (Dùng Bearer Token từ Zustand Store)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập!', 401);
    }

    // 2. Giải mã Token
    try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // 3. Kiểm tra xem User có còn tồn tại trong Database không
        const currentUser = await userRepository.findById(decoded.id);
        if (!currentUser) {
            throw new AppError('Tài khoản thuộc về token này không còn tồn tại.', 401);
        }

        // 4. Kiểm tra xem user có bị khóa sau khi phát token không
        if (!currentUser.is_active) {
            throw new AppError('Tài khoản này đã bị khóa hoặc chưa kích hoạt.', 403);
        }

        // 5. Gắn thông tin user vào Request để các hàm theo sau sử dụng
        req.user = currentUser;
        next(); // Chuyển quyền cho hàm tiếp theo (Controller)

    } catch (error) {
        // Xử lý các lỗi đặc thù của thư viện jsonwebtoken
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 401));
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401));
        }
        return next(error);
    }
});

// Middleware kiểm tra quyền hạn (RBAC)
export const requirePermission = (requiredPermission: Permission) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = (req as any).user._id;
        const orgId = req.params?.organizationId || req.body?.organizationId || req.query?.organizationId;
        const workspaceId = req.params?.workspaceId || req.body?.workspaceId || req.query?.workspaceId || (req.baseUrl.includes('/workspaces') ? req.params?.id : undefined);
        
        let roleName: string | undefined;

        if (workspaceId) {
            const Workspace = mongoose.model('Workspace');
            const workspace = await Workspace.findById(workspaceId).lean() as any;
            if (workspace && workspace.ownerId.toString() === userId.toString()) {
                return next(); // Owner luôn có toàn quyền
            }
            if (workspace) {
                const member = workspace.members?.find((m: any) => m.userId.toString() === userId.toString());
                if (member) roleName = member.role;
            }
        }

        if (!roleName && orgId) {
            const Organization = mongoose.model('Organization');
            const org = await Organization.findById(orgId).lean() as any;
            if (org && org.ownerId.toString() === userId.toString()) {
                return next(); // Owner luôn có toàn quyền
            }
            if (org) {
                const member = org.members?.find((m: any) => m.userId.toString() === userId.toString());
                if (member) roleName = member.role;
            }
        }

        if (!roleName) {
            throw new AppError('Bạn không có quyền truy cập (Không tìm thấy vai trò)', 403);
        }

        // Truy vấn Role từ DB
        const role = await Role.findOne({
            name: roleName,
            $or: [
                { workspaceId: workspaceId || null },
                { organizationId: orgId || null }
            ]
        }).lean();

        // Nếu role không tồn tại hoặc không có quyền cần thiết (và không phải Manager)
        if (!role || (!role.permissions.includes(requiredPermission) && roleName !== 'Manager')) {
            throw new AppError(`Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${requiredPermission}`, 403);
        }

        next();
    });
};