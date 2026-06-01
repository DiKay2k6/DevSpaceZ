import axiosClient from '@/shared/api/axiosClient';
import { SearchedUser } from '@/features/workspace/api/workspace.api';

export const contactApi = {
    searchUsers: async (email: string) => {
        const res = await axiosClient.get(`/contacts/search?email=${email}`);
        return res.data as SearchedUser[];
    },
    
    getContacts: async () => {
        const res = await axiosClient.get('/contacts');
        return (res.data || []) as SearchedUser[];
    },

    addContact: async (friendId: string) => {
        const res = await axiosClient.post('/contacts', { friendId });
        return res.data;
    },

    removeContact: async (friendId: string) => {
        const res = await axiosClient.delete(`/contacts/${friendId}`);
        return res.data;
    }
};
