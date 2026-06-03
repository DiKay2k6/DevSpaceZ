import axios from 'axios';
import { tokenManager } from './tokenManager';

// 1. Khởi tạo một instance của Axios với các cấu hình mặc định
const axiosClient = axios.create({
    // Sử dụng relative path /api/v1 để Vercel Proxy hoạt động, khắc phục lỗi Safari ITP Cross-Origin
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    // Cho phép Axios gửi và nhận HTTP-Only Cookie từ Backend (Dùng cho Refresh Token)
    withCredentials: true,
});

// Biến cờ để kiểm soát việc đang lấy lại token
let isRefreshing = false;
let refreshSubscribers: { resolve: (token: string) => void, reject: (error: any) => void }[] = [];

// Hàm đăng ký nhận token sau khi lấy thành công
const subscribeTokenRefresh = (cb: { resolve: (token: string) => void, reject: (error: any) => void }) => {
    refreshSubscribers.push(cb);
};

// Hàm xử lý sau khi lấy token xong
const onRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb.resolve(token));
    refreshSubscribers = [];
};

// Hàm xử lý khi lấy token thất bại
const onRefreshFailed = (error: any) => {
    refreshSubscribers.map((cb) => cb.reject(error));
    refreshSubscribers = [];
};

// 2. Can thiệp vào Request (Gửi đi)
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = tokenManager.getToken();
        
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Can thiệp vào Response (Dữ liệu trả về)
axiosClient.interceptors.response.use(
    (response) => {
        // Nếu API gọi thành công, ta chỉ lấy phần `data` trong JSON Backend trả về
        // (Bỏ qua các thông số thừa của cấu hình Axios)
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu API báo lỗi 401 (Unauthorized) và không phải request tới auth (để tránh lặp vô tận)
        if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh-token')) {
            if (!originalRequest._retry) {
                originalRequest._retry = true; // Đánh dấu đã thử lại

                if (!isRefreshing) {
                    isRefreshing = true;
                    try {
                        // Sử dụng relative path để gọi Proxy
                        const baseURL = '/api/v1';
                        const response = await axios.post(`${baseURL}/auth/refresh-token`, {}, { withCredentials: true });
                        const newAccessToken = response.data.data.accessToken;

                        // Lưu Token mới
                        tokenManager.setToken(newAccessToken);
                        
                        isRefreshing = false;
                        onRefreshed(newAccessToken);

                        // Gửi lại request vừa bị lỗi với token mới
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        return axiosClient(originalRequest);
                    } catch (refreshError) {
                        isRefreshing = false;
                        
                        // Nếu Refresh Token cũng hết hạn -> Xóa session
                        tokenManager.clearSession();
                        
                        onRefreshFailed(refreshError); // Reject tất cả request đang đợi để mở khóa UI
                        
                        return Promise.reject('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    }
                }

                // Nếu ĐANG trong quá trình Refresh (isRefreshing = true),
                // các request khác bị lỗi 401 sẽ vào hàng đợi (Subscribe)
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh({
                        resolve: (newToken: string) => {
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                            resolve(axiosClient(originalRequest));
                        },
                        reject: (error: any) => {
                            reject(error);
                        }
                    });
                });
            }
        }

        // Nếu Backend quăng lỗi (400, 403, 404, 500...), lấy đúng câu thông báo lỗi
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra kết nối với máy chủ';
        return Promise.reject(errorMessage);
    }
);

export default axiosClient;