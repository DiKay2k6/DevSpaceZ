import { getAvatarUrl } from "@/shared/utils/avatar";
import React, { useState } from 'react';
import { X, Users, Check, Search } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/features/organization/api/organization.api';

interface CreateSubTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string, userIds: string[]) => void;
    isLoading: boolean;
    organizationId: string;
}

export const CreateSubTeamModal: React.FC<CreateSubTeamModalProps> = ({ 
    isOpen, onClose, onSubmit, isLoading, organizationId 
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

    const { data: members, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['org-members-workload', organizationId],
        queryFn: () => organizationApi.getMembersWorkload(organizationId),
        enabled: isOpen && !!organizationId
    });

    if (!isOpen) return null;

    const filteredMembers = members?.filter(m => 
        m.userId && m.userId.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit(name, description, selectedUserIds);
    };

    const getInitials = (fullName: string) => {
        return fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-lg bg-white dark:bg-[#111520] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo Phòng ban mới</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Tạo Sub-team để nhóm các thành viên</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Tên phòng ban"
                            placeholder="Ví dụ: Backend Team, Marketing..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mô tả (Tuỳ chọn)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Chức năng chính của phòng ban này..."
                                className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white placeholder:text-slate-400 min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Thêm thành viên ({selectedUserIds.length})
                            </label>
                        </div>
                        
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm thành viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-sm pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#151A26] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-colors"
                            />
                        </div>

                        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                            {isLoadingMembers ? (
                                <div className="p-4 text-center text-sm text-slate-500">Đang tải danh sách...</div>
                            ) : filteredMembers.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {filteredMembers.map(member => (
                                        <div 
                                            key={member.userId._id}
                                            onClick={() => toggleUser(member.userId._id)}
                                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedUserIds.includes(member.userId._id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {member.userId.avatar_url ? (
                                                        <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        getInitials(member.userId.full_name)
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{member.userId.full_name}</div>
                                                    <div className="text-xs text-slate-500">{member.role}</div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUserIds.includes(member.userId._id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {selectedUserIds.includes(member.userId._id) && <Check size={14} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy thành viên nào.</div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800/60 shrink-0 flex items-center justify-end gap-3 bg-slate-50 dark:bg-[#0B0F19]">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                        Huỷ bỏ
                    </Button>
                    <Button type="button" onClick={handleSubmit} isLoading={isLoading} disabled={!name.trim() || isLoading}>
                        Tạo Phòng ban
                    </Button>
                </div>
            </div>
        </div>
    );
};
