import axiosClient from '@/shared/api/axiosClient';

export interface OrganizationMember {
    userId: {
        _id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    role: 'Owner' | 'Manager' | 'Member';
    status: 'Pending' | 'Joined';
    _id: string;
    workload?: {
        activeTasksCount: number;
        activeStoryPoints: number;
        participatedBoards: { _id: string; title: string }[];
        isOverloaded?: boolean;
    };
    obsTitle?: string;
}

export interface Organization {
    _id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: OrganizationMember[];
    createdAt: string;
}

export const organizationApi = {
    getOrganizations: async (): Promise<Organization[]> => {
        const response: any = await axiosClient.get('/organizations');
        return response.data || [];
    },
    createOrganization: async (data: { name: string; description?: string }): Promise<Organization> => {
        const response: any = await axiosClient.post('/organizations', data);
        return response.data;
    },
    getMembers: async (organizationId: string): Promise<OrganizationMember[]> => {
        const response: any = await axiosClient.get(`/organizations/${organizationId}/members`);
        return response.data || [];
    },
    getMembersWorkload: async (organizationId: string): Promise<OrganizationMember[]> => {
        const response: any = await axiosClient.get(`/organizations/${organizationId}/workload`);
        return response.data || [];
    },
    addMember: async (organizationId: string, userId: string, role?: string): Promise<void> => {
        await axiosClient.post(`/organizations/${organizationId}/members`, { userId, role });
    },
    acceptInvite: async (organizationId: string, notificationId: string, action: 'accept' | 'decline'): Promise<void> => {
        await axiosClient.post(`/organizations/${organizationId}/accept-invite`, { notificationId, action });
    },
    removeMember: async (organizationId: string, userId: string): Promise<void> => {
        await axiosClient.delete(`/organizations/${organizationId}/members/${userId}`);
    },
    updateMember: async (organizationId: string, userId: string, data: { role?: string }): Promise<void> => {
        await axiosClient.put(`/organizations/${organizationId}/members/${userId}`, data);
    }
};
