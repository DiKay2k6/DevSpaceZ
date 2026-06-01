import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/workspace/api/analytics.api';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Layers, CheckCircle2, FolderGit2, Loader2, Target, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';

export const OverviewAnalytics: React.FC<{ orgId?: string }> = ({ orgId }) => {
    const { user } = useAuthStore();
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-overview', orgId],
        queryFn: () => analyticsApi.getOverviewMetrics(orgId)
    });

    const [showChart, setShowChart] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowChart(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-red-500">
                Đã có lỗi xảy ra khi tải dữ liệu thống kê tổng quan.
            </div>
        );
    }

    const { summary, charts } = data;

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Chào mừng trở lại, {user?.full_name}! 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Dưới đây là tổng quan về công việc của bạn trong DevSpaceZ.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SummaryCard 
                    icon={<FolderGit2 size={24} className="text-indigo-500" />}
                    title="Tổng số Bảng"
                    value={summary.totalBoards}
                    bgClass="bg-indigo-50 dark:bg-indigo-500/10"
                />
                <SummaryCard 
                    icon={<Layers size={24} className="text-blue-500" />}
                    title="Tổng số Thẻ"
                    value={summary.totalTasks}
                    bgClass="bg-blue-50 dark:bg-blue-500/10"
                />
                <SummaryCard 
                    icon={<Target size={24} className="text-amber-500" />}
                    title="Việc của tôi"
                    value={summary.myTasksCount}
                    bgClass="bg-amber-50 dark:bg-amber-500/10"
                />
                <SummaryCard 
                    icon={<CheckCircle2 size={24} className="text-emerald-500" />}
                    title="Hiệu suất thực tế"
                    value={`${summary.performance}%`}
                    bgClass="bg-emerald-50 dark:bg-emerald-500/10"
                />
                <SummaryCard 
                    icon={<AlertCircle size={24} className="text-rose-500" />}
                    title="Thẻ quá hạn"
                    value={summary.overdueTasksCount.toString()}
                    bgClass="bg-rose-50 dark:bg-rose-500/10"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Priority Pie Chart */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Mức độ ưu tiên</h3>
                    <div className="h-[250px] w-full min-h-0 relative">
                        {showChart && charts?.priorityDistribution && charts.priorityDistribution.length > 0 ? (
                            <div className="absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={charts.priorityDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.priorityDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">Chưa có dữ liệu thống kê</div>
                        )}
                    </div>
                    {/* Legend Custom */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                        {charts.priorityDistribution.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task by Board Bar Chart */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Phân bố công việc theo Bảng</h3>
                    <div className="h-[280px] w-full min-h-0 relative">
                        {showChart && charts.tasksByBoard && charts.tasksByBoard.length > 0 ? (
                            <div className="absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.tasksByBoard}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">
                                Chưa có đủ dữ liệu để hiển thị biểu đồ.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component cho Summary Card
const SummaryCard: React.FC<{ icon: React.ReactNode, title: string, value: number | string, bgClass: string }> = ({ icon, title, value, bgClass }) => (
    <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${bgClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);
