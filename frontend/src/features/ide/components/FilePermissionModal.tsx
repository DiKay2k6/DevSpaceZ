import React, { useEffect, useState } from 'react';
import { X, Shield, Lock, EyeOff, Check, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/shared/api/axiosClient';
import { workspaceApi } from '@/features/workspace/api/workspace.api';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    filePath: string;
}

export const FilePermissionModal: React.FC<Props> = ({ isOpen, onClose, workspaceId, filePath }) => {
    const queryClient = useQueryClient();
    const [restrictedRead, setRestrictedRead] = useState<string[]>([]);
    const [restrictedWrite, setRestrictedWrite] = useState<string[]>([]);

    // 1. Fetch workspace members
    const { data: members, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: () => workspaceApi.getMembers(workspaceId),
        enabled: isOpen
    });

    // 2. Fetch file permissions
    const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
        queryKey: ['file-permissions', workspaceId, filePath],
        queryFn: async () => {
            const res = await axiosClient.get(`/workspaces/${workspaceId}/files/permissions?path=${encodeURIComponent(filePath)}`);
            return res.data.data;
        },
        enabled: isOpen
    });

    useEffect(() => {
        if (permissions) {
            setRestrictedRead(permissions.restrictedRead || []);
            setRestrictedWrite(permissions.restrictedWrite || []);
        }
    }, [permissions]);

    const { mutate: savePermissions, isPending } = useMutation({
        mutationFn: async () => {
            await axiosClient.put(`/workspaces/${workspaceId}/files/permissions`, {
                path: filePath,
                restrictedRead,
                restrictedWrite
            });
        },
        onSuccess: () => {
            toast.success('Đã lưu cấu hình phân quyền!');
            queryClient.invalidateQueries({ queryKey: ['file-permissions', workspaceId, filePath] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu quyền');
        }
    });

    if (!isOpen) return null;

    const toggleRead = (userId: string) => {
        // Nếu chặn đọc -> tự động chặn ghi
        if (restrictedRead.includes(userId)) {
            setRestrictedRead(prev => prev.filter(id => id !== userId));
        } else {
            setRestrictedRead(prev => [...prev, userId]);
            if (!restrictedWrite.includes(userId)) {
                setRestrictedWrite(prev => [...prev, userId]);
            }
        }
    };

    const toggleWrite = (userId: string) => {
        if (restrictedWrite.includes(userId)) {
            setRestrictedWrite(prev => prev.filter(id => id !== userId));
            // Nếu mở chặn ghi -> tự động mở chặn đọc
            if (restrictedRead.includes(userId)) {
                setRestrictedRead(prev => prev.filter(id => id !== userId));
            }
        } else {
            setRestrictedWrite(prev => [...prev, userId]);
        }
    };

    const validMembers = members?.filter((m: any) => m.userId && m.role !== 'Owner') || [];

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111520] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Phân quyền Truy cập</h2>
                            <p className="text-xs text-slate-500 truncate max-w-[300px]">{filePath}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {(isLoadingMembers || isLoadingPermissions) ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-4 px-3 mb-2 text-xs font-bold text-slate-500 uppercase">
                                <div className="col-span-8">Thành viên</div>
                                <div className="col-span-2 text-center" title="Bị cấm xem (Tự động cấm sửa)">Cấm Xem</div>
                                <div className="col-span-2 text-center" title="Bị cấm sửa (Read-only)">Cấm Sửa</div>
                            </div>
                            
                            {validMembers.map((member: any) => {
                                const userId = member.userId._id;
                                const isReadBlocked = restrictedRead.includes(userId);
                                const isWriteBlocked = restrictedWrite.includes(userId);
                                
                                return (
                                    <div key={userId} className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                                        <div className="col-span-8 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                                                {member.userId.avatar_url ? (
                                                    <img src={member.userId.avatar_url} alt="avt" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                                                        {member.userId.full_name?.substring(0, 2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">{member.userId.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="col-span-2 flex justify-center">
                                            <button 
                                                onClick={() => toggleRead(userId)}
                                                className={`p-1.5 rounded-md transition-colors ${isReadBlocked ? 'text-red-500 bg-red-100 dark:bg-red-500/20' : 'text-slate-300 hover:text-red-400'}`}
                                            >
                                                {isReadBlocked ? <EyeOff size={16} /> : <div className="w-4 h-4 border-2 border-current rounded-sm"></div>}
                                            </button>
                                        </div>
                                        
                                        <div className="col-span-2 flex justify-center">
                                            <button 
                                                onClick={() => toggleWrite(userId)}
                                                className={`p-1.5 rounded-md transition-colors ${isWriteBlocked ? 'text-amber-500 bg-amber-100 dark:bg-amber-500/20' : 'text-slate-300 hover:text-amber-400'}`}
                                            >
                                                {isWriteBlocked ? <Lock size={16} /> : <div className="w-4 h-4 border-2 border-current rounded-sm"></div>}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-200 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-[#151A26]">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm">
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={() => savePermissions()} 
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                    >
                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Lưu quyền
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
