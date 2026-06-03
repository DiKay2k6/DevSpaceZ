import { getAvatarUrl } from "@/shared/utils/avatar";
import React, { useState } from 'react';
import { X, UserPlus, Users, Trash2, Edit2, Loader2, Check, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi, WorkspaceMember } from '@/features/workspace/api/workspace.api';
import { organizationApi } from '@/features/organization/api/organization.api';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { subTeamApi, SubTeam } from '@/features/organization/api/subteam.api';
import { contactApi } from '@/features/contact/api/contact.api';
import { Button } from '@/shared/ui/Button';
import { handleApiError } from '@/shared/utils/error';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useRoles } from '@/features/organization/hooks/useRoles';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    currentUserRole?: string;
    orgId?: string;
}

export const WorkspaceMemberModal: React.FC<Props> = ({ isOpen, onClose, workspaceId, currentUserRole = 'Member', orgId: propOrgId }) => {
    const { currentOrganization } = useOrganizationStore();
    const { openProfile } = useUserProfileStore();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'subteams'>('manage');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<string>('Member');
    const [editObs, setEditObs] = useState('');

    const orgId = propOrgId || currentOrganization?._id;
    const { roles } = useRoles(orgId);

    const hasPermission = (permissionCode: string) => {
        if (['Manager', 'Owner'].includes(currentUserRole)) return true;
        const roleDef = roles?.find(r => r.name === currentUserRole);
        if (!roleDef) return false;
        return roleDef.permissions?.includes(permissionCode as any) || false;
    };

    const canInvite = hasPermission('member:invite');
    const canRemove = hasPermission('member:remove');
    const canChangeRole = hasPermission('member:change_role');

    // Lấy thành viên Workspace
    const { data: wsMembers, isLoading: isLoadingWs } = useQuery({
        queryKey: ['workspace-members', workspaceId],
        queryFn: () => workspaceApi.getMembers(workspaceId),
        enabled: !!workspaceId
    });

    // Lấy thành viên Organization
    const { data: orgMembers, isLoading: isLoadingOrg } = useQuery({
        queryKey: ['org-members', currentOrganization?._id],
        queryFn: () => organizationApi.getMembers(currentOrganization!._id),
        enabled: !!currentOrganization?._id
    });

    // Lấy Danh bạ (Contacts) cho Không gian cá nhân
    const { data: contacts, isLoading: isLoadingContacts } = useQuery({
        queryKey: ['personal-contacts'],
        queryFn: () => contactApi.getContacts(),
        enabled: !currentOrganization?._id
    });

    // Lấy danh sách SubTeam của Organization
    const { data: subteams, isLoading: isLoadingSubteams } = useQuery({
        queryKey: ['org-subteams', currentOrganization?._id],
        queryFn: () => subTeamApi.getSubTeamsByOrg(currentOrganization!._id),
        enabled: !!currentOrganization?._id
    });

    // Lấy chi tiết Workspace để biết các subTeamIds đã gán
    const { data: workspaceData } = useQuery({
        queryKey: ['workspace-details', workspaceId],
        queryFn: async () => {
            const res = await workspaceApi.getWorkspaces(currentOrganization?._id);
            return res.find((w: any) => w._id === workspaceId) || null;
        },
        enabled: !!workspaceId
    });

    // Hiện tại workspaceApi.getWorkspaces trả về object chưa có subTeamIds rõ ràng.
    // Tạm thời Backend trả về subTeamIds trong workspace, nên cần kiểm tra.
    const assignedSubTeamIds = (workspaceData as any)?.subTeamIds || [];

    // Lọc ra các Org member CHƯA có trong Workspace (chỉ những người đã Joined) và loại bỏ những người có userId bị null
    const validOrgMembers = orgMembers?.filter((m: any) => m.userId) || [];
    const validWsMembers = wsMembers?.filter((m: any) => m.userId) || [];

    let availableMembers: any[] = [];
    if (currentOrganization) {
        availableMembers = validOrgMembers.filter((orgMem: any) => 
            orgMem.status === 'Joined' && 
            !validWsMembers.some((wsMem: any) => wsMem.userId._id === orgMem.userId._id)
        );
    } else {
        const validContacts = contacts || [];
        availableMembers = validContacts.filter((c: any) => 
            !validWsMembers.some((wsMem: any) => wsMem.userId._id === c._id)
        ).map((c: any) => ({ _id: c._id, userId: c }));
    }
    // Mutations
    const { mutate: addMember, isPending: isAdding } = useMutation({
        mutationFn: (userId: string) => workspaceApi.addMember(workspaceId, userId),
        onSuccess: () => {
            toast.success('Đã thêm thành viên vào dự án');
            queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
        onError: (err) => handleApiError(err)
    });

    const { mutate: removeMember } = useMutation({
        mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
        onSuccess: () => {
            toast.success('Đã xóa thành viên khỏi dự án');
            queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
        onError: (err) => handleApiError(err)
    });

    const { mutate: updateMember } = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: { role?: string, obsTitle?: string, isBlockedFromIDE?: boolean } }) => 
            workspaceApi.updateMember(workspaceId, userId, data),
        onSuccess: () => {
            toast.success('Đã cập nhật chức vụ thành công');
            setEditingUserId(null);
            queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] });
        },
        onError: (err) => handleApiError(err)
    });

    const { mutate: addSubTeam, isPending: isAddingSubTeam } = useMutation({
        mutationFn: (subTeamId: string) => workspaceApi.addSubTeam(workspaceId, subTeamId),
        onSuccess: () => {
            toast.success('Đã gán phòng ban vào dự án');
            queryClient.invalidateQueries({ queryKey: ['workspace-details', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['boards'] }); // Quan trọng: reload list board để có quyền
        },
        onError: (err) => handleApiError(err)
    });

    const { mutate: removeSubTeam, isPending: isRemovingSubTeam } = useMutation({
        mutationFn: (subTeamId: string) => workspaceApi.removeSubTeam(workspaceId, subTeamId),
        onSuccess: () => {
            toast.success('Đã gỡ phòng ban khỏi dự án');
            queryClient.invalidateQueries({ queryKey: ['workspace-details', workspaceId] });
            queryClient.invalidateQueries({ queryKey: ['boards'] });
        },
        onError: (err) => handleApiError(err)
    });

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111520] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Nhân sự Dự án</h2>
                        <p className="text-sm text-slate-500 mt-1">Quản lý và phân bổ thành viên tham gia</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-4 py-2 border-b border-slate-100 dark:border-white/5 gap-4">
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`text-sm font-bold py-2 border-b-2 transition-colors ${activeTab === 'manage' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        Thành viên ({validWsMembers.length})
                    </button>
                    {canInvite && (
                        <>
                            <button 
                                onClick={() => setActiveTab('add')}
                                className={`text-sm font-bold py-2 border-b-2 transition-colors ${activeTab === 'add' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                Mời thêm
                            </button>
                            <button 
                                onClick={() => setActiveTab('subteams')}
                                className={`text-sm font-bold py-2 border-b-2 transition-colors ${activeTab === 'subteams' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                Gán phòng ban
                            </button>
                        </>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'manage' && (
                        <div className="space-y-3">
                            {isLoadingWs ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : validWsMembers.length === 0 ? (
                                <p className="text-center text-slate-500 p-8">Dự án chưa có thành viên nào.</p>
                            ) : (
                                validWsMembers.map((member: any) => (
                                    <div key={member._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold uppercase shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => {
                                                    if (member.userId?._id) {
                                                        onClose();
                                                        openProfile(member.userId._id);
                                                    }
                                                }}
                                            >
                                                {member.userId?.avatar_url ? <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} alt="avt" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" /> : member.userId?.full_name?.substring(0,2) || '??'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{member.userId?.full_name || 'Người dùng đã xóa'}</p>
                                                    {(() => {
                                                        const roleObj = roles?.find(r => r.name === member.role);
                                                        const rColor = roleObj?.color || '#3b82f6';
                                                        return (
                                                            <span 
                                                                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border"
                                                                style={{ backgroundColor: `${rColor}15`, color: rColor, borderColor: `${rColor}30` }}
                                                            >
                                                                {member.role}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{member.userId?.email || 'N/A'} • {member.obsTitle || 'Chưa phân chức danh'}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {/* Quản lý Role (Change Role) */}
                                            {canChangeRole && member.role !== 'Owner' && (
                                                editingUserId === member.userId._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select 
                                                            value={editRole}
                                                            onChange={(e) => setEditRole(e.target.value)}
                                                            className="text-xs p-1.5 rounded bg-white dark:bg-[#1A202C] border border-slate-300 dark:border-slate-700"
                                                        >
                                                            {roles?.map(r => (
                                                                <option key={r._id} value={r.name}>{r.name}</option>
                                                            ))}
                                                            {!roles?.some(r => r.name === 'Owner') && <option value="Owner">Owner</option>}
                                                        </select>
                                                        <input 
                                                            value={editObs}
                                                            onChange={(e) => setEditObs(e.target.value)}
                                                            placeholder="Chức danh"
                                                            className="text-xs p-1.5 w-24 rounded bg-white dark:bg-[#1A202C] border border-slate-300 dark:border-slate-700"
                                                        />
                                                        <button onClick={() => updateMember({ userId: member.userId._id, data: { role: editRole, obsTitle: editObs } })} className="p-1.5 text-green-600 bg-green-100 rounded hover:bg-green-200"><Check size={14}/></button>
                                                        <button onClick={() => setEditingUserId(null)} className="p-1.5 text-slate-500 bg-slate-200 rounded hover:bg-slate-300"><X size={14}/></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <button 
                                                            onClick={() => updateMember({ userId: member.userId._id, data: { isBlockedFromIDE: !member.isBlockedFromIDE } })}
                                                            className={`p-1.5 rounded-md transition-colors ${member.isBlockedFromIDE ? 'text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100'}`}
                                                            title={member.isBlockedFromIDE ? "Mở chặn truy cập IDE" : "Chặn truy cập IDE"}
                                                        >
                                                            {member.isBlockedFromIDE ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                        </button>
                                                        <button 
                                                            onClick={() => { setEditingUserId(member.userId._id); setEditRole(member.role); setEditObs(member.obsTitle || ''); }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md"
                                                            title="Sửa phân quyền"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </div>
                                                )
                                            )}

                                            {/* Remove Member */}
                                            {canRemove && member.role !== 'Owner' && (
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm(`Bạn có chắc muốn xóa ${member.userId.full_name} khỏi dự án?`)) {
                                                            removeMember(member.userId._id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Xóa khỏi dự án"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div className="space-y-3">
                            {isLoadingOrg ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : availableMembers.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    <Users className="mx-auto text-slate-400 mb-3" size={32} />
                                    <p className="text-slate-500 font-medium">Tất cả nhân sự trong Tổ chức đều đã tham gia dự án này.</p>
                                    <p className="text-xs text-slate-400 mt-1">Để mời người mới, hãy thêm họ vào Tổ chức tại trang Team.</p>
                                </div>
                            ) : (
                                availableMembers.map((member: any) => (
                                    <div key={member._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/10 hover:border-blue-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold uppercase shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => {
                                                    if (member.userId?._id) {
                                                        onClose();
                                                        openProfile(member.userId._id);
                                                    }
                                                }}
                                            >
                                                {member.userId?.avatar_url ? <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} alt="avt" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" /> : member.userId?.full_name?.substring(0,2) || '??'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{member.userId?.full_name || 'Người dùng đã xóa'}</p>
                                                <p className="text-xs text-slate-500">{member.userId?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => addMember(member.userId._id)}
                                            disabled={isAdding}
                                            variant="primary"
                                            className="px-4 py-1.5 text-xs rounded-lg"
                                        >
                                            {isAdding ? <Loader2 size={14} className="animate-spin" /> : <><UserPlus size={14} className="mr-1.5" /> Thêm vào</>}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'subteams' && (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500 mb-4 px-1">
                                Khi một phòng ban được gán vào dự án, toàn bộ thành viên trong phòng ban đó sẽ <b>tự động có quyền truy cập</b> vào dự án này.
                            </p>
                            {isLoadingSubteams ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div>
                            ) : subteams && subteams.length === 0 ? (
                                <div className="text-center text-slate-500 p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                    Tổ chức của bạn chưa có Phòng ban nào.
                                </div>
                            ) : (
                                subteams?.map(subteam => {
                                    const isAssigned = assignedSubTeamIds.includes(subteam._id);
                                    return (
                                        <div key={subteam._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-blue-300 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-800 dark:text-white">{subteam.name}</p>
                                                    <p className="text-xs text-slate-500">{subteam.members?.length || 0} thành viên</p>
                                                </div>
                                            </div>
                                            
                                            {isAssigned ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => removeSubTeam(subteam._id)}
                                                    isLoading={isRemovingSubTeam}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                >
                                                    Gỡ quyền
                                                </Button>
                                            ) : (
                                                <Button 
                                                    size="sm"
                                                    onClick={() => addSubTeam(subteam._id)}
                                                    isLoading={isAddingSubTeam}
                                                >
                                                    Gán dự án
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};
