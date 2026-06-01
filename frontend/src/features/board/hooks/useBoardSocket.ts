import { useEffect } from 'react';
import { useSocket } from '@/shared/hooks/useSocket'; // Vite reload
import { useQueryClient } from '@tanstack/react-query';
import { BOARD_KEYS } from './useBoards';

export const useBoardSocket = (boardId: string | undefined) => {
    const socket = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket || !boardId) return;

        // Tham gia vào Room của Board hiện tại
        socket.emit('join_board', boardId);

        // Lắng nghe sự kiện bảng được cập nhật
        const handleBoardUpdated = (data: { action: string; taskId?: string }) => {
            // Invalidate queries để React Query tự động fetch data mới nhất
            queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
        };

        socket.on('board_updated', handleBoardUpdated);

        return () => {
            // Rời Room và huỷ lắng nghe khi unmount
            socket.emit('leave_board', boardId);
            socket.off('board_updated', handleBoardUpdated);
        };
    }, [socket, boardId, queryClient]);
};
