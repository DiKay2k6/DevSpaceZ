import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentApi, IDocument } from '../api/document.api';
import { organizationApi } from '@/features/organization/api/organization.api';
import toast from 'react-hot-toast';
import { X, UserPlus, Globe, Lock, Users, Loader2 } from 'lucide-react';

interface DocumentShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: IDocument;
    workspaceId: string;
    organizationId?: string;
}

export const DocumentShareModal: React.FC<DocumentShareModalProps> = ({
    isOpen,
    onClose,
    document,
    workspaceId,
    organizationId
}) => {
    const queryClient = useQueryClient();
    const [visibility, setVisibility] = useState(document.visibility || 'workspace');
    const [collaborators, setCollaborators] = useState<any[]>(document.collaborators || []);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor'>('viewer');

    const { data: membersRes, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['workspace-members', organizationId],
        queryFn: () => organizationApi.getMembers(organizationId!),
        enabled: !!organizationId
    });

    const members = membersRes || [];

    const updateMutation = useMutation({
        mutationFn: () => documentApi.updateCollaborators(
            document._id,
            visibility,
            collaborators.map(c => ({
                userId: c.userId._id || c.userId,
                role: c.role
            }))
        ),
        onSuccess: () => {
            toast.success('Đã cập nhật quyền chia sẻ');
            queryClient.invalidateQueries({ queryKey: ['document', document._id] });
            queryClient.invalidateQueries({ queryKey: ['documents', workspaceId] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    if (!isOpen) return null;

    const handleAddCollaborator = () => {
        if (!selectedUser) return;
        if (collaborators.some(c => (c.userId._id || c.userId) === selectedUser)) {
            toast.error('Người dùng này đã được thêm');
            return;
        }

        const userObj = members.find((m: any) => m.userId._id === selectedUser)?.userId;
        if (!userObj) return;

        setCollaborators([...collaborators, { userId: userObj, role: selectedRole }]);
        setSelectedUser('');
    };

    const handleRemoveCollaborator = (userId: string) => {
        setCollaborators(collaborators.filter(c => (c.userId._id || c.userId) !== userId));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#151A26] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-white">Chia sẻ "{document.title}"</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
                    {/* Quyền truy cập chung */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-medium text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Quyền truy cập chung</h3>
                        
                        <div className="flex flex-col gap-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${visibility === 'workspace' ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                <input type="radio" name="visibility" value="workspace" checked={visibility === 'workspace'} onChange={() => setVisibility('workspace')} className="hidden" />
                                <div className={`p-2 rounded-lg ${visibility === 'workspace' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                                    <Globe size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Trong dự án</p>
                                    <p className="text-xs text-slate-500">Mọi người trong dự án đều có thể xem.</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${visibility === 'restricted' ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                <input type="radio" name="visibility" value="restricted" checked={visibility === 'restricted'} onChange={() => setVisibility('restricted')} className="hidden" />
                                <div className={`p-2 rounded-lg ${visibility === 'restricted' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Bị hạn chế</p>
                                    <p className="text-xs text-slate-500">Chỉ những người được thêm mới có quyền xem.</p>
                                </div>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${visibility === 'private' ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30' : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                                <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="hidden" />
                                <div className={`p-2 rounded-lg ${visibility === 'private' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">Chỉ mình tôi</p>
                                    <p className="text-xs text-slate-500">Chỉ bạn (và Quản lý) mới có thể xem.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Thêm người vào tài liệu */}
                    {visibility === 'restricted' && (
                        <div className="flex flex-col gap-3">
                            <h3 className="font-medium text-sm text-slate-600 dark:text-slate-300 uppercase tracking-wider">Cộng tác viên</h3>
                            
                            <div className="flex gap-2">
                                <select 
                                    className="flex-1 bg-slate-50 dark:bg-[#111520] border border-slate-200 dark:border-white/10 rounded-xl px-3 outline-none text-sm"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                >
                                    <option value="">Chọn thành viên...</option>
                                    {members.map((m: any) => (
                                        <option key={m.userId._id} value={m.userId._id}>{m.userId.fullname || m.userId.full_name} ({m.userId.email})</option>
                                    ))}
                                </select>
                                <select 
                                    className="w-32 bg-slate-50 dark:bg-[#111520] border border-slate-200 dark:border-white/10 rounded-xl px-3 outline-none text-sm"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as any)}
                                >
                                    <option value="viewer">Chỉ xem</option>
                                    <option value="editor">Chỉnh sửa</option>
                                </select>
                                <button 
                                    onClick={handleAddCollaborator}
                                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                {collaborators.map(c => {
                                    const uid = c.userId._id || c.userId;
                                    const uName = c.userId.fullname || c.userId.full_name || 'Người dùng';
                                    
                                    return (
                                        <div key={uid} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {uName.charAt(0)}
                                                </div>
                                                <span className="font-medium text-sm">{uName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 bg-slate-200 dark:bg-white/10 px-2 py-1 rounded-md">
                                                    {c.role === 'editor' ? 'Chỉnh sửa' : 'Chỉ xem'}
                                                </span>
                                                <button onClick={() => handleRemoveCollaborator(uid)} className="text-rose-500 hover:text-rose-600">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {collaborators.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">Chưa có cộng tác viên nào.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3 bg-slate-50 dark:bg-[#111520]">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-2"
                    >
                        {updateMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};
