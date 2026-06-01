import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi, Task, List, Board, Comment } from '@/features/board/api/board.api';
import { BOARD_KEYS } from './useBoards';
import toast from 'react-hot-toast';

export const useBoardActions = (boardId: string) => {
    const queryClient = useQueryClient();

    const invalidateBoard = () => {
        queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(boardId) });
    };

    // --- Board Mutations ---
    const updateBoardMutation = useMutation({
        mutationFn: (data: Partial<Board>) => boardApi.updateBoard(boardId, data),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi cập nhật bảng')
    });

    // --- List Mutations ---
    const createListMutation = useMutation({
        mutationFn: (title: string) => boardApi.createList({ title, boardId }),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi tạo cột')
    });

    const updateListMutation = useMutation({
        mutationFn: ({ listId, data }: { listId: string, data: Partial<List> }) => boardApi.updateList(listId, data),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi cập nhật cột')
    });

    const deleteListMutation = useMutation({
        mutationFn: (listId: string) => boardApi.deleteList(listId),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi xóa cột')
    });

    // --- Task Mutations ---
    const createTaskMutation = useMutation({
        mutationFn: (data: { title: string; listId: string }) => boardApi.createTask({ ...data, boardId }),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi tạo thẻ')
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ taskId, data }: { taskId: string, data: Partial<Task> }) => boardApi.updateTask(taskId, data),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi cập nhật thẻ')
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (taskId: string) => boardApi.deleteTask(taskId),
        onSuccess: () => invalidateBoard(),
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi xóa thẻ')
    });

    // --- Comments & Attachments ---
    const createCommentMutation = useMutation({
        mutationFn: ({ taskId, content }: { taskId: string, content: string }) => boardApi.createComment(taskId, content),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['task', variables.taskId, 'comments'] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi thêm bình luận')
    });

    const deleteCommentMutation = useMutation({
        mutationFn: ({ taskId, commentId }: { taskId: string, commentId: string }) => boardApi.deleteComment(taskId, commentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['task', variables.taskId, 'comments'] });
            toast.success('Đã xóa bình luận');
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi xóa bình luận')
    });

    const uploadFileMutation = useMutation({
        mutationFn: ({ taskId, file }: { taskId: string, file: File }) => boardApi.uploadFile(taskId, file),
        onSuccess: () => {
            toast.success('Tải tài liệu lên thành công');
            invalidateBoard();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || 'Lỗi tải lên tài liệu')
    });

    return {
        updateBoard: updateBoardMutation.mutate,
        createList: createListMutation.mutate,
        updateList: updateListMutation.mutate,
        deleteList: deleteListMutation.mutate,
        createTask: createTaskMutation.mutate,
        updateTask: updateTaskMutation.mutate,
        deleteTask: deleteTaskMutation.mutate,
        createComment: createCommentMutation.mutate,
        deleteComment: deleteCommentMutation.mutate,
        uploadFile: uploadFileMutation.mutate,

        // Trạng thái isPending để hiển thị loading UI
        isUpdatingBoard: updateBoardMutation.isPending,
        isCreatingList: createListMutation.isPending,
        isUpdatingList: updateListMutation.isPending,
        isDeletingList: deleteListMutation.isPending,
        isCreatingTask: createTaskMutation.isPending,
        isUpdatingTask: updateTaskMutation.isPending,
        isDeletingTask: deleteTaskMutation.isPending,
        isCreatingComment: createCommentMutation.isPending,
        isDeletingComment: deleteCommentMutation.isPending,
        isUploadingFile: uploadFileMutation.isPending,
    };
};
