import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dockerApi } from '@/features/docker/api/docker.api';
import { Server, Activity, Cpu, HardDrive, Wifi, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';

export const DockerMonitor: React.FC = () => {
    const { user } = useAuthStore();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['docker-stats'],
        queryFn: dockerApi.getStats,
        refetchInterval: 5000 // Tự làm mới mỗi 5 giây
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-slate-500 dark:text-slate-400">Đang kết nối tới Docker Daemon...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lỗi kết nối Docker</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    Hệ thống không thể giao tiếp với Docker API trên máy chủ. Vui lòng kiểm tra lại quyền truy cập hoặc trạng thái Docker.
                </p>
            </div>
        );
    }

    const containers = data?.data || [];
    const isMock = data?.isMock;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                        <Server size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Organization Infrastructure
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs uppercase tracking-wider font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Cloud
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Giám sát tài nguyên máy chủ và trạng thái các Workspace Container (LSP) của Tổ chức.</p>
                    </div>
                </div>
            </div>

            {/* Cảnh báo quyền truy cập */}
            {user?.role !== 'admin' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-200 p-4 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-bold">Trang quản trị cấp cao (Enterprise Level)</p>
                        <p className="text-sm mt-1">Tính năng này được thiết kế dành riêng cho Owner/Manager để giám sát cụm Cloud Server (Kubernetes/Docker Swarm) tập trung của Tổ chức, không phải dùng để theo dõi máy tính cá nhân của lập trình viên.</p>
                    </div>
                </div>
            )}

            {isMock && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="font-bold">Lưu ý: Môi trường Cloud Server hiện tại không hỗ trợ Docker</p>
                        <p className="text-sm mt-1">Backend đang chạy trên Render (PaaS) nên không có quyền truy cập vào Docker Daemon. Dưới đây là dữ liệu giả lập (Mock) của các Workspace Container để demo UI.</p>
                    </div>
                </div>
            )}

            {/* Containers List */}
            <div className="space-y-4">
                {containers.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-[#111520] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#151A26] flex items-center justify-center border border-slate-200 dark:border-white/5">
                                    <Activity className="text-blue-500" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{c.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{c.image} • {c.id.substring(0, 12)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold font-mono">
                                    {c.status}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${c.state === 'running' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                    {c.state}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-50 dark:bg-[#151A26] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <Cpu size={16} /> <span className="text-xs font-bold uppercase">CPU Usage</span>
                                </div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{c.cpu}</div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-[#151A26] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <HardDrive size={16} /> <span className="text-xs font-bold uppercase">Memory</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-500">{c.memPerc}</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono truncate" title={c.memUsage}>{c.memUsage}</div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: c.memPerc }}></div>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-[#151A26] rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                                    <Wifi size={16} /> <span className="text-xs font-bold uppercase">Network I/O</span>
                                </div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white font-mono truncate" title={c.netIO}>{c.netIO}</div>
                            </div>
                        </div>
                    </div>
                ))}

                {containers.length === 0 && (
                    <div className="bg-white dark:bg-[#111520] rounded-3xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <Server className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không có Container nào</h3>
                        <p className="text-slate-500 dark:text-slate-400">Hiện tại không có container nào đang chạy trên máy chủ này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DockerMonitor;
