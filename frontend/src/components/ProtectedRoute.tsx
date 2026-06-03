import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/authStore';

interface ProtectedRouteProps {
    allowedRoles?: string[]; // Mảng các role được phép truy cập (tùy chọn)
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, isCheckingAuth, user } = useAuthStore();

    // 1. Nếu hệ thống đang âm thầm kiểm tra Cookie (F5 trang), hiển thị màn hình Loading chờ
    if (isCheckingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    // 2. Nếu chưa đăng nhập -> Đẩy ngay về trang Login
    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

    // 3. Nếu đã đăng nhập nhưng không đủ quyền Role -> Đẩy về trang Dashboard chung
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Hợp lệ hoàn toàn -> Cho phép đi tiếp vào trang con (thông qua component <Outlet />)
    return <Outlet />;
};