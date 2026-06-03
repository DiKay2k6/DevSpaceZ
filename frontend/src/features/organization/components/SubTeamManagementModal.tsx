import { getAvatarUrl } from "@/shared/utils/avatar";
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Users, Search, Trash2, Shield, Loader2, Plus, Star } from 'lucide-react';
import { SubTeam, subTeamApi } from '../api/subteam.api';
import { OrganizationMember } from '../api/organization.api';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { toast } from 'react-hot-toast';
import { handleApiError } from '@/shared/utils/error';
import { useRoles } from '@/features/organization/hooks/useRoles';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    subTeam: SubTeam | null;
    orgMembers: OrganizationMember[];
    isManager: boolean;
    currentUserId: string;
}

export const SubTeamManagementModal: React.FC<Props> = ({ isOpen, onClose, subTeam, orgMembers, isManager, currentUserId }) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    
    const { roles } = useRoles(subTeam?.organizationId);
    
    // State cho Modal Giáng chức
    const [demoteTarget, setDemoteTarget] = useState<{userId: string, name: string} | null>(null);
    const [selectedNewRole, setSelectedNewRole] = useState<string>('Developer');

    // Kiểm tra xem user hiện tại có phải Leader của nhóm này không
    const isLeader = subTeam?.members?.some(m => m.userId?._id === currentUserId && m.role === 'Leader') || false;
    const canManage = isManager || isLeader;

    // Reset form khi bật chế độ edit
    React.useEffect(() => {
        if (subTeam && isEditingMode) {
            setEditName(subTeam.name);
            setEditDescription(subTeam.description || '');
        }
    }, [isEditingMode, subTeam]);

    const { mutate: removeMember, isPending: isRemoving } = useMutation({
        mutationFn: (userId: string) => subTeamApi.removeMember(subTeam!._id, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', subTeam?.organizationId] });
            toast.success('Đã xoá thành viên khỏi nhóm');
        },
        onError: (err: any) => handleApiError(err)
    });

    const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
        mutationFn: ({ userId, role, newOrgRole }: { userId: string, role: 'Leader' | 'Member', newOrgRole?: string }) => subTeamApi.updateMemberRole(subTeam!._id, userId, role, newOrgRole),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', subTeam?.organizationId] });
            queryClient.invalidateQueries({ queryKey: ['org-members', subTeam?.organizationId] });
            toast.success('Đã cập nhật vai trò');
            setDemoteTarget(null);
            setSelectedNewRole('Developer');
        },
        onError: (err: any) => handleApiError(err)
    });

    const { mutate: addMember, isPending: isAdding } = useMutation({
        mutationFn: (userId: string) => subTeamApi.addMembers(subTeam!._id, [userId]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', subTeam?.organizationId] });
            toast.success('Đã thêm thành viên vào nhóm');
        },
        onError: (err: any) => handleApiError(err)
    });

    const { mutate: updateSubTeam, isPending: isUpdatingInfo } = useMutation({
        mutationFn: () => subTeamApi.updateSubTeam(subTeam!._id, { name: editName, description: editDescription }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', subTeam?.organizationId] });
            toast.success('Đã cập nhật thông tin phòng ban');
            setIsEditingMode(false);
        },
        onError: (err: any) => handleApiError(err)
    });

    const { mutate: deleteSubTeam, isPending: isDeletingSubTeam } = useMutation({
        mutationFn: () => subTeamApi.deleteSubTeam(subTeam!._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-subteams', subTeam?.organizationId] });
            toast.success('Đã xóa phòng ban');
            onClose();
        },
        onError: (err: any) => handleApiError(err)
    });

    // Lọc ra những người trong Org nhưng chưa có trong SubTeam để hiện gợi ý thêm
    const availableMembers = orgMembers.filter(orgM => 
        orgM.status === 'Joined' &&
        !(subTeam?.members || []).some(subM => subM.userId?._id === orgM.userId?._id)
    );

    const filteredAvailableMembers = availableMembers.filter(m => 
        m.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.userId?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen || !subTeam) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111520] w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex-1 mr-4">
                        {isEditingMode ? (
                            <div className="space-y-3">
                                <Input
                                    label="Tên phòng ban"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Nhập tên phòng ban..."
                                    autoFocus
                                />
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mô tả</label>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Mô tả về phòng ban này..."
                                        rows={2}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-blue-500 outline-none resize-none dark:text-white"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => updateSubTeam()} disabled={!editName.trim() || isUpdatingInfo} isLoading={isUpdatingInfo}>Lưu thay đổi</Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsEditingMode(false)} disabled={isUpdatingInfo}>Hủy</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Users className="text-blue-500" />
                                        {subTeam.name}
                                    </h2>
                                    {canManage && (
                                        <button onClick={() => setIsEditingMode(true)} className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-2 py-1 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                            Chỉnh sửa
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{subTeam.description || 'Không có mô tả'}</p>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Thêm thành viên mới */}
                    {canManage && (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Thêm thành viên vào nhóm</h3>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thành viên tổ chức..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-blue-500 outline-none dark:text-white"
                                />
                            </div>
                            
                            {searchTerm && (
                                <div className="max-h-40 overflow-y-auto border border-slate-100 dark:border-white/5 rounded-xl bg-white dark:bg-[#151A26] divide-y divide-slate-50 dark:divide-white/5">
                                    {filteredAvailableMembers.length > 0 ? (
                                        filteredAvailableMembers.map(member => (
                                            <div key={member.userId?._id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-white/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                                                        {member.userId?.avatar_url ? <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} className="w-full h-full rounded-full object-cover" /> : member.userId?.full_name?.substring(0,2).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-slate-800 dark:text-white">{member.userId?.full_name}</p>
                                                        <p className="text-xs text-slate-500">{member.userId?.email}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" onClick={() => addMember(member.userId!._id)} disabled={isAdding}>
                                                    Thêm
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-center text-sm text-slate-500">Không tìm thấy thành viên phù hợp</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Danh sách thành viên */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-3">Thành viên ({subTeam.members.length})</h3>
                        <div className="space-y-2">
                            {subTeam.members.map(member => (
                                <div key={member.userId?._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-sm font-bold shrink-0">
                                            {member.userId?.avatar_url ? <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} className="w-full h-full rounded-full object-cover" /> : member.userId?.full_name?.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-sm text-slate-800 dark:text-white">{member.userId?.full_name}</p>
                                                {member.role === 'Leader' && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                        <Star size={10} className="fill-current" /> Leader
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">{member.userId?.email}</p>
                                        </div>
                                    </div>
                                    
                                    {canManage && (
                                        <div className="flex items-center gap-2">
                                            {member.role === 'Member' ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-500/30 dark:hover:bg-amber-500/10"
                                                    onClick={() => updateRole({ userId: member.userId!._id, role: 'Leader' })}
                                                    disabled={isUpdatingRole}
                                                >
                                                    Chỉ định Leader
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-xs"
                                                    onClick={() => setDemoteTarget({userId: member.userId!._id, name: member.userId!.full_name})}
                                                    disabled={isUpdatingRole}
                                                >
                                                    Hạ quyền
                                                </Button>
                                            )}
                                            
                                            <button 
                                                onClick={() => {
                                                    if(window.confirm('Bạn có chắc muốn xoá người này khỏi phòng ban?')) {
                                                        removeMember(member.userId!._id);
                                                    }
                                                }}
                                                disabled={isRemoving}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone Nguy hiểm */}
                    {isManager && (
                        <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-900/30">
                            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Khu vực nguy hiểm</h3>
                            <p className="text-xs text-slate-500 mb-4">Hành động này sẽ xóa vĩnh viễn phòng ban này khỏi tổ chức. Các thành viên sẽ không bị xóa khỏi tổ chức.</p>
                            <Button 
                                variant="outline" 
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 w-full flex items-center justify-center gap-2"
                                onClick={() => {
                                    if(window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn phòng ban "${subTeam.name}" không?`)) {
                                        deleteSubTeam();
                                    }
                                }}
                                disabled={isDeletingSubTeam}
                                isLoading={isDeletingSubTeam}
                            >
                                <Trash2 size={16} /> Xóa phòng ban
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Giáng chức */}
            {demoteTarget && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#111520] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 flex items-center justify-center mb-4">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Giáng chức Leader</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Bạn có muốn giáng chức <span className="font-semibold text-slate-700 dark:text-slate-300">{demoteTarget.name}</span>? 
                            Vui lòng chọn vai trò mới cho họ trong toàn bộ tổ chức (mặc định là Developer).
                        </p>
                        
                        <div className="w-full text-left mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Vai trò mới trong Tổ chức</label>
                            <select 
                                value={selectedNewRole}
                                onChange={(e) => setSelectedNewRole(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-blue-500 outline-none dark:text-white"
                            >
                                {roles?.filter(r => r.name !== 'Leader' && r.name !== 'Owner').map((r: any) => (
                                    <option key={r._id} value={r.name}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 w-full">
                            <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setDemoteTarget(null)}
                            >
                                Hủy
                            </Button>
                            <Button 
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                                isLoading={isUpdatingRole}
                                onClick={() => updateRole({ userId: demoteTarget.userId, role: 'Member', newOrgRole: selectedNewRole })}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
