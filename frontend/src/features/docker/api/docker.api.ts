import axiosClient from '@/shared/api/axiosClient';

export interface ContainerStats {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string;
    cpu: string;
    memUsage: string;
    memPerc: string;
    netIO: string;
}

export const dockerApi = {
    getStats: async (): Promise<{ data: ContainerStats[], isMock?: boolean }> => {
        const response: any = await axiosClient.get('/docker/stats');
        return { data: response.data, isMock: response.isMock };
    }
};
