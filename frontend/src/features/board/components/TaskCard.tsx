import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/features/board/api/board.api';
import { Clock, AlignLeft, CheckSquare, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { differenceInDays, isPast, isToday } from 'date-fns';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';

interface Props {
    task: Task;
    index: number;
    onClick?: () => void;
    onDelete?: (e: React.MouseEvent) => void;
    isDragDisabled?: boolean;
    allTasks?: Task[];
    workspaceMembers?: any[];
}

export const TaskCardComponent: React.FC<Props> = ({ task, index, onClick, onDelete, isDragDisabled, allTasks, workspaceMembers = [] }) => {
    const { openProfile } = useUserProfileStore();

    // Check Blocked Status
    const isBlocked = React.useMemo(() => {
        if (!task.dependencies || task.dependencies.length === 0 || !allTasks) return false;
        return task.dependencies.some(depId => {
            const depTask = allTasks.find(t => t._id === depId);
            return depTask && depTask.status !== 'Done';
        });
    }, [task.dependencies, allTasks]);

    return (
        <Draggable draggableId={task._id} index={index} isDragDisabled={isDragDisabled}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    className={`mb-2.5 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl p-4 rounded-2xl border relative overflow-hidden ${
                        snapshot.isDragging 
                            ? 'border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] z-50 ring-1 ring-blue-500/30' 
                            : 'border-slate-200 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-500/50 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]'
                    } transition-colors transition-shadow duration-300 select-none cursor-pointer group`}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-colors duration-500 pointer-events-none" />

                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-wrap items-center gap-2 relative z-10">
                            {/* Type Badge */}
                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase shadow-sm border ${
                                (task.type || 'Task') === 'Feature' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30' :
                                (task.type === 'Bug' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
                                (task.type === 'Epic' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30' :
                                'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/5'))
                            }`}>
                                {task.type || 'Task'}
                            </div>

                            {/* Priority Badge */}
                            {task.priority && (
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]' :
                                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' :
                                    'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                                }`} title={`Độ ưu tiên: ${task.priority}`}>
                                    {task.priority === 'High' ? <><ChevronUp size={12} strokeWidth={3} /> Cao</> :
                                     task.priority === 'Medium' ? <><Minus size={12} strokeWidth={3} /> TB</> :
                                     <><ChevronDown size={12} strokeWidth={3} /> Thấp</>}
                                </div>
                            )}
                            {/* Blocked Badge */}
                            {isBlocked && (
                                <div className="flex items-center justify-center w-5 h-5 rounded border bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" title="Đang bị chặn (Blocked)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-2 relative z-10 shrink-0">
                            {/* Delete Button */}
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn mở modal chi tiết
                                        onDelete(e);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Xóa thẻ"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                </button>
                            )}
                            
                            {/* Sub ID (Optional for enterprise look) */}
                            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                DEV-{task.order + 100}
                            </span>
                        </div>
                    </div>

                    {/* Labels */}
                    {(task.labels && task.labels.length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.labels.map(label => (
                                <span 
                                    key={label._id || label.text} 
                                    className="px-1.5 py-0.5 rounded-sm text-[9px] font-semibold tracking-wide uppercase"
                                    style={{ backgroundColor: `${label.color}15`, color: label.color }}
                                >
                                    {label.text}
                                </span>
                            ))}
                        </div>
                    )}

                    <h4 className="text-[15px] leading-relaxed font-bold text-slate-800 dark:text-slate-100 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10 line-clamp-2 break-all">
                        {task.title}
                    </h4>

                    {/* Metadata Footer */}
                    <div className="flex items-end justify-between relative z-10">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400 dark:text-slate-500 w-[70%]">
                            {task.description && (
                                <div className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" title="Có mô tả">
                                    <AlignLeft size={14} />
                                </div>
                            )}
                            {(task.checklists && task.checklists.length > 0) && (
                                <div className={`flex items-center gap-1 transition-colors ${task.checklists.filter(c => c.isCompleted).length === task.checklists.length ? 'text-green-500' : 'hover:text-slate-600 dark:hover:text-slate-300'}`} title="Checklist">
                                    <CheckSquare size={14} />
                                    <span>{task.checklists.filter(c => c.isCompleted).length}/{task.checklists.length}</span>
                                </div>
                            )}
                            {task.storyPoints ? (
                                <div className="shrink-0 flex items-center gap-1 font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded text-[11px]" title="Điểm ước lượng (Story Points)">
                                    {task.storyPoints} pts
                                </div>
                            ) : null}
                            {task.dueDate && (() => {
                                const date = new Date(task.dueDate);
                                const isOverdue = isPast(date) && !isToday(date);
                                const daysLeft = differenceInDays(date, new Date());
                                
                                let colorClass = "text-slate-500 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10";
                                let text = `${daysLeft}d`;
                                
                                if (isOverdue) {
                                    colorClass = "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-500/20 dark:text-red-400";
                                    text = "Quá hạn";
                                } else if (daysLeft <= 1) {
                                    colorClass = "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-500/20 dark:text-orange-400";
                                    text = daysLeft === 0 ? "Hôm nay" : "1d";
                                }
                                
                                return (
                                    <div className={`shrink-0 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded border ${colorClass}`} title={`Đến hạn: ${date.toLocaleDateString('vi-VN')}`}>
                                        <Clock size={12} />
                                        <span className="font-semibold text-[10px] uppercase tracking-wider">{text}</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Assignees ở góc phải dưới */}
                        <div className="flex -space-x-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                            {task.assignees?.map((user, idx) => {
                                const isString = typeof user === 'string';
                                const userIdStr = isString ? user : (user as any)?._id;
                                const memberObj = isString 
                                    ? workspaceMembers.find((m: any) => m._id === userIdStr)
                                    : user;
                                    
                                const displayName = (memberObj as any)?.full_name || 'User';
                                const avatar = (memberObj as any)?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=6366f1&textColor=ffffff`;

                                return (
                                    <img 
                                        crossOrigin="anonymous"
                                        key={userIdStr || Math.random()}
                                        src={avatar} 
                                        alt={displayName}
                                        title={displayName}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (userIdStr) openProfile(userIdStr);
                                        }}
                                        className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#1A2133] hover:-translate-y-1 hover:scale-110 hover:z-20 transition-all shadow-sm cursor-pointer"
                                        style={{ zIndex: 10 - idx }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

const areEqual = (prev: Props, next: Props) => {
    if (prev.task._id !== next.task._id) return false;
    if (prev.task.status !== next.task.status) return false;
    if (prev.task.title !== next.task.title) return false;
    if (prev.index !== next.index) return false;
    if (prev.isDragDisabled !== next.isDragDisabled) return false;
    if (prev.task.assignees?.length !== next.task.assignees?.length) return false;
    if (prev.task.dependencies?.length !== next.task.dependencies?.length) return false;
    if (prev.task.priority !== next.task.priority) return false;
    if (prev.task.type !== next.task.type) return false;
    if (prev.task.dueDate !== next.task.dueDate) return false;
    if (prev.task.storyPoints !== next.task.storyPoints) return false;
    if (prev.task.description !== next.task.description) return false;
    if (prev.task.component !== next.task.component) return false;
    
    // Kiểm tra trạng thái của các dependencies có thay đổi không
    if (prev.task.dependencies && prev.task.dependencies.length > 0) {
        const prevBlocked = prev.task.dependencies.some(depId => {
            const depTask = prev.allTasks?.find(t => t._id === depId);
            return depTask && depTask.status !== 'Done';
        });
        const nextBlocked = next.task.dependencies?.some(depId => {
            const depTask = next.allTasks?.find(t => t._id === depId);
            return depTask && depTask.status !== 'Done';
        });
        if (prevBlocked !== nextBlocked) return false;
    }

    return true;
};

export const TaskCard = React.memo(TaskCardComponent, areEqual);
