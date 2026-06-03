import React, { useEffect, useState } from 'react';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';
import { useAuthStore } from '@/entities/user/model/authStore';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import api from '@/shared/api/axiosClient';
import { MessageSquare, Briefcase, Mail, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
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
            setData(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = async () => {
        if (!userId || userId === currentUser?._id) return;
        try {
            setMessaging(true);
            const res = await api.post('/chat/conversation', { targetUserId: userId });
            const conversationId = res.data.data.conversation._id;
            closeProfile();
            navigate(`/dashboard/chat`, { state: { conversationId, targetUserId: userId } });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
        } finally {
            setMessaging(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={closeProfile} title="Hồ sơ thành viên" size="md">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
                    <p className="text-slate-500">Đang tải thông tin...</p>
                </div>
            ) : data ? (
                <div className="flex flex-col">
                    {/* Header: Basic Info */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden shrink-0">
                            {data.user.avatar_url ? (
                                <img src={data.user.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                            ) : (
                                data.user.full_name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white truncate mb-1">{data.user.full_name}</h2>
                            <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 truncate">
                                    <Mail size={14} className="shrink-0" /> {data.user.email}
                                </div>
                                <div className="flex items-center gap-1.5 truncate">
                                    <Briefcase size={14} className="shrink-0" /> {data.user.specialization || 'Chưa cập nhật chuyên môn'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                            <Clock className="text-blue-500 mb-1" size={20} />
                            <span className="text-2xl font-black text-blue-700 dark:text-blue-400">{data.stats.inProgress}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70">Đang xử lý</span>
                        </div>
                        <div className="bg-green-50/50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                            <CheckCircle2 className="text-green-500 mb-1" size={20} />
                            <span className="text-2xl font-black text-green-700 dark:text-green-400">{data.stats.done}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-600/70 dark:text-green-400/70">Hoàn thành</span>
                        </div>
                        <div className="bg-red-50/50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-3 flex flex-col items-center justify-center">
                            <AlertCircle className="text-red-500 mb-1" size={20} />
                            <span className="text-2xl font-black text-red-700 dark:text-red-400">{data.stats.overdue}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600/70 dark:text-red-400/70">Quá hạn</span>
                        </div>
                    </div>

                    {/* Recent Tasks */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3">Công việc gần đây</h3>
                        {data.recentTasks.length > 0 ? (
                            <div className="space-y-2">
                                {data.recentTasks.map(task => (
                                    <div key={task._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200 truncate text-sm">{task.title}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">Dự án: {task.boardName}</span>
                                        </div>
                                        <span className="shrink-0 px-2 py-1 bg-slate-200 dark:bg-white/10 rounded text-[10px] font-bold uppercase">{task.status}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">
                                Chưa có công việc nào đang làm
                            </div>
                        )}
                    </div>

                    {/* Action */}
                    {currentUser?._id !== userId && (
                        <Button 
                            className="w-full flex items-center justify-center gap-2 h-11 text-base font-semibold"
                            onClick={handleMessage}
                            isLoading={messaging}
                        >
                            <MessageSquare size={18} />
                            Nhắn tin trực tiếp
                        </Button>
                    )}
                </div>
            ) : null}
        </Modal>
    );
};
