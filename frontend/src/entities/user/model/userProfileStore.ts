import { create } from 'zustand';

interface UserProfileStore {
    isOpen: boolean;
    userId: string | null;
    openProfile: (userId: string) => void;
    closeProfile: () => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
    isOpen: false,
    userId: null,
    openProfile: (userId) => set({ isOpen: true, userId }),
    closeProfile: () => set({ isOpen: false, userId: null }),
}));
