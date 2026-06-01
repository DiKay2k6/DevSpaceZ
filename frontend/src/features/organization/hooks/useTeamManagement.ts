import { useState, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { organizationApi } from '@/features/organization/api/organization.api';
import { subTeamApi } from '@/features/organization/api/subteam.api';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { contactApi } from '@/features/contact/api/contact.api';
import { SearchedUser } from '@/features/workspace/api/workspace.api';
import { useAuthStore } from '@/entities/user/model/authStore';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/shared/utils/error';

export const useTeamManagement = () => {
    const { currentOrganization } = useOrganizationStore();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();
    
    // Modals & Drawers states
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isCreateSubTeamOpen, setIsCreateSubTeamOpen] = useState(false);
    const [managingSubTeam, setManagingSubTeam] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'members' | 'subteams' | 'roles'>('members');

    // Inline edit states
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<string>('Member');

    // Contacts search states
    const [searchEmail, setSearchEmail] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Queries
    const { data: members, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['org-members-workload', currentOrganization?._id],
        queryFn: () => organizationApi.getMembersWorkload(currentOrganization!._id),
        enabled: !!currentOrganization?._id
    });

    const { data: subteams, isLoading: isLoadingSubteams } = useQuery({
        queryKey: ['org-subteams', currentOrganization?._id],
        queryFn: () => subTeamApi.getSubTeamsByOrg(currentOrganization!._id),
        enabled: !!currentOrganization?._id
    });

    const { data: contacts, isLoading: isLoadingContacts } = useQuery({
        queryKey: ['personal-contacts'],
        queryFn: () => contactApi.getContacts(),
        enabled: !currentOrganization?._id
    });

    // Derived values
    const currentUserMember = members?.find(m => m.userId.email === currentUser?.email);
    const isManager = currentUserMember?.role === 'Manager' || currentUserMember?.role === 'Owner';

    // Contacts Handlers
    const handleSearchContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchEmail.trim()) return;
        setIsSearching(true);
        try {
            const users = await contactApi.searchUsers(searchEmail);
            setSearchedUsers(users);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tìm kiếm');
        } finally {
            setIsSearching(false);
        }
    };

    const { mutate: addContact, isPending: isAddingContact } = useMutation({
        mutationFn: contactApi.addContact,
        onSuccess: () => {
            toast.success('Đã thêm vào danh bạ');
            queryClient.invalidateQueries({ queryKey: ['personal-contacts'] });
            setSearchedUsers([]);
            setSearchEmail('');
        },
        onError: (err: any) => handleApiError(err)
    });

    const { mutate: removeContact, isPending: isRemovingContact } = useMutation({
        mutationFn: contactApi.removeContact,
        onSuccess: () => {
            toast.success('Đã xoá khỏi danh bạ');
            queryClient.invalidateQueries({ queryKey: ['personal-contacts'] });
        }
    });

    // Member Handlers
    const { mutate: removeMember, isPending: isRemoving } = useMutation({
        mutationFn: (userId: string) => organizationApi.removeMember(currentOrganization!._id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-members', currentOrganization?._id] });
            queryClient.invalidateQueries({ queryKey: ['org-members-workload', currentOrganization?._id] });
        }
    });

    const { mutate: updateMember, isPending: isUpdatingMember } = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: { role?: string } }) => 
            organizationApi.updateMember(currentOrganization!._id, userId, data),
        onSuccess: () => {
            toast.success('Đã cập nhật vai trò thành công');
            queryClient.invalidateQueries({ queryKey: ['org-members', currentOrganization?._id] });
            queryClient.invalidateQueries({ queryKey: ['org-members-workload', currentOrganization?._id] });
            setEditingUserId(null);
        },
        onError: (err: any) => handleApiError(err)
    });

    // Subteam Handlers
    const { mutate: createSubTeam, isPending: isCreatingSubTeam } = useMutation({
        mutationFn: async ({ name, description, userIds }: { name: string, description: string, userIds: string[] }) => {
            return await subTeamApi.createSubTeam({ name, description, orgId: currentOrganization!._id, userIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', currentOrganization?._id] });
            setIsCreateSubTeamOpen(false);
            toast.success('Tạo phòng ban thành công!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Không thể tạo phòng ban');
        }
    });

    return {
        currentOrganization,
        members,
        isLoadingMembers,
        subteams,
        isLoadingSubteams,
        contacts,
        isLoadingContacts,
        isManager,
        activeTab,
        setActiveTab,

        isInviteOpen,
        setIsInviteOpen,
        isCreateSubTeamOpen,
        setIsCreateSubTeamOpen,
        managingSubTeam,
        setManagingSubTeam,

        editingUserId,
        setEditingUserId,
        editRole,
        setEditRole,

        searchEmail,
        setSearchEmail,
        searchedUsers,
        setSearchedUsers,
        isSearching,
        handleSearchContact,

        addContact,
        isAddingContact,
        removeContact,
        isRemovingContact,

        removeMember,
        isRemoving,
        updateMember,
        isUpdatingMember,
        
        createSubTeam,
        isCreatingSubTeam
    };
};
