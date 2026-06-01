import { useQuery } from '@tanstack/react-query';
import { boardApi } from '../api/board.api';

// Định danh key cache cho React Query
export const BOARD_KEYS = {
    all: ['boards'] as const,
    detail: (id: string) => ['boards', id] as const,
};

export const useBoards = (orgId?: string) => {
    return useQuery({
        queryKey: [...BOARD_KEYS.all, orgId],
        queryFn: () => boardApi.getAllBoards(orgId),
        // Dữ liệu boards thường ít thay đổi liên tục, có thể set staleTime cao hơn một chút
        staleTime: 1000 * 60 * 5, // 5 phút
    });
};

export const useBoardDetail = (id: string) => {
    return useQuery({
        queryKey: BOARD_KEYS.detail(id),
        queryFn: () => boardApi.getBoardDetails(id),
        enabled: !!id, // Chỉ gọi API khi id tồn tại
    });
};
