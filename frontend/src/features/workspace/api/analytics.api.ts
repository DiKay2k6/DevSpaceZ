import axiosClient from '@/shared/api/axiosClient';

export interface AnalyticsOverview {
    summary: {
        totalBoards: number;
        totalTasks: number;
        myTasksCount: number;
        performance: number;
        overdueTasksCount: number;
    };
    charts: {
        priorityDistribution: { name: string; value: number; color: string }[];
        tasksByBoard: { name: string; tasks: number }[];
    };
}

export interface ProjectAnalytics {
    boards: { _id: string; title: string }[];
    charts: {
        statusDistribution: { name: string; value: number; color: string }[];
        typeDistribution: { name: string; value: number; color: string }[];
        assigneeDistribution: { name: string; value: number; color: string }[];
    };
}

export interface TeamAnalytics {
    subTeams: { _id: string; name: string }[];
    completionRate: number;
    charts: {
        workload: { name: string; doneTasks: number; inProgressTasks: number; totalTasks: number; avatar?: string }[];
    };
}

export const analyticsApi = {
    getOverviewMetrics: async (orgId?: string): Promise<AnalyticsOverview> => {
        const response = await axiosClient.get('/analytics/overview', { params: { orgId } });
        return response.data;
    },
    getProjectMetrics: async (orgId?: string, boardId?: string): Promise<ProjectAnalytics> => {
        const response = await axiosClient.get(`/analytics/projects`, { params: { orgId, boardId } });
        return response.data;
    },
    getTeamMetrics: async (orgId?: string, teamId?: string): Promise<TeamAnalytics> => {
        const response = await axiosClient.get(`/analytics/teams`, { params: { orgId, teamId } });
        return response.data;
    }
};
