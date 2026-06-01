import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/authStore';

export const PublicRoute = () => {
    const { isAuthenticated, isCheckingAuth } = useAuthStore();

    if (isCheckingAuth) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    // Nếu đã đăng nhập rồi, không cho vào trang Login/Register nữa, đẩy thẳng vô Dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};