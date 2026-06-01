import axiosClient from '@/shared/api/axiosClient';

export interface SubTeamMember {
    userId: {
        _id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
    role: 'Leader' | 'Member';
    _id: string;
}

export interface SubTeam {
    _id: string;
    name: string;
    description?: string;
    organizationId: string;
    members: SubTeamMember[];
    createdAt: string;
    updatedAt: string;
}

export const subTeamApi = {
    getSubTeamsByOrg: async (orgId: string): Promise<SubTeam[]> => {
        const response = await axiosClient.get(`/subteams/org/${orgId}`);
        return response.data.subTeams;
    },
    
    createSubTeam: async (data: { name: string; description?: string; orgId: string, userIds?: string[] }): Promise<SubTeam> => {
        const response = await axiosClient.post('/subteams', data);
        return response.data.subTeam;
    },

    updateSubTeam: async (id: string, data: { name?: string; description?: string }): Promise<SubTeam> => {
        const response = await axiosClient.put(`/subteams/${id}`, data);
        return response.data.subTeam;
    },

    deleteSubTeam: async (id: string): Promise<void> => {
        await axiosClient.delete(`/subteams/${id}`);
    },

    addMembers: async (id: string, userIds: string[]): Promise<void> => {
        await axiosClient.post(`/subteams/${id}/members`, { userIds });
    },

    removeMember: async (id: string, userId: string): Promise<void> => {
        await axiosClient.delete(`/subteams/${id}/members/${userId}`);
    },

    updateMemberRole: async (id: string, userId: string, role: 'Leader' | 'Member', newOrgRole?: string): Promise<void> => {
        await axiosClient.put(`/subteams/${id}/members/${userId}/role`, { role, newOrgRole });
    }
};
