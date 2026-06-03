import { getAvatarUrl } from "@/shared/utils/avatar";
import React from 'react';
import { Users, UserPlus, MoreVertical, Mail, Trash2, Shield, Loader2, Edit2, Check, X, Flame, AlertCircle, Plus, Search } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { InviteMemberModal } from '@/features/workspace/components/InviteMemberModal';
import { CreateSubTeamModal } from '@/features/organization/components/CreateSubTeamModal';
import { SubTeamManagementModal } from '@/features/organization/components/SubTeamManagementModal';
import { RoleManagement } from '@/features/organization/components/RoleManagement';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useTeamManagement } from '@/features/organization/hooks/useTeamManagement';
import { useRoles } from '@/features/organization/hooks/useRoles';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';

export const Team: React.FC = () => {
    const { openProfile } = useUserProfileStore();
    const { user: currentUser } = useAuthStore();
    const {
        currentOrganization,
        members,
        isLoadingMembers,
        subteams,
        isLoadingSubteams,
        contacts,
        isLoadingContacts,

        isManager,
        activeTab,
        setActiveTab,

        isInviteOpen,
        setIsInviteOpen,
        isCreateSubTeamOpen,
        setIsCreateSubTeamOpen,
        managingSubTeam,
        setManagingSubTeam,

        editingUserId,
        setEditingUserId,
        editRole,
        setEditRole,

        searchEmail,
        setSearchEmail,
        searchedUsers,
        isSearching,
        handleSearchContact,

        addContact,
        isAddingContact,
        removeContact,
        isRemovingContact,

        removeMember,
        isRemoving,
        updateMember,
        isUpdatingMember,

        createSubTeam,
        isCreatingSubTeam
    } = useTeamManagement();

    const { roles } = useRoles(currentOrganization?._id);
    const [demoteOrgPrompt, setDemoteOrgPrompt] = React.useState<{userId: string, name: string, newRole: string, subteamNames: string[]} | null>(null);

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const currentUserMember = members?.find(m => m.userId._id === currentUser?._id);
    const ownerCount = members?.filter(m => m.role === 'Owner').length || 0;
    const isMeOwner = currentUserMember?.role === 'Owner';

    const handleUpdateRole = (userId: string, targetRole: string, userName: string, oldRole: string) => {
        if (oldRole === 'Leader' && targetRole !== 'Leader') {
            const leaderSubteams = subteams?.filter(st => st.members?.some(m => m.userId._id === userId && m.role === 'Leader')) || [];
            if (leaderSubteams.length > 0) {
                setDemoteOrgPrompt({
                    userId,
                    name: userName,
                    newRole: targetRole,
                    subteamNames: leaderSubteams.map(st => st.name)
                });
                return;
            }
        }
        updateMember({ userId, data: { role: targetRole } });
        setEditingUserId(null);
    };

    if (isLoadingMembers && !members) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!currentOrganization) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                            <Users size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Danh bạ & Bạn bè</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kết nối và thêm người dùng khác để cùng làm việc trong các dự án cá nhân.</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearchContact} className="flex gap-3 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                placeholder="Tìm kiếm người dùng qua Email..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-indigo-500 transition-colors text-sm dark:text-white"
                            />
                        </div>
                        <Button type="submit" disabled={isSearching} isLoading={isSearching}>
                            Tìm kiếm
                        </Button>
                    </form>

                    {/* Search Results */}
                    {searchedUsers.length > 0 && (
                        <div className="mb-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                            <h3 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-3">Kết quả tìm kiếm</h3>
                            <div className="space-y-2">
                                {searchedUsers.map(u => (
                                    <div key={u._id} className="flex items-center justify-between p-3 bg-white dark:bg-[#151A26] rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold uppercase shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                                onClick={() => openProfile(u._id)}
                                            >
                                                {u.avatar_url ? <img src={u.avatar_url ? getAvatarUrl(u.avatar_url) : ""} alt="avt" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" /> : u.full_name?.substring(0, 2) || '??'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{u.full_name}</p>
                                                <p className="text-xs text-slate-500">{u.email}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => addContact(u._id)}
                                            disabled={isAddingContact || contacts?.some(c => c._id === u._id)}
                                        >
                                            {contacts?.some(c => c._id === u._id) ? 'Đã có trong danh bạ' : 'Thêm bạn'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Danh sách của bạn ({contacts?.length || 0})</h3>

                    {isLoadingContacts ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : contacts && contacts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contacts.map(c => (
                                <div key={c._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 bg-white dark:bg-[#1A202C] text-slate-600 rounded-full flex items-center justify-center font-bold uppercase shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => openProfile(c._id)}
                                        >
                                            {c.avatar_url ? <img src={c.avatar_url ? getAvatarUrl(c.avatar_url) : ""} alt="avt" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" /> : c.full_name?.substring(0, 2) || '??'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{c.full_name}</p>
                                            <p className="text-xs text-slate-500">{c.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Bạn có chắc muốn xoá người này khỏi danh bạ?')) removeContact(c._id);
                                        }}
                                        disabled={isRemovingContact}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                        title="Xoá khỏi danh bạ"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Danh bạ trống</h3>
                            <p className="text-sm text-slate-500">Hãy tìm kiếm bạn bè qua email để kết nối và làm việc chung.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#111520] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-500/20">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nhân sự & Phòng ban</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Xem và quản lý các thành viên, phòng ban trong tổ chức của bạn</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'members' ? (
                        <div className="flex items-center gap-2">
                            {isManager && (
                                <Button leftIcon={<UserPlus size={18} />} onClick={() => setIsInviteOpen(true)}>
                                    Thêm thành viên
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10"
                                onClick={() => {
                                    if (confirm('Bạn có chắc chắn muốn rời khỏi Tổ chức này?')) {
                                        removeMember(currentUser!._id);
                                    }
                                }}
                            >
                                Rời tổ chức
                            </Button>
                        </div>
                    ) : (
                        isManager && (
                            <Button leftIcon={<Plus size={18} />} onClick={() => setIsCreateSubTeamOpen(true)}>
                                Tạo phòng ban
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/5 px-2">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'members'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    Thành viên tổ chức ({members?.length || 0})
                </button>
                <button
                    onClick={() => setActiveTab('subteams')}
                    className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'subteams'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    Phòng ban ({subteams?.length || 0})
                </button>
                {isManager && (
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'roles'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Ma trận Phân quyền
                    </button>
                )}
            </div>

            {/* Roles Content */}
            {activeTab === 'roles' && isManager && (
                <div className="bg-white dark:bg-[#111520] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden h-[600px]">
                    <RoleManagement orgId={currentOrganization._id} />
                </div>
            )}

            {/* Members Content */}
            {activeTab === 'members' && (
                <div className="bg-white dark:bg-[#111520] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                    {isLoadingMembers ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500 w-8 h-8" /></div>
                    ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    <th className="px-6 py-4 font-bold">Thành viên</th>
                                    <th className="px-6 py-4 font-bold">Vai trò</th>
                                    <th className="px-6 py-4 font-bold">Trạng thái công việc</th>
                                    <th className="px-6 py-4 font-bold">Tham gia</th>
                                    <th className="px-6 py-4 font-bold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {members?.map(member => {
                                    const isMe = member.userId._id === currentUser?._id;
                                    const isTargetOwner = member.role === 'Owner';
                                    const canManageMember = isManager && (!isTargetOwner || (isMeOwner && ownerCount > 1));
                                    const wl = member.workload || { activeTasksCount: 0, activeStoryPoints: 0, participatedBoards: [], isOverloaded: false };
                                    return (
                                        <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <div 
                                                            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 overflow-hidden text-sm shrink-0 shadow-sm border border-slate-200 dark:border-white/10 cursor-pointer hover:scale-105 transition-transform"
                                                            onClick={() => openProfile(member.userId._id)}
                                                        >
                                                            {member.userId.avatar_url ? (
                                                                <img src={member.userId.avatar_url ? getAvatarUrl(member.userId.avatar_url) : ""} alt="avt" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                            ) : (
                                                                getInitials(member.userId.full_name)
                                                            )}
                                                        </div>
                                                        {isMe && (
                                                            <div className="absolute -bottom-1 -right-1 bg-blue-500 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111520]"></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                                                {member.userId.full_name}
                                                                {isMe && <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Bạn</span>}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {member.userId.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingUserId === member.userId._id ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={editRole}
                                                            onChange={(e) => setEditRole(e.target.value)}
                                                            className="text-xs border rounded p-1 dark:bg-[#1A202C] dark:border-slate-700 dark:text-white"
                                                        >
                                                            {roles?.map(r => (
                                                                <option key={r._id} value={r.name}>{r.name}</option>
                                                            ))}
                                                            {!roles?.some(r => r.name === 'Owner') && <option value="Owner">Owner</option>}
                                                        </select>
                                                        <button onClick={() => handleUpdateRole(member.userId._id, editRole, member.userId.full_name, member.role)} className="text-green-500 hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                                                        <button onClick={() => setEditingUserId(null)} className="text-slate-400 hover:bg-slate-50 p-1 rounded"><X size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            {member.role === 'Owner' && <Shield size={14} className="text-amber-500" />}
                                                            {member.role === 'Manager' && <Shield size={14} className="text-blue-500" />}
                                                            {(() => {
                                                                const roleObj = roles?.find(r => r.name === member.role);
                                                                const rColor = roleObj?.color;
                                                                return (
                                                                    <span 
                                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                                            member.role === 'Owner' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' :
                                                                            member.role === 'Manager' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' :
                                                                            !rColor ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10' : ''
                                                                        }`}
                                                                        style={rColor && member.role !== 'Owner' && member.role !== 'Manager' ? {
                                                                            backgroundColor: `${rColor}15`,
                                                                            color: rColor,
                                                                            borderColor: `${rColor}30`
                                                                        } : {}}
                                                                    >
                                                                        {member.role}
                                                                    </span>
                                                                );
                                                            })()}
                                                            {member.status === 'Pending' && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20">
                                                                    Đang chờ
                                                                </span>
                                                            )}
                                                        </div>
                                                        {member.obsTitle && <span className="text-xs text-slate-500 pl-1">{member.obsTitle}</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {wl.activeTasksCount === 0 ? (
                                                        <span className="text-xs text-slate-400 italic">Đang rảnh</span>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                    <b className="text-slate-900 dark:text-white">{wl.activeTasksCount}</b> tasks
                                                                </span>
                                                                <span className="text-slate-300 dark:text-slate-600">•</span>
                                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                    <b className="text-slate-900 dark:text-white">{wl.activeStoryPoints}</b> pts
                                                                </span>
                                                            </div>
                                                            {wl.isOverloaded && (
                                                                <div className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400 font-bold mt-1">
                                                                    <Flame size={12} className="animate-pulse" /> Đang quá tải
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {wl.participatedBoards.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                        {wl.participatedBoards.slice(0, 2).map(b => (
                                                            <span key={b._id} className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-1.5 py-0.5 rounded whitespace-nowrap truncate max-w-[100px]" title={b.title}>
                                                                {b.title}
                                                            </span>
                                                        ))}
                                                        {wl.participatedBoards.length > 2 && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                                                +{wl.participatedBoards.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {canManageMember && (
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isMe && (
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUserId(member.userId._id);
                                                                    setEditRole(member.role as any);
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                title="Chỉnh sửa chức danh"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                        )}

                                                        {canManageMember && !isMe && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Bạn có chắc muốn xóa ${member.userId.full_name} khỏi workspace không?`)) {
                                                                        removeMember(member.userId._id);
                                                                    }
                                                                }}
                                                                disabled={isRemoving}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                                                title="Xóa thành viên"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            )}

            {/* Subteams Content */}
            {activeTab === 'subteams' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoadingSubteams ? (
                        <div className="col-span-full flex justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : subteams && subteams.length > 0 ? (
                        subteams.map(subteam => {
                            const hasLeader = subteam.members?.some(m => m.role === 'Leader');
                            return (
                            <div key={subteam._id} className={`bg-white dark:bg-[#111520] p-6 rounded-3xl border ${!hasLeader ? 'border-red-400 dark:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md'} transition-shadow relative overflow-hidden`}>
                                {!hasLeader && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                                        <AlertCircle size={12} /> Cần Leader
                                    </div>
                                )}
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-16">{subteam.name}</h3>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${!hasLeader ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
                                        {subteam.members?.length || 0} thành viên
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">
                                    {subteam.description || 'Không có mô tả cho phòng ban này.'}
                                </p>
                                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                                    <div className="flex -space-x-2">
                                        {subteam.members?.slice(0, 5).map((m: any, i) => (
                                            <div 
                                                key={m.userId?._id || i} 
                                                className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111520] bg-slate-200 flex items-center justify-center overflow-hidden text-[10px] font-bold text-slate-600 cursor-pointer hover:scale-110 transition-transform relative z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (m.userId?._id) openProfile(m.userId._id);
                                                }}
                                            >
                                                {m.userId?.avatar_url ? (
                                                    <img src={m.userId.avatar_url ? getAvatarUrl(m.userId.avatar_url) : ""} alt="Avatar" className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                ) : (
                                                    getInitials(m.userId?.full_name || 'U')
                                                )}
                                            </div>
                                        ))}
                                        {subteam.members && subteam.members.length > 5 && (
                                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#111520] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                +{subteam.members.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setManagingSubTeam(subteam)}>Quản lý</Button>
                                </div>
                            </div>
                        )})
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-[#111520] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-[#151A26] flex items-center justify-center mb-4 border border-slate-100 dark:border-white/5 shadow-inner">
                                <Users className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Chưa có phòng ban nào</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
                                Phân chia tổ chức thành các phòng ban chuyên môn (như Frontend, Marketing) để dễ dàng quản lý và phân quyền dự án.
                            </p>
                            {isManager && (
                                <Button leftIcon={<Plus size={16} />} onClick={() => setIsCreateSubTeamOpen(true)}>
                                    Tạo Phòng ban mới
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {isInviteOpen && (
                <InviteMemberModal
                    isOpen={isInviteOpen}
                    onClose={() => {
                        setIsInviteOpen(false);
                    }}
                    organizationId={currentOrganization._id}
                />
            )}

            {isCreateSubTeamOpen && (
                <CreateSubTeamModal
                    isOpen={isCreateSubTeamOpen}
                    onClose={() => setIsCreateSubTeamOpen(false)}
                    onSubmit={(name, description, userIds) => createSubTeam({ name, description, userIds })}
                    isLoading={isCreatingSubTeam}
                    organizationId={currentOrganization._id}
                />
            )}

            <SubTeamManagementModal
                isOpen={!!managingSubTeam}
                onClose={() => setManagingSubTeam(null)}
                subTeam={managingSubTeam}
                orgMembers={members || []}
                isManager={isManager}
                currentUserId={currentUser!._id}
            />

            {/* Modal cảnh báo giáng chức ngoài Tổ chức */}
            {demoteOrgPrompt && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#111520] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center mb-4">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cảnh báo giáng chức</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{demoteOrgPrompt.name}</span> đang làm Leader trong phòng ban: <br/>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{demoteOrgPrompt.subteamNames.join(', ')}</span>.<br/><br/>
                            Bạn có chắc chắn muốn thay đổi role và giáng chức họ trong các phòng ban này không?
                        </p>
                        
                        <div className="flex gap-3 w-full">
                            <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => setDemoteOrgPrompt(null)}
                            >
                                Hủy
                            </Button>
                            <Button 
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent"
                                isLoading={isUpdatingMember}
                                onClick={() => {
                                    updateMember({ userId: demoteOrgPrompt.userId, data: { role: demoteOrgPrompt.newRole } });
                                    setEditingUserId(null);
                                    setDemoteOrgPrompt(null);
                                }}
                            >
                                Đồng ý giáng chức
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Team;
