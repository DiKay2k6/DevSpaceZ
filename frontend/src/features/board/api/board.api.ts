import axiosClient from '@/shared/api/axiosClient';
import { SearchedUser } from '@/features/workspace/api/workspace.api';

export interface Attachment {
    _id: string;
    filename: string;
    url: string;
    mimetype: string;
    uploadedBy: string;
    createdAt: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    listId: string;
    boardId: string;
    order: number;
    priority: 'Low' | 'Medium' | 'High';
    type?: 'Task' | 'Feature' | 'Bug' | 'Chore' | 'Epic';
    status?: 'Not Started' | 'In Progress' | 'Review' | 'Done';
    parentId?: string;
    component?: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Design' | 'Other';
    assignees: SearchedUser[];
    startDate?: string;
    dueDate?: string;
    labels?: { _id?: string; text: string; color: string }[];
    storyPoints?: number;
    checklists?: { _id?: string; title: string; isCompleted: boolean }[];
    dependencies?: string[];
    attachments?: Attachment[];
}

export interface List {
    _id: string;
    title: string;
    boardId: string;
    order: number;
    wipLimit?: number | null;
    tasks: Task[];
}

export interface Workspace {
    _id: string;
    name: string;
    organizationId?: string;
    isCloud?: boolean;
    members: SearchedUser[];
}

export interface Comment {
    _id: string;
    taskId: string;
    userId: SearchedUser;
    content: string;
    createdAt: string;
}

export interface Board {
    _id: string;
    title: string;
    description?: string;
    background?: string;
    status: 'Planning' | 'In Progress' | 'Completed';
    workspaceId: string;
    ownerId: string;
    lists?: List[]; // Aggregated lists and tasks
    workspace?: Workspace;
    createdAt: string;
    updatedAt: string;
}

export interface TaskRequest {
    _id: string;
    taskId: Task;
    userId: SearchedUser;
    type: 'Join' | 'Leave';
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    createdAt: string;
}

export const boardApi = {
    getAllBoards: async (orgId?: string): Promise<Board[]> => {
        const url = orgId ? `/boards?orgId=${orgId}` : '/boards';
        const response: any = await axiosClient.get(url);
        return response.data?.boards || [];
    },
    getBoardDetails: async (id: string): Promise<Board> => {
        const response = await axiosClient.get(`/boards/${id}`);
        // Gắn thêm workspace vào board object để dễ truy xuất ở frontend
        return {
            ...response.data.board,
            workspace: response.data.workspace
        };
    },
    createBoard: async (data: { title: string; description?: string; orgId?: string; enableCloud?: boolean }): Promise<Board> => {
        const response = await axiosClient.post('/boards', data);
        return response.data.board;
    },
    updateBoard: async (id: string, data: Partial<Board>): Promise<Board> => {
        const response = await axiosClient.put(`/boards/${id}`, data);
        return response.data.board;
    },
    createList: async (data: { title: string; boardId: string }): Promise<List> => {
        const response = await axiosClient.post('/lists', data);
        return response.data.list;
    },
    updateList: async (id: string, data: Partial<List>): Promise<List> => {
        const response = await axiosClient.put(`/lists/${id}`, data);
        return response.data.list;
    },
    createTask: async (data: { title: string; listId: string; boardId: string }): Promise<Task> => {
        const response = await axiosClient.post('/tasks', data);
        return response.data.task;
    },
    updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
        const response = await axiosClient.put(`/tasks/${id}`, data);
        return response.data.task;
    },
    moveTask: async (items: { _id: string; listId: string; order: number }[]): Promise<void> => {
        await axiosClient.put('/tasks/move', { items });
    },
    moveList: async (items: { _id: string; order: number }[]): Promise<void> => {
        await axiosClient.put('/lists/move', { items });
    },
    deleteBoard: async (id: string): Promise<void> => {
        await axiosClient.delete(`/boards/${id}`);
    },
    deleteList: async (id: string): Promise<void> => {
        await axiosClient.delete(`/lists/${id}`);
    },
    deleteTask: async (id: string): Promise<void> => {
        await axiosClient.delete(`/tasks/${id}`);
    },
    uploadFile: async (taskId: string, file: File): Promise<Attachment> => {
        const formData = new FormData();
        formData.append('file', file);
        
        // Cần upload file lên server trước
        const uploadRes = await axiosClient.post('/upload', formData);

        // Backend trả về: { status: 'success', data: { filename, url, mimetype } }
        const attachmentData = uploadRes.data;
        
        // Gọi api update task để push attachment vào
        // (Hoặc backend upload đã tự push, tùy vào logic. Ở đây ta giả sử phải push)
        // Vì yêu cầu hiện tại backend chỉ upload lên, chưa nối vào task.
        // Ta cần có route nối vào task, hoặc sửa route upload.
        // Ở đây mình sẽ viết endpoint thêm attachment ở controller.
        const response = await axiosClient.post(`/tasks/${taskId}/attachments`, attachmentData);
        return response.data.attachment;
    },
    getComments: async (taskId: string): Promise<Comment[]> => {
        const response = await axiosClient.get(`/tasks/${taskId}/comments`);
        return response.data.comments;
    },
    createComment: async (taskId: string, content: string): Promise<Comment> => {
        const response = await axiosClient.post(`/tasks/${taskId}/comments`, { content });
        return response.data.comment;
    },
    deleteComment: async (taskId: string, commentId: string): Promise<void> => {
        await axiosClient.delete(`/tasks/${taskId}/comments/${commentId}`);
    },
    createTaskRequest: async (taskId: string, type: 'Join' | 'Leave', reason?: string): Promise<TaskRequest> => {
        const response: any = await axiosClient.post(`/tasks/${taskId}/requests`, { type, reason });
        return response.data;
    },
    getPendingRequests: async (boardId?: string): Promise<TaskRequest[]> => {
        const url = boardId ? `/tasks/requests/pending?boardId=${boardId}` : '/tasks/requests/pending';
        const response: any = await axiosClient.get(url);
        return response.data;
    },
    processRequest: async (requestId: string, status: 'Approved' | 'Rejected'): Promise<TaskRequest> => {
        const response: any = await axiosClient.patch(`/tasks/requests/${requestId}`, { status });
        return response.data;
    }
};
