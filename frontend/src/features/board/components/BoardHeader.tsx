import React, { useState } from 'react';
import { Board, boardApi } from '@/features/board/api/board.api';
import { Star, Users, Filter, Settings, Palette, Search, X, Plus, Hash, Bell, Code2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/entities/user/model/authStore';
import { userApi } from '@/features/user/api/user.api';
import { WorkspaceMemberModal } from '@/features/workspace/components/WorkspaceMemberModal';
import { TaskRequestsDialog } from './TaskRequestsDialog';
import { BOARD_KEYS } from '@/features/board/hooks/useBoards';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';

interface Props {
    board: Board;
    onOpenSettings: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    selectedAssignees: string[];
    setSelectedAssignees: (a: string[]) => void;
    selectedComponent?: string;
    setSelectedComponent?: (c: string) => void;
    currentUserRole: string;
    canEditBoard: boolean;
}

export const BoardHeader: React.FC<Props> = ({ 
    board, 
    onOpenSettings,
    searchQuery,
    setSearchQuery,
    selectedAssignees,
    setSelectedAssignees,
    selectedComponent,
    setSelectedComponent,
    currentUserRole,
    canEditBoard
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isWsModalOpen, setIsWsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user, updateUser } = useAuthStore();
    const { openProfile } = useUserProfileStore();
    
    const isPinned = user?.pinned_boards?.includes(board._id);

    const { mutate: togglePin, isPending: isPinning } = useMutation({
        mutationFn: () => userApi.togglePinBoard(board._id),
        onSuccess: (res) => {
            if (user) {
                updateUser({ ...user, pinned_boards: res.data.pinned_boards });
            }
        },
        onError: (err: any) => {
            import('react-hot-toast').then(({ default: toast }) => {
                const message = typeof err === 'string' ? err : err?.response?.data?.message || 'Có lỗi xảy ra khi ghim dự án';
                toast.error(message);
            });
        }
    });

    const toggleAssignee = (userId: string) => {
        if (selectedAssignees.includes(userId)) {
            setSelectedAssignees(selectedAssignees.filter(id => id !== userId));
        } else {
            setSelectedAssignees([...selectedAssignees, userId]);
        }
    };
    const [title, setTitle] = useState(board.title);

    // Sync title khi board ID thay đổi
    React.useEffect(() => {
        setTitle(board.title);
    }, [board._id, board.title]);

    const { mutate: updateBoard } = useMutation({
        mutationFn: (data: Partial<Board>) => boardApi.updateBoard(board._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] });
            queryClient.invalidateQueries({ queryKey: BOARD_KEYS.detail(board._id) });
        }
    });

    const handleUpdateTitle = () => {
        if (title.trim() && title !== board.title) {
            updateBoard({ title });
        } else {
            setTitle(board.title);
        }
    };

    return (
        <div className="relative px-6 py-3 z-20 bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between gap-4">
            {/* Left Side: Title & Filter */}
            <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <div className="group relative">
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleUpdateTitle}
                            disabled={currentUserRole === 'Developer' || currentUserRole === 'Viewer'}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                            className="bg-transparent text-lg md:text-xl font-extrabold text-slate-800 dark:text-white px-2 py-1 -ml-2 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700/50 focus:border-blue-500/50 focus:bg-white dark:focus:bg-white/5 outline-none transition-all cursor-pointer focus:cursor-text w-[150px] md:w-[200px] focus:w-[250px] truncate disabled:opacity-80 disabled:cursor-default disabled:hover:border-transparent"
                        />
                    </div>
                    
                    {/* Badge Project Code */}
                    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/5 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap shrink-0">
                        <Hash size={12} className="text-blue-500" />
                        PROJ-{board._id.substring(board._id.length - 4).toUpperCase()}
                    </div>

                    {/* Status Dropdown */}
                    <div className="hidden sm:block">
                        <select
                            value={board.status || 'Planning'}
                            onChange={(e) => updateBoard({ status: e.target.value as any })}
                            disabled={currentUserRole === 'Developer' || currentUserRole === 'Viewer'}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none appearance-none cursor-pointer transition-colors ${
                                board.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                board.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                'bg-slate-50 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-300 dark:border-white/10'
                            }`}
                        >
                            <option value="Planning">📌 Kế hoạch</option>
                            <option value="In Progress">🚀 Đang thực hiện</option>
                            <option value="Completed">✅ Hoàn tất</option>
                        </select>
                    </div>
                </div>

                <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden md:block"></div>

                {/* Filter Search */}
                <div className="relative hidden md:block w-48 lg:w-64 group">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="Tìm thẻ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all"
                    />
                </div>

                {/* Component Filter */}
                {setSelectedComponent && (
                    <div className="hidden lg:block relative group">
                        <select 
                            value={selectedComponent || ''} 
                            onChange={(e) => setSelectedComponent(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-white/10 transition-all cursor-pointer"
                        >
                            <option value="" className="text-slate-800">Tất cả Component</option>
                            {['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'].map(c => (
                                <option key={c} value={c} className="text-slate-800">{c}</option>
                            ))}
                        </select>
                        <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                )}
            </div>

            {/* Right Side: Members & Settings */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <button 
                    onClick={() => togglePin()}
                    disabled={isPinning}
                    className={`p-1.5 md:p-2 rounded-xl transition-all ${isPinned ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10' : 'text-slate-400 hover:text-slate-700 hover:bg-white/60 dark:hover:bg-white/10 dark:hover:text-slate-200'} `}
                    title={isPinned ? 'Bỏ ghim dự án' : 'Ghim dự án (Tối đa 3)'}
                >
                    <Star size={18} className={isPinned ? 'fill-current' : ''} />
                </button>

                {/* Avatar Filters */}
                <div className="flex items-center gap-1">
                    {board.workspace?.members?.slice(0, 5).map((member, index) => {
                        const isSelected = selectedAssignees.includes(member._id);
                        return (
                            <button
                                key={member._id}
                                onClick={() => openProfile(member._id)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    toggleAssignee(member._id);
                                }}
                                className={`relative rounded-full transition-all ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-[#111520] z-20' : 'hover:-translate-y-0.5 opacity-70 hover:opacity-100 hover:z-20'} -ml-1.5 first:ml-0`}
                                title={`Nhấp xem hồ sơ, Chuột phải để lọc theo ${member.full_name}`}
                                style={{ zIndex: isSelected ? 20 : 10 - index }}
                            >
                                <img 
                                    crossOrigin="anonymous"
                                    src={member.avatar_url ? member.avatar_url : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.full_name)}&backgroundColor=6366f1&textColor=ffffff`} 
                                    alt={member.full_name} 
                                    className="w-7 h-7 rounded-full border border-white dark:border-[#111520] object-cover shadow-sm"
                                />
                                {isSelected && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center border border-white dark:border-[#111520]">
                                        <X size={8} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                    {board.workspace?.members && board.workspace.members.length > 5 && (
                        <div className="w-7 h-7 -ml-1.5 rounded-full border border-white dark:border-[#111520] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-sm z-0">
                            +{board.workspace.members.length - 5}
                        </div>
                    )}
                </div>

                {selectedAssignees.length > 0 && (
                    <button 
                        onClick={() => setSelectedAssignees([])}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        title="Bỏ lọc"
                    >
                        <X size={14} />
                    </button>
                )}

                <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsWsModalOpen(true)} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all">
                        <Users size={14} /> Nhân sự
                    </button>
                    {['Owner', 'Manager'].includes(currentUserRole) && (
                        <TaskRequestsDialog 
                            boardId={board._id} 
                            trigger={
                                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all">
                                    Yêu cầu
                                </button>
                            } 
                        />
                    )}
                    {canEditBoard && (
                        <button onClick={onOpenSettings} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-all">
                            <Settings size={16} />
                        </button>
                    )}
                    {board.workspace?.isCloud && (
                        <button 
                            onClick={() => navigate(`/dashboard/ide?cloud=1&workspaceId=${board.workspaceId}`)}
                            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 ml-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20 rounded-lg transition-all hover:-translate-y-0.5"
                            title="Mở môi trường lập trình Cloud IDE cho dự án này"
                        >
                            <Code2 size={14} /> Mở IDE
                        </button>
                    )}
                </div>
            </div>

            {/* Workspace Member Modal */}
            <WorkspaceMemberModal 
                isOpen={isWsModalOpen}
                onClose={() => setIsWsModalOpen(false)}
                workspaceId={board.workspaceId}
                currentUserRole={currentUserRole}
                orgId={board.workspace?.organizationId}
            />
        </div>
    );
};
