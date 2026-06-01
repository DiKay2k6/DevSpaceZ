import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/features/board/api/board.api';
import { Button } from '@/shared/ui/Button';
import { Check, X, Bell, UserPlus, UserMinus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    boardId: string;
    trigger: React.ReactNode;
}

export const TaskRequestsDialog: React.FC<Props> = ({ boardId, trigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['taskRequests', boardId],
        queryFn: () => boardApi.getPendingRequests(boardId)
    });

    const processMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'Approved' | 'Rejected' }) => boardApi.processRequest(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskRequests', boardId] });
            queryClient.invalidateQueries({ queryKey: ['board', boardId] }); // Tải lại board để thấy assignee mới
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const handleProcess = (id: string, status: 'Approved' | 'Rejected') => {
        if (status === 'Rejected') {
            if (!window.confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
        }
        processMutation.mutate({ id, status });
    };

    return (
        <div className="relative">
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
                {requests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center border-2 border-[#1E293B]">
                        {requests.length}
                    </span>
                )}
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-[340px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Bell size={16} className="text-blue-500" />
                                Yêu cầu tham gia/rời thẻ
                            </h3>
                        </div>
                        
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {isLoading ? (
                                <div className="p-4 text-center text-sm text-slate-500">Đang tải...</div>
                            ) : requests.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400">
                                        <Check size={24} />
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Không có yêu cầu nào</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {requests.map(req => (
                                        <div key={req._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 flex flex-col gap-3">
                                            <div className="flex gap-3 items-start">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${req.type === 'Join' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                    {req.type === 'Join' ? <UserPlus size={16} /> : <UserMinus size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        <span className="font-bold text-slate-900 dark:text-white">{(req.userId as any)?.full_name || 'User'}</span>
                                                        {req.type === 'Join' ? ' xin tham gia thẻ ' : ' xin rời thẻ '}
                                                        <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">{(req.taskId as any)?.title}</span>
                                                    </p>
                                                    {req.reason && (
                                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-black/20 p-2 rounded-md italic border border-slate-200 dark:border-white/5">
                                                            "{req.reason}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pl-11">
                                                <button 
                                                    onClick={() => handleProcess(req._id, 'Approved')}
                                                    disabled={processMutation.isPending}
                                                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Check size={14} /> Duyệt
                                                </button>
                                                <button 
                                                    onClick={() => handleProcess(req._id, 'Rejected')}
                                                    disabled={processMutation.isPending}
                                                    className="flex-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <X size={14} /> Từ chối
                                                </button>
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
