import { getAvatarUrl } from "@/shared/utils/avatar";
import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/features/organization/api/organization.api';
import { workspaceApi } from '@/features/workspace/api/workspace.api';
import { useRoles } from '@/features/organization/hooks/useRoles';
import { Button } from '@/shared/ui/Button';
import { handleApiError } from '@/shared/utils/error';
import { createPortal } from 'react-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
}

export const InviteMemberModal: React.FC<Props> = ({ isOpen, onClose, organizationId }) => {
    const [emailQuery, setEmailQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
    const queryClient = useQueryClient();
    const { roles } = useRoles(organizationId);

    // Debounce hoặc search trực tiếp khi gõ đủ dài
    const { data: users, isLoading: isSearching } = useQuery({
        queryKey: ['users', 'search', emailQuery],
        queryFn: () => workspaceApi.searchUsers(emailQuery),
        enabled: emailQuery.length > 2,
    });

    const { mutate: addMember, isPending: isAdding } = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role?: string }) => organizationApi.addMember(organizationId, userId, role),
        onSuccess: () => {
            setSuccessMsg('Đã mời thành viên thành công!');
            setErrorMsg(null);
            setEmailQuery('');
            queryClient.invalidateQueries({ queryKey: ['org-members', organizationId] });
            queryClient.invalidateQueries({ queryKey: ['org-members-workload', organizationId] });
            setTimeout(() => {
                setSuccessMsg(null);
                onClose();
            }, 1500);
        },
        onError: (err) => {
            setErrorMsg(handleApiError(err));
            setSuccessMsg(null);
        }
    });

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserPlus size={20} className="text-blue-500" />
                        Mời vào Workspace
                    </h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {successMsg && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle2 size={16} /> {successMsg}
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={emailQuery}
                            onChange={(e) => setEmailQuery(e.target.value)}
                            placeholder="Nhập tên hoặc email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="max-h-[250px] overflow-y-auto space-y-2 custom-scrollbar">
                        {isSearching && <p className="text-center text-sm font-semibold text-slate-500 py-6 animate-pulse">Đang tìm kiếm...</p>}
                        {!isSearching && users?.length === 0 && emailQuery.length > 2 && (
                            <p className="text-center text-sm font-semibold text-slate-500 py-6">Không tìm thấy thành viên phù hợp.</p>
                        )}
                        {!isSearching && users?.map(user => (
                            <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <img 
                                        crossOrigin="anonymous"
                                        src={user.avatar_url ? getAvatarUrl(user.avatar_url) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.full_name)}&backgroundColor=6366f1&textColor=ffffff`} 
                                        alt="Avatar" 
                                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-[#111520] shadow-sm shrink-0"
                                    />
                                    <div className="min-w-0 pr-2">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{user.full_name}</h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <select
                                        className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1A202C] text-slate-800 dark:text-white rounded px-2 py-1.5 outline-none focus:border-blue-500"
                                        value={selectedRoles[user._id] || 'Developer'}
                                        onChange={(e) => setSelectedRoles({ ...selectedRoles, [user._id]: e.target.value })}
                                    >
                                        <option value="Developer">Developer</option>
                                        <option value="Viewer">Viewer</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Leader">Leader</option>
                                        {roles?.map(r => (
                                            !['Developer', 'Viewer', 'Manager', 'Leader', 'Owner'].includes(r.name) &&
                                            <option key={r._id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                    <Button 
                                        size="sm" 
                                        onClick={() => addMember({ userId: user._id, role: selectedRoles[user._id] || 'Developer' })}
                                        isLoading={isAdding}
                                        className="px-4 py-1.5 h-auto text-xs font-bold rounded-lg"
                                    >
                                        Thêm
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
