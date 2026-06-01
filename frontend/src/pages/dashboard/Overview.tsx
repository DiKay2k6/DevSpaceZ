import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useBoards, BOARD_KEYS } from '@/features/board/hooks/useBoards';
import { LayoutDashboard, Plus, Loader2, AlertCircle, CheckCircle2, Clock, Users, ArrowRight, Zap, FolderKanban, Cloud } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { boardApi } from '@/features/board/api/board.api';
import { workspaceApi } from '@/features/workspace/api/workspace.api';
import { CreateBoardModal } from '@/features/board/components/CreateBoardModal';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { dashboardApi } from '@/features/dashboard/api/dashboard.api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { useRoles } from '@/features/organization/hooks/useRoles';
import { toast } from 'react-hot-toast';

class ChartErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
    constructor(props: {children: React.ReactNode}) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Recharts Error Caught by Boundary:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return <div className="absolute inset-0 flex items-center justify-center text-sm text-red-400 italic bg-red-500/5 rounded-xl border border-red-500/20">Lỗi hiển thị biểu đồ</div>;
        }
        return this.props.children;
    }
}

export const Overview: React.FC = () => {
    const { user } = useAuthStore();
    const { currentOrganization } = useOrganizationStore();
    const { data: boards, isLoading, isError } = useBoards(currentOrganization?._id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const currentUserOrgRole = currentOrganization?.members?.find((m: any) => 
        m.userId?._id === user?._id || m.userId === user?._id
    )?.role;
    
    const { roles } = useRoles(currentOrganization?._id);

    const hasPermission = (permissionCode: string) => {
        if (!currentOrganization) return true; // Cá nhân thì full quyền
        if (currentUserOrgRole && ['Manager', 'Owner'].includes(currentUserOrgRole)) return true;
        const roleDef = roles?.find(r => r.name === currentUserOrgRole);
        if (!roleDef) return false;
        return roleDef.permissions?.includes(permissionCode as any) || false;
    };

    const canCreateBoard = hasPermission('board:create');

    const { mutate: createBoard, isPending: isCreating } = useMutation({
        mutationFn: boardApi.createBoard,
        onSuccess: (newBoard) => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
            // Chuyển thẳng người dùng tới bảng vừa tạo
            navigate(`/dashboard/board/${newBoard._id}`);
        }
    });

    const handleCreateBoard = (title: string, description: string, orgId: string | null) => {
        const payload: { title: string; description: string; orgId?: string } = { title, description };
        if (orgId) {
            payload.orgId = orgId;
        }
        createBoard(payload);
    };

    const workspaceId = boards && boards.length > 0 
        ? (typeof boards[0].workspaceId === 'object' ? (boards[0].workspaceId as any)._id : boards[0].workspaceId)
        : null;

    const { data: activities } = useQuery({
        queryKey: ['all-activities', currentOrganization?._id],
        queryFn: () => workspaceApi.getAllActivities(currentOrganization?._id),
        refetchInterval: 10000 // Tự làm mới mỗi 10 giây
    });

    const { data: metrics } = useQuery({
        queryKey: ['dashboard-metrics', currentOrganization?._id],
        queryFn: () => dashboardApi.getDashboardMetrics(currentOrganization?._id),
        refetchInterval: 30000 // Làm mới mỗi 30 giây
    });

    const [showChart, setShowChart] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowChart(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981'];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Hero Section (Welcome) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-10 text-white shadow-xl shadow-blue-900/20">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-blue-50 mb-4">
                            <Zap size={14} className="text-yellow-400" /> Workspace của bạn
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                            Chào mừng trở lại, {user?.full_name?.split(' ').pop()}! 👋
                        </h1>
                        <p className="text-blue-100 max-w-xl text-sm sm:text-base">
                            Bức tranh toàn cảnh về các dự án và tiến độ công việc của bạn. Hãy giữ mọi thứ luôn được kiểm soát.
                        </p>
                    </div>
                    <div className="shrink-0 flex gap-3">
                        {canCreateBoard && (
                            <button 
                                className="group inline-flex items-center justify-center font-bold px-5 py-2.5 text-sm rounded-xl gap-2 bg-white text-blue-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ease-out"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                <Plus size={18} className="transition-transform duration-300 group-hover:rotate-180" />
                                Dự án mới
                            </button>
                        )}
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            {/* 2. Bento Grid: Metrics & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Metrics Column */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-500/20">
                            <FolderKanban size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{metrics?.overview.activeBoardsCount || boards?.length || 0}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dự án đang chạy</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 flex items-center justify-center mb-4 border border-green-100 dark:border-green-500/20">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{metrics?.overview.completedTasksThisWeek || 0}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Task hoàn thành tuần này</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 flex items-center justify-center mb-4 border border-orange-100 dark:border-orange-500/20">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{metrics?.overview.totalMembers || 0}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Thành viên trong Team</p>
                        </div>
                    </div>

                    {/* Burndown Chart */}
                    <div className="sm:col-span-2 bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col h-[300px]">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Burndown Chart (14 ngày)</h2>
                        <div className="flex-1 w-full h-full min-h-0 relative">
                            {showChart && metrics?.burndownData && metrics.burndownData.length > 0 ? (
                                <div className="absolute inset-0">
                                    <ChartErrorBoundary>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={metrics.burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                                labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                                            />
                                            <Area isAnimationActive={false} type="monotone" dataKey="remainingPoints" name="Điểm còn lại" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRemaining)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    </ChartErrorBoundary>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 italic">Chưa có dữ liệu thống kê</div>
                            )}
                        </div>
                    </div>

                    {/* Task Status Pie Chart */}
                    <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col h-[300px]">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">Phân bổ Trạng thái</h2>
                        <div className="flex-1 w-full h-full flex items-center justify-center -mt-4 min-h-0 relative">
                            {showChart && metrics?.statusDistribution && metrics.statusDistribution.length > 0 ? (
                                <div className="absolute inset-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={metrics.statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            isAnimationActive={false}
                                        >
                                            {metrics.statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '500' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 italic">Chưa có dữ liệu thống kê</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity Feed (Mock) */}
                <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm h-[200px] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">Hoạt động gần đây</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 relative z-10">
                        {activities && activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity._id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                        {activity.userId?.avatar_url ? (
                                            <img src={activity.userId.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            getInitials(activity.userId?.full_name || 'U')
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            <span className="font-semibold">{activity.userId?.full_name}</span> vừa {activity.action} <span className="font-medium text-slate-900 dark:text-white">{activity.targetName}</span>
                                        </p>
                                        <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true, locale: vi })}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-slate-400">
                                Chưa có hoạt động nào gần đây.
                            </div>
                        )}
                    </div>
                    {/* Fade overlay for bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-[#111520] to-transparent pointer-events-none z-10"></div>
                </div>
            </div>

            {/* 3. Boards List Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="text-blue-500" size={24} /> Danh sách Dự án
                    </h2>
                </div>

                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111520] rounded-3xl border border-slate-200 dark:border-white/5">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Đang tải danh sách dự án...</p>
                    </div>
                )}

                {isError && (
                    <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-900/30">
                        <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                        <p className="text-red-600 dark:text-red-400 font-bold">Đã có lỗi xảy ra khi tải dữ liệu!</p>
                        <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>Thử lại</Button>
                    </div>
                )}

                {!isLoading && !isError && boards?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#111520] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-[#151A26] flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 shadow-inner">
                            <FolderKanban className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Workspace trống</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8">
                            Nơi này trông thật yên tĩnh. Hãy bắt đầu bằng cách tạo một dự án mới và đưa những ý tưởng của bạn vào hiện thực!
                        </p>
                        <Button 
                            leftIcon={<Plus size={18} />}
                            onClick={() => setIsCreateModalOpen(true)}
                            size="lg"
                        >
                            Tạo Dự án đầu tiên
                        </Button>
                    </div>
                )}

                {!isLoading && boards && boards.length > 0 && (
                    <div className="space-y-8">
                        {/* KHÔNG GIAN CÁ NHÂN */}
                        {!currentOrganization && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-white/5 pb-2">Dự án Cá nhân</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {boards.filter(b => !(b.workspaceId as any)?.organizationId).map(board => (
                                        <Link 
                                            key={board._id} 
                                            to={`/dashboard/board/${board._id}`}
                                            className="group bg-white dark:bg-[#111520] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col h-[220px]"
                                        >
                                            {/* Board Header Background */}
                                            <div 
                                                className="h-24 w-full bg-slate-100 dark:bg-slate-800 relative transition-transform duration-500 group-hover:scale-105 origin-bottom"
                                                style={{
                                                    background: board.background || 'linear-gradient(to right, #3b82f6, #6366f1)',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                            </div>
                                            
                                            {/* Board Info */}
                                            <div className="p-5 flex-1 flex flex-col bg-white dark:bg-[#111520] relative z-10">
                                                <div className="flex items-start justify-between mb-1 gap-2">
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                        {board.title}
                                                    </h3>
                                                    {board.status === 'Completed' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">Hoàn tất</span>}
                                                    {board.status === 'In Progress' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">Đang làm</span>}
                                                    {board.status === 'Planning' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/20">Kế hoạch</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-auto leading-relaxed">
                                                    {board.description || 'Không có mô tả'}
                                                </p>
                                                
                                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                    <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                                        Vào bảng <ArrowRight size={14} className="ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                    
                                    {/* Quick Create Card */}
                                    <div 
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="bg-slate-100 dark:bg-[#151A26]/80 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex flex-col items-center justify-center h-[220px] cursor-pointer group"
                                    >
                                        <div className="w-14 h-14 rounded-full bg-white dark:bg-[#111520] border border-slate-300 dark:border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-blue-600 transition-transform shadow-md text-slate-500">
                                            <Plus size={28} />
                                        </div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Dự án Cá nhân mới</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* KHÔNG GIAN TỔ CHỨC */}
                        {currentOrganization && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-white/5 pb-2">
                                    Dự án Tổ chức {currentOrganization ? `(${currentOrganization.name})` : ''}
                                </h3>
                                
                                {boards.filter(b => (b.workspaceId as any)?.organizationId === currentOrganization._id).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-[#151A26]/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Tổ chức chưa có dự án nào.</p>
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            leftIcon={<Plus size={16} />}
                                            onClick={() => setIsCreateModalOpen(true)}
                                        >
                                            Tạo Dự án Tổ chức
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {boards.filter(b => (b.workspaceId as any)?.organizationId === currentOrganization._id).map(board => (
                                            <Link 
                                                key={board._id} 
                                                to={`/dashboard/board/${board._id}`}
                                                className="group bg-white dark:bg-[#111520] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col h-[220px]"
                                            >
                                                {/* Board Header Background */}
                                                <div 
                                                    className="h-24 w-full bg-slate-100 dark:bg-slate-800 relative transition-transform duration-500 group-hover:scale-105 origin-bottom"
                                                    style={{
                                                        background: board.background || 'linear-gradient(to right, #3b82f6, #6366f1)',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                                                </div>
                                                
                                                {/* Board Info */}
                                                <div className="p-5 flex-1 flex flex-col bg-white dark:bg-[#111520] relative z-10">
                                                    <div className="flex items-start justify-between mb-1 gap-2">
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                            {board.title}
                                                        </h3>
                                                        {board.status === 'Completed' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">Hoàn tất</span>}
                                                        {board.status === 'In Progress' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">Đang làm</span>}
                                                        {board.status === 'Planning' && <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 border border-slate-200 dark:border-white/20">Kế hoạch</span>}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-auto leading-relaxed">
                                                        {board.description || 'Không có mô tả'}
                                                    </p>
                                                    
                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                                                            Vào bảng <ArrowRight size={14} className="ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        
                                        {/* Quick Create Card for Org */}
                                        {canCreateBoard && (
                                            <div 
                                                onClick={() => setIsCreateModalOpen(true)}
                                                className="bg-slate-100 dark:bg-[#151A26]/80 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 flex flex-col items-center justify-center h-[220px] cursor-pointer group"
                                            >
                                                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#111520] border border-slate-300 dark:border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-blue-600 transition-transform shadow-md text-slate-500">
                                                    <Plus size={28} />
                                                </div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Tạo Dự án Tổ chức</h3>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CreateBoardModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateBoard}
                isLoading={isCreating}
            />
        </div>
    );
};

export default Overview;
