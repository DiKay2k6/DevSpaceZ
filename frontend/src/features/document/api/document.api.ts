import axiosClient from '@/shared/api/axiosClient';

export interface IDocument {
    _id: string;
    title: string;
    content: string;
    workspaceId: string;
    parentId?: string | null;
    isFolder?: boolean;
    visibility?: 'workspace' | 'private' | 'restricted';
    collaborators?: { userId: any; role: 'viewer' | 'editor' }[];
    createdAt: string;
    updatedAt: string;
}

export const documentApi = {
    getAll: async (workspaceId: string): Promise<IDocument[]> => {
        const response: any = await axiosClient.get(`/documents?workspaceId=${workspaceId}`);
        return response.data || [];
    },
    
    getById: async (id: string): Promise<IDocument> => {
        const response: any = await axiosClient.get(`/documents/${id}`);
        return response.data;
    },
    
    create: async (title: string, content: string, workspaceId: string): Promise<IDocument> => {
        const response: any = await axiosClient.post('/documents', { title, content, workspaceId });
        return response.data;
    },
    
    update: async (id: string, title: string, content: string): Promise<IDocument> => {
        const response: any = await axiosClient.put(`/documents/${id}`, { title, content });
        return response.data;
    },
    
    delete: async (id: string): Promise<void> => {
        await axiosClient.delete(`/documents/${id}`);
    },

    createFolder: async (title: string, workspaceId: string, parentId?: string | null): Promise<IDocument> => {
        const response: any = await axiosClient.post('/documents', { title, workspaceId, parentId, isFolder: true });
        return response.data;
    },

    move: async (id: string, parentId: string | null): Promise<IDocument> => {
        const response: any = await axiosClient.patch(`/documents/${id}/move`, { parentId });
        return response.data;
    },
    updateCollaborators: async (id: string, visibility: string, collaborators: any[]) => {
        const response = await axiosClient.patch(`/documents/${id}/collaborators`, { visibility, collaborators });
        return response.data;
    },
    importWord: async (file: File, workspaceId: string, parentId: string | null): Promise<IDocument> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workspaceId', workspaceId);
        if (parentId) formData.append('parentId', parentId);
        
        const response: any = await axiosClient.post('/documents/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    exportWord: async (id: string, filename: string): Promise<void> => {
        const response: any = await axiosClient.get(`/documents/${id}/export/word`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.docx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    },
    translateContent: async (html: string, to: 'vi' | 'en'): Promise<{ data: string }> => {
        const response: any = await axiosClient.post('/documents/translate', { html, to });
        return response;
    }
};
