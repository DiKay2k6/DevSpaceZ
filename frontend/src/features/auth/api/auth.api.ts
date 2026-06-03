import axiosClient from '@/shared/api/axiosClient';

// Định nghĩa kiểu dữ liệu (Types) cho Request dựa theo Backend Zod Schema
export interface RegisterPayload {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface ResetPasswordPayload {
    resetToken: string;
    newPassword: string;
}

// Gom nhóm toàn bộ API liên quan đến Xác thực vào một object
export const authApi = {
    register: (data: RegisterPayload) => {
        return axiosClient.post('/auth/register', data);
    },

    verifyOTP: (data: VerifyOtpPayload) => {
        return axiosClient.post('/auth/verify-otp', data);
    },

    resendOTP: (email: string) => {
        return axiosClient.post('/auth/resend-otp', { email });
    },

    login: (data: LoginPayload) => {
        return axiosClient.post('/auth/login', data);
    },

    logout: () => {
        return axiosClient.post('/auth/logout');
    },

    oauthSuccess: (sessionId: string) => {
        return axiosClient.post('/auth/oauth-success', { sessionId });
    },

    getMe: () => {
        return axiosClient.get('/auth/me');
    },

    forgotPassword: (email: string) => {
        return axiosClient.post('/auth/forgot-password', { email });
    },

    verifyResetOTP: (data: VerifyOtpPayload) => {
        return axiosClient.post<{ data: { resetToken: string } }>('/auth/verify-reset-otp', data);
    },

    resendResetOTP: (email: string) => {
        return axiosClient.post('/auth/resend-reset-otp', { email });
    },

    resetPassword: (data: ResetPasswordPayload) => {
        return axiosClient.post('/auth/reset-password', data);
    }
};