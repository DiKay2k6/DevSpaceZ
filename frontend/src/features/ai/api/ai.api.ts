import axiosClient from '@/shared/api/axiosClient';

export const aiApi = {
    chat: (prompt: string) => {
        return axiosClient.post('/ai/chat', { prompt });
    },
    generateBoardTasks: (boardId: string, prompt: string, workspaceMembers?: any[]) => {
        return axiosClient.post('/ai/generate-board', { boardId, prompt, workspaceMembers });
    }
};
