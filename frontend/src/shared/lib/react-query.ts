import { QueryClient } from '@tanstack/react-query';

// Khởi tạo QueryClient với cấu hình chuẩn Enterprise
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Dữ liệu sẽ được coi là "cũ" (stale) sau 1 phút, tự động gọi lại API nếu user focus lại web
            staleTime: 1000 * 60, // 1 minute
            
            // Dữ liệu được giữ trong bộ nhớ đệm (cache) 5 phút sau khi component bị unmount
            gcTime: 1000 * 60 * 5, // 5 minutes
            
            // Tự động gọi lại API nếu request thất bại (tối đa 2 lần)
            retry: 2,
            
            // Không tự động gọi lại (refetch) nếu người dùng chuyển tab liên tục quá nhanh
            refetchOnWindowFocus: true,
            
            // Không throw error trực tiếp lên React ErrorBoundary (ta tự xử lý UI bằng error object)
            throwOnError: false,
        },
    },
});
