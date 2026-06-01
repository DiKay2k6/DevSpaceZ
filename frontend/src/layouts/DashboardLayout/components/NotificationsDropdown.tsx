import React, { useState } from 'react';
import { Bell, Check, X, CheckCircle2, Building2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/features/notification/api/notification.api';
import { organizationApi } from '@/features/organization/api/organization.api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export const NotificationsDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationApi.getNotifications,
        refetchInterval: 30000 // Tự làm mới mỗi 30s
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const acceptInviteMutation = useMutation({
        mutationFn: ({ orgId, notifId, action }: { orgId: string, notifId: string, action: 'accept' | 'decline' }) => 
            organizationApi.acceptInvite(orgId, notifId, action),
        onSuccess: (data, variables) => {
            toast.success(variables.action === 'accept' ? 'Đã tham gia tổ chức thành công!' : 'Đã từ chối lời mời');
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['organizations'] }); // Refresh organizations list
        },
        onError: (err: any) => {
            toast.error(err || 'Có lỗi xảy ra');
        }
    });

    const markAsReadMutation = useMutation({
        mutationFn: notificationApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: notificationApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#151A26] rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 z-50 overflow-hidden flex flex-col max-h-[500px]">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="font-bold text-slate-800 dark:text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => markAllAsReadMutation.mutate()}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Đánh dấu đã đọc tất cả
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto flex-1 p-2">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                                    <Bell size={32} className="opacity-20 mb-2" />
                                    <p className="text-sm font-medium">Bạn không có thông báo nào</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map(notif => (
                                        <div 
                                            key={notif._id} 
                                            onClick={() => !notif.isRead && markAsReadMutation.mutate(notif._id)}
                                            className={`p-3 rounded-xl transition-colors cursor-pointer ${notif.isRead ? 'opacity-60 hover:bg-slate-50 dark:hover:bg-white/5' : 'bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                                                    {notif.type === 'OrganizationInvite' ? <Building2 size={18} /> : <Bell size={18} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                                                        {notif.content}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                                                    </p>

                                                    {/* Khu vực Nút bấm cho Lời mời Organization */}
                                                    {notif.type === 'OrganizationInvite' && notif.actionStatus === 'pending' && notif.organizationId && (
                                                        <div className="flex gap-2 mt-3">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); acceptInviteMutation.mutate({ orgId: typeof notif.organizationId === 'string' ? notif.organizationId : (notif.organizationId as any)?._id, notifId: notif._id, action: 'accept' }); }}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                                            >
                                                                <Check size={14} /> Chấp nhận
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); acceptInviteMutation.mutate({ orgId: typeof notif.organizationId === 'string' ? notif.organizationId : (notif.organizationId as any)?._id, notifId: notif._id, action: 'decline' }); }}
                                                                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                                                            >
                                                                <X size={14} /> Từ chối
                                                            </button>
                                                        </div>
                                                    )}

                                                    {notif.type === 'OrganizationInvite' && notif.actionStatus === 'accepted' && (
                                                        <div className="flex items-center gap-1.5 mt-2 text-green-600 dark:text-green-400 text-xs font-bold">
                                                            <CheckCircle2 size={14} /> Đã tham gia
                                                        </div>
                                                    )}
                                                    
                                                    {notif.type === 'OrganizationInvite' && notif.actionStatus === 'declined' && (
                                                        <div className="flex items-center gap-1.5 mt-2 text-slate-500 text-xs font-bold">
                                                            <X size={14} /> Đã từ chối
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
