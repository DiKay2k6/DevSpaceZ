import axiosClient from '@/shared/api/axiosClient';
import { User } from '@/entities/user/model/authStore';

export interface UpdateProfilePayload {
    full_name: string;
    specialization?: string;
}

export const userApi = {
    updateProfile: (data: UpdateProfilePayload): Promise<{ data: { user: User } }> => {
        return axiosClient.put('/users/me', data);
    },

    uploadAvatar: (file: File): Promise<{ data: { user: User } }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        return axiosClient.post('/users/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    changePassword: (data: any): Promise<{ status: string; message: string }> => {
        return axiosClient.put('/users/me/password', data);
    },

    togglePinBoard: async (boardId: string): Promise<{ data: { pinned_boards: string[] } }> => {
        const response: any = await axiosClient.post(`/users/me/pinned-boards/${boardId}`);
        return response;
    }
};
