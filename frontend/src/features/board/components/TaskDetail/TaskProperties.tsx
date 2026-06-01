import React, { useState } from 'react';
import { User, CheckSquare, X } from 'lucide-react';
import { Task } from '@/features/board/api/board.api';
import { SearchedUser } from '@/features/workspace/api/workspace.api';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useOnClickOutside } from '@/shared/hooks/useOnClickOutside';
import { boardApi } from '@/features/board/api/board.api';
import toast from 'react-hot-toast';

interface TaskPropertiesProps {
    task: Task;
    boardTasks: Task[];
    workspaceMembers: SearchedUser[];
    isViewer: boolean;
    canAssignTask: boolean;
    subteams: any[];
    currentUserRole: string;
    onUpdateTask: (data: Partial<Task>) => void;
    onFillBugTemplate: (template: string) => void;
}

export const TaskProperties: React.FC<TaskPropertiesProps> = ({
    task, boardTasks, workspaceMembers, isViewer, canAssignTask, subteams, currentUserRole, onUpdateTask, onFillBugTemplate
}) => {
    const { user } = useAuthStore();
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);
    const assigneeDropdownRef = React.useRef<HTMLDivElement>(null);
    useOnClickOutside(assigneeDropdownRef, () => setIsAssigneeDropdownOpen(false));

    const [newLabelText, setNewLabelText] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
    const [isRequestingLeave, setIsRequestingLeave] = useState(false);
    const [leaveReason, setLeaveReason] = useState('');

    const userIsLeaderOfSomeSubteam = subteams?.some((st: any) => st.members.some((m: any) => (m?.userId?._id === user?._id || m?.userId === user?._id) && m.role === 'Leader'));
    const canManageAssignees = ['Owner', 'Manager', 'Leader'].includes(currentUserRole) || userIsLeaderOfSomeSubteam;

    const assignableMembers = React.useMemo(() => {
        if (!workspaceMembers) return [];
        if (['Manager', 'Owner'].includes(currentUserRole)) return workspaceMembers;
        if (!canAssignTask) return [];

        const mySubteams = subteams.filter((st: any) => st.members.some((m: any) => m?.userId?._id === user?._id || m?.userId === user?._id));
        
        if (mySubteams.length > 0) {
            // Nếu có phòng ban -> được chọn thành viên trong phòng ban
            const allowedUserIds = new Set(mySubteams.flatMap((st: any) => st.members.map((m: any) => m?.userId?._id || m?.userId)));
            return workspaceMembers.filter(m => allowedUserIds.has(m._id));
        }
        
        // Nếu không thuộc phòng ban nào -> chọn được tất cả trừ Owner
        // Chú ý: Backend workspaceMembers trả về danh sách user không kèm Role. 
        // Thay vì tra role của từng người (phức tạp), ta có thể lấy danh sách người trong dự án. 
        // Nhưng logic "trừ Owner" cần phải biết ai là Owner. Ở đây nếu chưa có info về Role thì đành hiện tất cả (vì Backend không trả Role trong workspaceMembers hiện tại). 
        // Sẽ xử lý tốt nhất có thể ở frontend:
        return workspaceMembers;
    }, [workspaceMembers, currentUserRole, canAssignTask, subteams, user]);

    const toggleAssignee = (userId: string) => {
        const currentAssignees = (task.assignees || []).map(a => a?._id || a);
        const newAssignees = currentAssignees.includes(userId)
            ? currentAssignees.filter(id => id !== userId)
            : [...currentAssignees, userId];
        
        if (!isViewer) {
            onUpdateTask({ assignees: newAssignees as any });
        }
    };

    const handleJoinLeaveRequest = async (type: 'Join' | 'Leave') => {
        if (type === 'Leave' && !leaveReason.trim()) {
            toast.error('Vui lòng nhập lý do rời thẻ công việc');
            return;
        }
        try {
            await boardApi.createTaskRequest(task._id, type, leaveReason);
            toast.success(`Đã gửi yêu cầu ${type === 'Join' ? 'tham gia' : 'rời'} thẻ thành công!`);
            setIsRequestingLeave(false);
            setLeaveReason('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu');
        }
    };

    const amIInTask = (task.assignees || []).some(a => (a?._id || a) === user?._id);

    return (
        <div className="bg-slate-50/80 dark:bg-[#111520] rounded-2xl p-6 border border-slate-100 dark:border-white/5 space-y-6 shadow-inner">
            <h3 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Thuộc tính
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                
                {/* Type */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Loại thẻ (Type)</span>
                    <div className="flex flex-wrap gap-1">
                        {['Task', 'Feature', 'Bug', 'Chore', 'Epic'].map(t => {
                            const isSelected = (task.type || 'Task') === t;
                            return (
                                <button
                                    key={t}
                                    onClick={() => {
                                        if (isViewer) return;
                                        if (t === 'Bug' && (!task.description || task.description.trim() === '')) {
                                            if (window.confirm('Bạn có muốn tự động điền Mẫu Báo Cáo Lỗi (Bug Template) không?')) {
                                                const template = `### 🐞 Mô tả lỗi\n[Mô tả ngắn gọn về lỗi...]\n\n### 🔄 Các bước tái hiện (Steps to Reproduce)\n1. Đi tới '...'\n2. Bấm vào '....'\n3. Lỗi xuất hiện\n\n### 🎯 Kết quả mong đợi (Expected Result)\n[Mô tả điều gì đáng lẽ phải xảy ra]\n\n### 💥 Kết quả thực tế (Actual Result)\n[Mô tả điều gì đang bị sai]\n\n### 💻 Môi trường (Environment)\n- **HĐH:** [VD: macOS 14, Windows 11]\n- **Trình duyệt:** [VD: Chrome 120]\n- **Version:** [VD: v1.0.2]`;
                                                onFillBugTemplate(template);
                                                onUpdateTask({ type: t as any, description: template });
                                                return;
                                            }
                                        }
                                        onUpdateTask({ type: t as any });
                                    }}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                        isSelected 
                                        ? (t === 'Bug' ? 'border-red-500/50 bg-red-50 text-red-600 dark:bg-red-500/10 dark:border-red-500/30' 
                                            : t === 'Epic' ? 'border-purple-500/50 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/30' 
                                            : t === 'Chore' ? 'border-slate-500/50 bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:border-slate-500/30' 
                                            : 'border-blue-500/50 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30')
                                        : 'border-transparent bg-white dark:bg-[#111520] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {t === 'Task' && '✓ Task'}
                                    {t === 'Feature' && '⚡ Tính năng'}
                                    {t === 'Bug' && '🐞 Lỗi'}
                                    {t === 'Chore' && '🔧 Việc vặt'}
                                    {t === 'Epic' && '👑 Sáng kiến'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái</span>
                    <select 
                        value={task.status || 'Not Started'} 
                        onChange={(e) => onUpdateTask({ status: e.target.value as any })}
                        disabled={isViewer}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <option value="Not Started" className="text-slate-800">⭕ Not Started</option>
                        <option value="In Progress" className="text-slate-800">⏳ In Progress</option>
                        <option value="Review" className="text-slate-800">👀 Review</option>
                        <option value="Done" className="text-slate-800">✅ Done</option>
                    </select>
                </div>

                {/* Parent Task (Epic) */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thuộc về (Parent)</span>
                    <select 
                        value={task.parentId || ''} 
                        onChange={(e) => onUpdateTask({ parentId: e.target.value || undefined })}
                        disabled={isViewer}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-2 rounded-xl text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <option value="" className="text-slate-800">-- Không thuộc Epic/Task nào --</option>
                        {boardTasks.filter(t => t?._id !== task?._id && (t?.type === 'Epic' || t?.type === 'Feature' || t?.type === 'Task')).map(t => (
                            <option key={t?._id} value={t?._id} className="text-slate-800">
                                [{t.type}] {t.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Component */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Thành phần (Component)</span>
                    <select 
                        value={task.component || ''} 
                        onChange={(e) => onUpdateTask({ component: e.target.value as any })}
                        disabled={isViewer}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 shadow-sm transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <option value="" className="text-slate-800">-- Chọn thành phần --</option>
                        {['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other'].map(c => (
                            <option key={c} value={c} className="text-slate-800">{c}</option>
                        ))}
                    </select>
                </div>

                {/* Assignee */}
                <div className="flex flex-col gap-2 relative">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Người thực hiện</span>
                    <div className="flex flex-wrap items-center gap-1.5" ref={assigneeDropdownRef}>
                        {(task.assignees || []).map(user => {
                            const isString = typeof user === 'string';
                            const userIdStr = isString ? user : (user as any)?._id;
                            const memberObj = isString 
                                ? (assignableMembers.find(m => m._id === userIdStr) || workspaceMembers?.find((m: any) => m._id === userIdStr))
                                : user;
                                
                            const displayName = (memberObj as any)?.full_name?.split(' ')[0] || 'User';
                            const avatar = (memberObj as any)?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

                            return (
                                <div key={userIdStr || Math.random()} className="flex items-center gap-1.5 bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/10 pl-1 pr-2 py-1 rounded-full shadow-sm group">
                                    <img 
                                        src={avatar} 
                                        alt={displayName} 
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{displayName}</span>
                                    {(!isViewer && canManageAssignees) && (
                                        <button onClick={() => userIdStr && toggleAssignee(userIdStr as string)} className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 rounded-full transition-all">
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {(!isViewer && canManageAssignees) && (
                            <button 
                                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-blue-500 hover:border-blue-500 dark:hover:text-blue-400 transition-colors bg-white dark:bg-transparent"
                            >
                                <User size={14} />
                            </button>
                        )}

                        {(!isViewer && !canManageAssignees && !amIInTask) && (
                            <button 
                                onClick={() => handleJoinLeaveRequest('Join')}
                                className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
                            >
                                + Xin tham gia
                            </button>
                        )}
                        {(!isViewer && !canManageAssignees && amIInTask) && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsRequestingLeave(!isRequestingLeave)}
                                    className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
                                >
                                    - Xin rời thẻ
                                </button>
                                {isRequestingLeave && (
                                    <div className="absolute top-full left-0 mt-2 w-[220px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 p-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            placeholder="Lý do xin rời..."
                                            value={leaveReason}
                                            onChange={e => setLeaveReason(e.target.value)}
                                            className="w-full h-20 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-lg p-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 resize-none mb-2 custom-scrollbar"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setIsRequestingLeave(false)} className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Hủy</button>
                                            <button onClick={() => handleJoinLeaveRequest('Leave')} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-md shadow-sm transition-colors">Gửi</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Assignee Popover anchored to the flex container */}
                        {(isAssigneeDropdownOpen && canManageAssignees) && (
                            <div className="absolute top-full left-0 mt-2 w-[240px] bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="max-h-[220px] overflow-y-auto p-1.5 custom-scrollbar">
                                    {(assignableMembers || []).map(member => {
                                        const isSelected = (task.assignees || []).some(a => (a?._id || a) === member?._id);
                                        return (
                                            <div 
                                                key={member._id}
                                                onClick={() => toggleAssignee(member._id)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <img 
                                                        src={member.avatar_url ? member.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'User')}&background=6366f1&color=fff`} 
                                                        alt="Avatar" 
                                                        className="w-6 h-6 rounded-full object-cover"
                                                    />
                                                    <span className={`text-[13px] font-medium ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{member.full_name || 'User'}</span>
                                                </div>
                                                {isSelected && <CheckSquare size={14} className="text-blue-500" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Độ ưu tiên</span>
                    <div className="flex gap-1">
                        {['Low', 'Medium', 'High'].map(p => {
                            const isSelected = task.priority === p;
                            return (
                                <button
                                    key={p}
                                    onClick={() => !isViewer && onUpdateTask({ priority: p as any })}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border ${
                                        isSelected 
                                        ? (p === 'High' ? 'border-red-500/50 bg-red-50 text-red-600 dark:bg-red-500/10 dark:border-red-500/30' 
                                            : p === 'Medium' ? 'border-amber-500/50 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/30' 
                                            : 'border-blue-500/50 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30')
                                        : 'border-transparent bg-white dark:bg-[#111520] text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    } ${isViewer ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                    {p === 'Low' && 'Thấp'}
                                    {p === 'Medium' && 'TB'}
                                    {p === 'High' && 'Cao'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dates */}
                <div className="flex flex-col gap-2 col-span-1 sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tiến độ (Timeline)</span>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <input 
                            type="date" 
                            value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => onUpdateTask({ startDate: e.target.value })}
                            disabled={isViewer}
                            className="flex-1 w-full min-w-[135px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            title="Ngày bắt đầu"
                        />
                        <span className="text-slate-400 font-bold hidden xl:block shrink-0">→</span>
                        <input 
                            type="date" 
                            value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => onUpdateTask({ dueDate: e.target.value })}
                            disabled={isViewer}
                            className="flex-1 w-full min-w-[135px] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-[13px] font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            title="Ngày đến hạn"
                        />
                    </div>
                </div>

                {/* Dependencies (Blockers) */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phụ thuộc vào (Blocked by)</span>
                    <div className="flex flex-wrap gap-2">
                        {(task.dependencies || []).map(depId => {
                            const depTask = boardTasks.find(t => t._id === depId);
                            if (!depTask) return null;
                            return (
                                <div key={depId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg group">
                                    <span className="text-[10px] font-bold text-red-500 bg-white dark:bg-black/20 px-1 rounded">DEV-{depTask.order + 100}</span>
                                    <span className="text-xs font-semibold text-red-700 dark:text-red-400 max-w-[150px] truncate">{depTask.title}</span>
                                    {!isViewer && (
                                        <button 
                                            onClick={() => {
                                                const newDeps = (task.dependencies || []).filter(id => id !== depId);
                                                onUpdateTask({ dependencies: newDeps });
                                            }}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        
                        {!isViewer && (
                            <select 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val && !(task.dependencies || []).includes(val)) {
                                        onUpdateTask({ dependencies: [...(task.dependencies || []), val] });
                                    }
                                    e.target.value = ""; // Reset sau khi chọn
                                }}
                                className="bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer w-[200px]"
                            >
                                <option value="">+ Thêm Task chặn...</option>
                                {boardTasks.filter(t => t._id !== task._id && !(task.dependencies || []).includes(t._id)).map(t => (
                                    <option key={t._id} value={t._id}>DEV-{t.order + 100} - {t.title}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Labels */}
                <div className="flex flex-col gap-2 relative">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nhãn (Labels)</span>
                    <div className="flex flex-wrap gap-1.5">
                        {(task.labels || []).map((label, idx) => (
                            <span 
                                key={idx} 
                                className="px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 group"
                                style={{ backgroundColor: `${label.color}15`, color: label.color, border: `1px solid ${label.color}30` }}
                            >
                                {label.text}
                                {!isViewer && (
                                    <button 
                                        className="opacity-0 group-hover:opacity-100"
                                        onClick={() => {
                                            const newLabels = (task.labels || []).filter((_, i) => i !== idx);
                                            onUpdateTask({ labels: newLabels });
                                        }}
                                    ><X size={10} /></button>
                                )}
                            </span>
                        ))}
                        {!isViewer && !isCreatingLabel && (
                            <button 
                                onClick={() => setIsCreatingLabel(true)}
                                className="flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                + Nhãn
                            </button>
                        )}
                        
                        {isCreatingLabel && (
                            <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 flex flex-col gap-3 min-w-[200px]">
                                <input 
                                    type="text" 
                                    placeholder="Tên nhãn..." 
                                    value={newLabelText}
                                    onChange={(e) => setNewLabelText(e.target.value)}
                                    className="w-full text-xs px-2 py-1.5 rounded bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#94a3b8'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewLabelColor(color)}
                                            className={`w-5 h-5 rounded-full border transition-transform ${newLabelColor === color ? 'scale-125 border-white shadow-sm ring-1 ring-blue-500' : 'border-transparent hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <button 
                                        onClick={() => {
                                            if (newLabelText.trim()) {
                                                const newLabels = [...(task.labels || []), { text: newLabelText, color: newLabelColor }];
                                                onUpdateTask({ labels: newLabels });
                                                setNewLabelText('');
                                                setIsCreatingLabel(false);
                                            }
                                        }}
                                        className="flex-1 text-xs bg-blue-500 text-white py-1 rounded hover:bg-blue-600 font-bold"
                                    >Lưu</button>
                                    <button 
                                        onClick={() => { setIsCreatingLabel(false); setNewLabelText(''); }}
                                        className="flex-1 text-xs bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300 py-1 rounded font-bold"
                                    >Hủy</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Story Points */}
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Điểm (Story)</span>
                    <input 
                        type="number" 
                        value={task.storyPoints || ''}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) onUpdateTask({ storyPoints: val });
                        }}
                        disabled={isViewer}
                        className="w-24 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
};
