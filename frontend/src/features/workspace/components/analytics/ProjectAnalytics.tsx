import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/workspace/api/analytics.api';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2, LayoutDashboard } from 'lucide-react';

export const ProjectAnalytics: React.FC<{ orgId?: string }> = ({ orgId }) => {
    const [selectedBoardId, setSelectedBoardId] = useState<string>('all');
    const { data, isLoading, error } = useQuery({
        queryKey: ['analytics-projects', orgId, selectedBoardId],
        queryFn: () => analyticsApi.getProjectMetrics(orgId, selectedBoardId)
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
                Đã có lỗi xảy ra khi tải dữ liệu thống kê dự án.
            </div>
        );
    }

    const { boards, charts } = data;

    return (
        <div className="w-full">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="text-blue-500" />
                        Thống kê Dự án
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Phân tích chi tiết công việc theo bảng.</p>
                </div>
                
                {/* Board Selector */}
                <select 
                    value={selectedBoardId}
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:border-blue-500 dark:text-white min-w-[200px]"
                >
                    <option value="all">Tất cả dự án</option>
                    {boards.map(b => (
                        <option key={b._id} value={b._id}>{b.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Pie Chart */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Trạng thái công việc</h3>
                    <div className="h-[250px] w-full min-h-0 relative">
                        {showChart && charts?.statusDistribution && charts.statusDistribution.length > 0 ? (
                            <div className="absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={charts.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.statusDistribution.map((entry, index) => (
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
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">Chưa có dữ liệu</div>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                        {charts.statusDistribution.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>

                {/* Type Bar Chart */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Phân loại công việc</h3>
                    <div className="h-[250px] w-full min-h-0 relative">
                        {showChart && charts.typeDistribution && charts.typeDistribution.length > 0 ? (
                            <div className="absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.typeDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                        {charts.typeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">
                                Chưa có đủ dữ liệu.
                            </div>
                        )}
                    </div>
                </div>

                {/* Assignee Distribution Pie Chart */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Phân bổ nhân lực</h3>
                    <div className="h-[250px] w-full min-h-0 relative">
                        {showChart && charts?.assigneeDistribution && charts.assigneeDistribution.length > 0 ? (
                            <div className="absolute inset-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={charts.assigneeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.assigneeDistribution.map((entry, index) => (
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
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">Chưa có dữ liệu</div>
                        )}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                        {charts.assigneeDistribution?.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
