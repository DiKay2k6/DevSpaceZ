import axiosClient from '@/shared/api/axiosClient';

export interface NotificationUser {
    _id: string;
    full_name: string;
    avatar_url?: string;
}

export interface NotificationWorkspace {
    _id: string;
    name: string;
}

export interface Notification {
    _id: string;
    userId: string;
    type: 'Mention' | 'TaskAssigned' | 'TaskUpdated' | 'WorkspaceInvite' | 'OrganizationInvite';
    content: string;
    isRead: boolean;
    relatedTaskId?: string;
    workspaceId?: NotificationWorkspace;
    organizationId?: NotificationWorkspace;
    senderId?: NotificationUser;
    actionStatus?: 'pending' | 'accepted' | 'declined';
    createdAt: string;
    updatedAt: string;
}

export const notificationApi = {
    getNotifications: async (): Promise<Notification[]> => {
        const response: any = await axiosClient.get('/notifications');
        return response.data || [];
    },
    markAsRead: async (notificationId: string): Promise<Notification> => {
        const response: any = await axiosClient.patch(`/notifications/${notificationId}/read`);
        return response.data;
    },
    markAllAsRead: async (): Promise<void> => {
        await axiosClient.patch('/notifications/read-all');
    }
};
