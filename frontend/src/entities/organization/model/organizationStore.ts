import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Organization } from '@/features/organization/api/organization.api';

interface OrganizationState {
    currentOrganization: Organization | null;
    organizations: Organization[];
    setOrganizations: (orgs: Organization[]) => void;
    setCurrentOrganization: (org: Organization | null) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
    persist(
        (set) => ({
            currentOrganization: null,
            organizations: [],
            setOrganizations: (orgs) => set({ organizations: orgs }),
            setCurrentOrganization: (org) => set({ currentOrganization: org }),
        }),
        {
            name: 'organization-storage',
            partialize: (state) => ({ currentOrganization: state.currentOrganization }),
        }
    )
);
