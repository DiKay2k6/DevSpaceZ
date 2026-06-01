import axiosClient from '@/shared/api/axiosClient';

export interface SearchedUser {
    _id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: 'Manager' | 'Developer' | 'Viewer';
}

export interface Workspace {
    _id: string;
    name: string;
    projectKey: string;
    organizationId: string;
    isCloud?: boolean;
    description?: string;
}

export interface WorkspaceMember {
    userId: SearchedUser;
    role: 'Manager' | 'Leader' | 'Developer' | 'Viewer';
    obsTitle?: string;
    isBlockedFromIDE?: boolean;
    _id: string;
}

export interface MemberWorkload {
    activeTasksCount: number;
    activeStoryPoints: number;
    participatedBoards: { _id: string; title: string }[];
    isOverloaded: boolean;
}

export interface WorkspaceMemberWorkload extends WorkspaceMember {
    workload: MemberWorkload;
}

export interface ActivityLog {
    _id: string;
    workspaceId: string;
    userId: SearchedUser;
    action: string;
    targetName: string;
    targetType: string;
    createdAt: string;
}

export const workspaceApi = {
    getWorkspaces: async (orgId?: string): Promise<Workspace[]> => {
        const url = orgId ? `/workspaces?orgId=${orgId}` : '/workspaces';
        const response: any = await axiosClient.get(url);
        return response.data || [];
    },
    searchUsers: async (email: string): Promise<SearchedUser[]> => {
        const response: any = await axiosClient.get(`/users/search?email=${encodeURIComponent(email)}`);
        return response.data?.users || [];
    },
    addMember: async (workspaceId: string, userId: string): Promise<void> => {
        await axiosClient.post(`/workspaces/${workspaceId}/members`, { userId });
    },
    removeMember: async (workspaceId: string, userId: string): Promise<void> => {
        await axiosClient.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },
    getActivities: async (workspaceId: string): Promise<ActivityLog[]> => {
        const response = await axiosClient.get(`/workspaces/${workspaceId}/activities`);
        return (response as any).data || [];
    },
    getMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
        const response = await axiosClient.get(`/workspaces/${workspaceId}/members`);
        return (response as any).data || [];
    },
    getMembersWorkload: async (workspaceId: string): Promise<WorkspaceMemberWorkload[]> => {
        const response = await axiosClient.get(`/workspaces/${workspaceId}/workload`);
        return (response as any).data || [];
    },
    updateMember: async (workspaceId: string, userId: string, data: { role?: string; obsTitle?: string; isBlockedFromIDE?: boolean }): Promise<void> => {
        await axiosClient.put(`/workspaces/${workspaceId}/members/${userId}`, data);
    },
    addSubTeam: async (workspaceId: string, subTeamId: string): Promise<void> => {
        await axiosClient.post(`/workspaces/${workspaceId}/subteams`, { subTeamId });
    },
    removeSubTeam: async (workspaceId: string, subTeamId: string): Promise<void> => {
        await axiosClient.delete(`/workspaces/${workspaceId}/subteams/${subTeamId}`);
    },
    getAllActivities: async (orgId?: string): Promise<ActivityLog[]> => {
        const url = orgId ? `/workspaces/all/activities?orgId=${orgId}` : '/workspaces/all/activities';
        const response: any = await axiosClient.get(url);
        return response.data || [];
    },
    createCloudWorkspace: async (payload: { name: string; description?: string; orgId?: string; language?: string }): Promise<Workspace> => {
        const response: any = await axiosClient.post('/workspaces/cloud', payload);
        return response.data;
    }
};
