import axiosClient from '@/shared/api/axiosClient';

export interface IMessage {
    _id: string;
    boardId: string;
    senderId: {
        _id: string;
        full_name: string;
        avatar_url?: string;
        email: string;
    };
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'none';
    createdAt: string;
}

export const chatApi = {
    getMessages: (boardId: string, page = 1, limit = 50) => {
        return axiosClient.get(`/chat/${boardId}`, {
            params: { page, limit }
        });
    },

    sendMessage: (boardId: string, content: string, mediaUrl?: string, mediaType?: string) => {
        return axiosClient.post('/chat', {
            boardId,
            content,
            mediaUrl,
            mediaType
        });
    },

    uploadMedia: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/upload/chat', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
