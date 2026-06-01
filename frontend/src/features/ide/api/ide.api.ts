import axiosClient from '@/shared/api/axiosClient';

export interface ExecuteCodeResponse {
    status: string;
    data: {
        output: string;
        isError: boolean;
    };
}

export const ideApi = {
    executeCode: async (
        payload: { 
            code?: string, 
            files?: { [filename: string]: string }, 
            entrypoint?: string, 
            language: string 
        }
    ): Promise<ExecuteCodeResponse> => {
        const response = await axiosClient.post('/ide/execute', payload);
        return response.data;
    },

    // Cloud Workspace APIs
    getWorkspaceFiles: async (workspaceId: string) => {
        const response = await axiosClient.get(`/workspaces/${workspaceId}/workspace`);
        return response.data;
    },
    saveFile: async (workspaceId: string, path: string, content: string) => {
        const response = await axiosClient.put(`/workspaces/${workspaceId}/files`, { path, content });
        return response.data;
    },
    createFile: async (workspaceId: string, path: string, type: 'file' | 'directory') => {
        const response = await axiosClient.post(`/workspaces/${workspaceId}/files`, { path, type });
        return response.data;
    },
    deleteFile: async (workspaceId: string, path: string) => {
        const response = await axiosClient.delete(`/workspaces/${workspaceId}/files`, { params: { path } });
        return response.data;
    }
};
