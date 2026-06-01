import axiosClient from '@/shared/api/axiosClient';

export interface DashboardMetrics {
    overview: {
        totalMembers: number;
        activeBoardsCount: number;
        completedTasksThisWeek: number;
    };
    statusDistribution: Array<{ name: string; value: number }>;
    burndownData: Array<{ date: string; totalPoints: number; remainingPoints: number; completedPoints: number }>;
}

export const dashboardApi = {
    getDashboardMetrics: async (orgId?: string): Promise<DashboardMetrics> => {
        const url = orgId ? `/dashboard/metrics?orgId=${orgId}` : `/dashboard/metrics`;
        const response: any = await axiosClient.get(url);
        return response.data;
    }
};
