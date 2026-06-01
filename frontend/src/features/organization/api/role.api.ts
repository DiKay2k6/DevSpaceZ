import axiosClient from '@/shared/api/axiosClient';

export interface Role {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    organizationId: string;
    workspaceId?: string;
    permissions: string[];
    isSystemDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export const PERMISSIONS_LIST = [
    'board:create', 'board:edit', 'board:delete', 'board:view',
    'list:create', 'list:edit', 'list:delete',
    'task:create', 'task:edit', 'task:delete', 'task:move', 'task:assign',
    'member:invite', 'member:remove', 'member:change_role',
    'document:create', 'document:edit', 'document:delete', 'document:view',
    'analytics:view'
];

export const roleApi = {
    getRoles: async (orgId?: string, workspaceId?: string) => {
        const params = new URLSearchParams();
        if (orgId) params.append('organizationId', orgId);
        if (workspaceId) params.append('workspaceId', workspaceId);
        
        const response = await axiosClient.get(`/roles?${params.toString()}`);
        return (response as any).data.roles as Role[];
    },
    
    createRole: async (data: Partial<Role>) => {
        const response = await axiosClient.post('/roles', data);
        return (response as any).data.role as Role;
    },
    
    updateRole: async (id: string, data: Partial<Role>, orgId?: string, workspaceId?: string) => {
        const params = new URLSearchParams();
        if (orgId) params.append('organizationId', orgId);
        if (workspaceId) params.append('workspaceId', workspaceId);
        const response = await axiosClient.put(`/roles/${id}?${params.toString()}`, data);
        return (response as any).data.role as Role;
    },
    
    deleteRole: async (id: string, orgId?: string, workspaceId?: string) => {
        const params = new URLSearchParams();
        if (orgId) params.append('organizationId', orgId);
        if (workspaceId) params.append('workspaceId', workspaceId);
        const response = await axiosClient.delete(`/roles/${id}?${params.toString()}`);
        return (response as any).data;
    }
};
