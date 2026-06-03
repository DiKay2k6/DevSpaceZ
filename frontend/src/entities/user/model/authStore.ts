import { create } from 'zustand';
import { authApi, LoginPayload } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/utils/error';
import { tokenManager } from '@/shared/api/tokenManager';

// 1. Định nghĩa kiểu dữ liệu cho User
export interface User {
    _id: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url: string;
    specialization?: string;
    is_active: boolean;
    pinned_boards?: string[];
}

// 2. Định nghĩa cấu trúc của Kho lưu trữ (Store)
interface AuthState {
    user: User | null;          // Thông tin user (nếu chưa đăng nhập thì là null)
    accessToken: string | null; // JWT Access Token lưu trên memory
    isAuthenticated: boolean;   // Trạng thái đăng nhập
    isCheckingAuth: boolean;    // Cờ trạng thái đang kiểm tra token lúc mới load web trang
    error: string | null;       // Lưu thông báo lỗi nếu có

    // Các hàm xử lý (Actions)
    login: (data: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    clearSession: () => void;
    checkAuth: () => Promise<void>; // Hàm tự động chạy khi F5 web để xem còn đăng nhập không
    updateUser: (user: User) => void; // Cập nhật lại thông tin user trên giao diện
    setAccessToken: (token: string) => void; // Lưu trữ token mới khi refresh thành công
}

// 3. Khởi tạo Store
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isCheckingAuth: true, // Mặc định vừa vào web là phải check ngay
    error: null,

    login: async (data: LoginPayload) => {
        try {
            set({ error: null }); // Xóa lỗi cũ trước khi gọi API
            const response = await authApi.login(data);

            // Cập nhật state thành công
            set({
                user: response.data.user,
                accessToken: response.data.accessToken,
                isAuthenticated: true,
                error: null
            });
        } catch (error) {
            // Lưu thông báo lỗi vào state để giao diện (UI) hiển thị
            set({ error: handleApiError(error) });
            throw error; // Quăng lỗi ra để màn hình Login bắt được nếu cần
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Lỗi khi đăng xuất API:', error);
        } finally {
            // Luôn xóa sạch dữ liệu trong store dù gọi API có lỗi hay không
            set({ user: null, accessToken: null, isAuthenticated: false });
            // Xóa Organization của user cũ để user mới không bị dính
            localStorage.removeItem('organization-storage');
            
            // Chỉ hard reload nếu đang ở trong Dashboard để xóa query cache, 
            // nếu đang ở public thì không cần để tránh reload loop.
            if (window.location.pathname.startsWith('/dashboard')) {
                window.location.href = '/auth';
            }
        }
    },

    clearSession: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
        localStorage.removeItem('organization-storage');
        // Chỉ reload/chuyển hướng nếu không phải đang ở trang auth
        if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
        }
    },

    checkAuth: async () => {
        try {
            // Không có token trên memory -> Thử dùng cookie refresh để lấy mới
            // Axios interceptor sẽ tự lo việc gọi /refresh-token nếu getMe trả về 401
            const response = await authApi.getMe();
            set({
                user: response.data.user,
                accessToken: response.data.accessToken || null, // Có thể API getMe không trả về accessToken, interceptor sẽ set
                isAuthenticated: true,
                isCheckingAuth: false
            });
        } catch (error) {
            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isCheckingAuth: false
            });
        }
    },

    // Hàm cập nhật lại cục state user khi đổi tên hoặc đổi avatar
    updateUser: (updatedUser: User) => {
        set({ user: updatedUser });
    },
    
    // Hàm cập nhật Access Token
    setAccessToken: (token: string) => {
        set({ accessToken: token });
    }
}));

// Bơm các hàm state từ authStore vào tokenManager để axiosClient có thể sử dụng mà không bị import vòng tròn
tokenManager.inject(
    () => useAuthStore.getState().accessToken,
    (token: string) => useAuthStore.getState().setAccessToken(token),
    () => useAuthStore.getState().clearSession()
);