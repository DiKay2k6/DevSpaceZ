import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roleApi, Role } from '../api/role.api';
import toast from 'react-hot-toast';

export const ROLE_KEYS = {
    all: ['roles'] as const,
    byOrg: (orgId: string) => ['roles', { orgId }] as const,
    byWorkspace: (workspaceId: string) => ['roles', { workspaceId }] as const,
};

export const useRoles = (orgId?: string, workspaceId?: string) => {
    const queryClient = useQueryClient();

    const queryKey = workspaceId ? ROLE_KEYS.byWorkspace(workspaceId) : (orgId ? ROLE_KEYS.byOrg(orgId) : ROLE_KEYS.all);

    const rolesQuery = useQuery({
        queryKey,
        queryFn: () => roleApi.getRoles(orgId, workspaceId),
        enabled: !!orgId || !!workspaceId,
    });

    const createMutation = useMutation({
        mutationFn: roleApi.createRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
            toast.success('Tạo vai trò thành công!');
        },
        onError: (error: any) => {
            const errorMsg = typeof error === 'string' ? error : (error.response?.data?.message || 'Lỗi khi tạo vai trò');
            toast.error(errorMsg);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Role> }) => roleApi.updateRole(id, data, orgId, workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
            toast.success('Cập nhật vai trò thành công!');
        },
        onError: (error: any) => {
            const errorMsg = typeof error === 'string' ? error : (error.response?.data?.message || 'Lỗi khi cập nhật vai trò');
            toast.error(errorMsg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => roleApi.deleteRole(id, orgId, workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
            toast.success('Xóa vai trò thành công!');
        },
        onError: (error: any) => {
            const errorMsg = typeof error === 'string' ? error : (error.response?.data?.message || 'Lỗi khi xóa vai trò');
            toast.error(errorMsg);
        }
    });

    return {
        roles: rolesQuery.data || [],
        isLoading: rolesQuery.isLoading,
        createRole: createMutation.mutate,
        updateRole: updateMutation.mutate,
        deleteRole: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};
