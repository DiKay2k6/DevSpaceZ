import React, { useEffect, useState } from 'react';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';
import { useAuthStore } from '@/entities/user/model/authStore';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import api from '@/shared/api/axiosClient';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { MessageSquare, Briefcase, Mail, CheckCircle2, Clock, AlertCircle, Loader2, GitCommit, GitPullRequest, Activity, ChevronRight, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface UserProfileData {
    user: {
        _id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
        specialization?: string;
    };
    stats: {
        inProgress: number;
        done: number;
        overdue: number;
    };
    recentTasks: {
        _id: string;
        title: string;
        status: string;
        boardName: string;
    }[];
}

export const UserProfileModal: React.FC = () => {
    const { isOpen, userId, closeProfile } = useUserProfileStore();
    const { user: currentUser } = useAuthStore();
    const [data, setData] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [messaging, setMessaging] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        } else {
            setData(null);
        }
    }, [isOpen, userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users/${userId}/profile`);
            setData(res.data);
        } catch (error) {
            console.error(error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!userId || userId === currentUser?._id) return;
        try {
            setMessaging(true);
            const res = await api.post('/chat/conversations', { targetUserId: userId });
            const conversationId = res.data.conversation._id;
            closeProfile();
            navigate(`/dashboard/chat`, { state: { conversationId, targetUserId: userId } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
        } finally {
            setMessaging(false);
        }
    };

    if (!isOpen) return null;

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.charAt(0).toUpperCase();
    };

    return (
        <Modal isOpen={isOpen} onClose={closeProfile} className="max-w-2xl p-0 overflow-hidden bg-slate-50 dark:bg-[#0B0F19] border-0" hideHeader>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Đang tải hồ sơ...</p>
                </div>
            ) : data ? (
                <div className="flex flex-col relative w-full">
                    {/* Cover Banner */}
                    <div className="h-32 md:h-40 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-white/10 dark:bg-black/20" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <button 
                            onClick={closeProfile}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="px-6 md:px-8 pb-8">
                        {/* Avatar & Action Button */}
                        <div className="flex justify-between items-end -mt-12 md:-mt-16 mb-4 relative z-10">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-50 dark:border-[#0B0F19] bg-white dark:bg-slate-800 shadow-xl overflow-hidden flex items-center justify-center relative group">
                                {data.user.avatar_url ? (
                                    <>
                                        <img 
                                            src={getAvatarUrl(data.user.avatar_url)} 
                                            alt={data.user.full_name} 
                                            className="w-full h-full object-cover" 
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => { 
                                                e.currentTarget.style.display = 'none'; 
                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement; 
                                                if (fallback) fallback.style.display = 'flex'; 
                                            }}
                                        />
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white items-center justify-center text-3xl font-black hidden">
                                            {getInitials(data.user.full_name)}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl md:text-4xl font-black">
                                        {getInitials(data.user.full_name)}
                                    </div>
                                )}
                            </div>

                            {currentUser?._id !== userId && (
                                <Button 
                                    className="flex items-center gap-2 px-6 h-10 md:h-11 rounded-full shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all font-semibold"
                                    onClick={handleMessage}
                                    isLoading={messaging}
                                >
                                    <MessageSquare size={18} />
                                    <span className="hidden md:inline">Nhắn tin</span>
                                </Button>
                            )}
                        </div>

                        {/* Basic Info */}
                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                {data.user.full_name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-white/5 px-3 py-1.5 rounded-full">
                                    <Briefcase size={14} className="text-blue-500" /> 
                                    {data.user.specialization || 'Chưa có chuyên môn'}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail size={14} className="text-slate-400" /> {data.user.email}
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Clock className="text-blue-500" size={20} />
                                </div>
                                <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">{data.stats.inProgress}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Đang xử lý</span>
                            </div>
                            <div className="bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
                                    <CheckCircle2 className="text-emerald-500" size={20} />
                                </div>
                                <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">{data.stats.done}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hoàn thành</span>
                            </div>
                            <div className="bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                {data.stats.overdue > 0 && (
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-bl-full" />
                                )}
                                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2">
                                    <AlertCircle className="text-red-500" size={20} />
                                </div>
                                <span className="text-3xl font-black text-slate-800 dark:text-white mb-1">{data.stats.overdue}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quá hạn</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Recent Tasks */}
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Activity size={16} className="text-indigo-500" />
                                    Công việc gần đây
                                </h3>
                                <div className="bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm flex-1">
                                    {data.recentTasks.length > 0 ? (
                                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                                            {data.recentTasks.map(task => (
                                                <div key={task._id} className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                {task.title}
                                                            </span>
                                                            <span className="text-xs font-medium text-slate-500 mt-1 truncate">
                                                                Trong dự án: <span className="text-slate-700 dark:text-slate-300">{task.boardName}</span>
                                                            </span>
                                                        </div>
                                                        <span className="shrink-0 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
                                                <CheckCircle2 size={24} className="text-slate-400" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-500">Chưa có công việc nào</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Git Intelligence (Mock) */}
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <GitCommit size={16} className="text-emerald-500" />
                                    Hoạt động Code
                                </h3>
                                <div className="grid grid-rows-2 gap-4 flex-1">
                                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-[#111520] dark:to-[#0B0F19] rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group shadow-md">
                                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                            <GitCommit size={100} className="text-white" />
                                        </div>
                                        <div className="relative z-10 flex flex-col">
                                            <span className="text-white/60 text-[11px] font-bold uppercase tracking-wider mb-1">Commits tuần qua</span>
                                            <span className="text-4xl font-black text-white">{(data.user._id.charCodeAt(data.user._id.length - 1) % 40) + 12}</span>
                                        </div>
                                        <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 text-white">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group shadow-md">
                                        <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                                            <GitPullRequest size={100} className="text-white" />
                                        </div>
                                        <div className="relative z-10 flex flex-col">
                                            <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-1">PRs Đã Merge</span>
                                            <span className="text-4xl font-black text-white">{(data.user._id.charCodeAt(0) % 15) + 3}</span>
                                        </div>
                                        <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 text-white">
                                            <ChevronRight size={24} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                    </div>
                    <p className="text-slate-800 dark:text-white text-lg font-bold mb-2">Không thể tải thông tin hồ sơ</p>
                    <p className="text-slate-500 text-sm">Người dùng này có thể đã bị xóa hoặc xảy ra lỗi kết nối mạng. Vui lòng thử lại sau.</p>
                </div>
            )}
        </Modal>
    );
};
