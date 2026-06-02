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
    getMessages: (chatId: string, isConversation: boolean, page = 1, limit = 50) => {
        return axiosClient.get(`/chat/messages`, {
            params: { 
                [isConversation ? 'conversationId' : 'boardId']: chatId,
                page, 
                limit 
            }
        });
    },

    sendMessage: (chatId: string, isConversation: boolean, content: string, mediaUrl?: string, mediaType?: string) => {
        return axiosClient.post('/chat/messages', {
            [isConversation ? 'conversationId' : 'boardId']: chatId,
            content,
            mediaUrl,
            mediaType
        });
    },

    getConversations: () => {
        return axiosClient.get('/chat/conversations');
    },

    findOrCreateConversation: (targetUserId: string) => {
        return axiosClient.post('/chat/conversations', { targetUserId });
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
