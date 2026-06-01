import { AxiosError } from 'axios';

/**
 * Trích xuất câu báo lỗi an toàn và đồng nhất từ tất cả các loại Error (Axios Error, Chuỗi lỗi, Lỗi hệ thống).
 * Giải quyết dứt điểm vấn đề axiosClient trả về chuỗi thay vì Object ở các block try/catch.
 */
export const handleApiError = (error: unknown, defaultMessage = 'Đã có lỗi xảy ra'): string => {
    // 1. Trường hợp error đã bị interceptor của axiosClient ép về string (Promise.reject(errorMessage))
    if (typeof error === 'string') {
        return error;
    }

    // 2. Trường hợp là lỗi Axios nguyên bản chưa bị ép kiểu
    if (error && typeof error === 'object') {
        const axiosError = error as AxiosError<{ message?: string }>;
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        
        // 3. Các loại lỗi JS thông thường (Error object)
        const standardError = error as Error;
        if (standardError.message) {
            return standardError.message;
        }
    }

    return defaultMessage;
};
