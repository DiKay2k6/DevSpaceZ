import React, { useState } from 'react';
import { OverviewAnalytics } from '@/features/workspace/components/analytics/OverviewAnalytics';
import { ProjectAnalytics } from '@/features/workspace/components/analytics/ProjectAnalytics';
import { TeamAnalytics } from '@/features/workspace/components/analytics/TeamAnalytics';
import { BarChart3, LayoutDashboard, Users } from 'lucide-react';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { useEffect } from 'react';

type Tab = 'overview' | 'projects' | 'teams';

export const DashboardAnalytics: React.FC = () => {
    const { currentOrganization } = useOrganizationStore();
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    useEffect(() => {
        if (!currentOrganization && activeTab === 'teams') {
            setActiveTab('overview');
        }
    }, [currentOrganization, activeTab]);

    return (
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full h-full flex flex-col overflow-hidden">
            {/* Header & Tabs */}
            <div className="mb-6 shrink-0">
                <div className="flex border-b border-slate-200 dark:border-white/10 gap-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <BarChart3 size={18} />
                        Tổng quan
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`pb-4 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === 'projects'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        <LayoutDashboard size={18} />
                        Dự án
                    </button>
                    {currentOrganization && (
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={`pb-4 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                                activeTab === 'teams'
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                        >
                            <Users size={18} />
                            Phòng ban
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
                {activeTab === 'overview' && <OverviewAnalytics orgId={currentOrganization?._id} />}
                {activeTab === 'projects' && <ProjectAnalytics orgId={currentOrganization?._id} />}
                {activeTab === 'teams' && <TeamAnalytics orgId={currentOrganization?._id} />}
            </div>
        </div>
    );
};

export default DashboardAnalytics;
