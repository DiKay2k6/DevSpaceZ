import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/workspace/api/analytics.api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Loader2, Users } from 'lucide-react';

export const TeamAnalytics: React.FC<{ orgId?: string }> = ({ orgId }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-teams', orgId, selectedTeamId],
        queryFn: () => analyticsApi.getTeamMetrics(orgId, selectedTeamId)
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
                Đã có lỗi xảy ra khi tải dữ liệu thống kê phòng ban.
            </div>
        );
    }

    const { subTeams, charts } = data;

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-500" />
                        Khối lượng công việc & Tiến độ
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Tỷ lệ hoàn thành toàn team: <span className="font-bold text-emerald-500">{data.completionRate}%</span>
                    </p>
                </div>
                
                {/* Team Selector */}
                {subTeams && subTeams.length > 0 && (
                    <select 
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-blue-500 dark:text-white min-w-[200px]"
                    >
                        <option value="all">Tất cả phòng ban</option>
                        {subTeams.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="h-[400px] w-full min-h-0 relative">
                    {showChart && charts.workload && charts.workload.length > 0 ? (
                        <div className="absolute inset-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.workload} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={100} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="doneTasks" name="Đã hoàn thành" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={20} />
                                <Bar dataKey="inProgressTasks" name="Đang làm" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">
                            Chưa có dữ liệu thành viên hoặc không có công việc nào.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
