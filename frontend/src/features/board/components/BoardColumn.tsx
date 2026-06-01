import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { List, Task } from '@/features/board/api/board.api';
import { TaskCard } from './TaskCard';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { Plus, X, Trash2, AlertTriangle, Settings2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface Props {
    list: List;
    index: number;
    boardId: string;
    onTaskClick: (task: Task) => void;
    isFilterActive: boolean;
    searchQuery?: string;
    selectedAssignees?: string[];
    selectedComponent?: string;
    allTasks: Task[];
    isViewer?: boolean;
    canCreateTask?: boolean;
    canManageColumns?: boolean;
    canDeleteTask?: boolean;
    canMoveTask?: boolean;
    workspaceMembers?: any[];
}

export const BoardColumnComponent: React.FC<Props> = ({ 
    list, 
    index, 
    boardId, 
    onTaskClick,
    isFilterActive,
    searchQuery = '',
    selectedAssignees = [],
    selectedComponent = '',
    allTasks,
    isViewer = false,
    canCreateTask = false,
    canManageColumns = false,
    canDeleteTask = false,
    canMoveTask = false,
    workspaceMembers = []
}) => {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const boardActions = useBoardActions(boardId);

    const handleDeleteList = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa danh sách "${list.title}"? Toàn bộ thẻ bên trong sẽ bị xóa.`)) {
            boardActions.deleteList(list._id);
        }
    };

    const handleDeleteTask = (taskId: string, title: string) => {
        if (window.confirm(`Bạn có chắc muốn xóa thẻ "${title}"?`)) {
            boardActions.deleteTask(taskId);
        }
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        boardActions.createTask({ title: newTaskTitle, listId: list._id }, {
            onSuccess: () => {
                setIsAddingTask(false);
                setNewTaskTitle('');
            }
        });
    };

    const filteredTasks = list.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesAssignee = selectedAssignees.length === 0 || 
                                (task.assignees || []).some(a => selectedAssignees.includes(a._id));
        
        const matchesComponent = !selectedComponent || task.component === selectedComponent;
        
        return matchesSearch && matchesAssignee && matchesComponent;
    });

    const isOverWip = list.wipLimit && list.tasks.length > list.wipLimit;

    const handleSetWipLimit = () => {
        const currentLimit = list.wipLimit || '';
        const input = window.prompt(`Nhập giới hạn WIP cho cột "${list.title}" (Để trống để gỡ bỏ):`, currentLimit.toString());
        if (input === null) return; // Cancel
        const parsed = parseInt(input);
        boardActions.updateList({ listId: list._id, data: { wipLimit: isNaN(parsed) || parsed <= 0 ? null : parsed } });
    };

    return (
        <Draggable draggableId={list._id} index={index} isDragDisabled={isFilterActive}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex flex-col flex-shrink-0 w-[300px] ${isOverWip ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-slate-200/80 dark:bg-[#1A2133]/90'} rounded-2xl border ${
                        snapshot.isDragging ? 'border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] z-40' : (isOverWip ? 'border-red-400/50 dark:border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' : 'border-slate-300 dark:border-white/5 shadow-sm')
                    } max-h-full transition-colors transition-shadow duration-300 relative`}
                >
                    
                    {/* Column Header (Drag Handle) */}
                    <div 
                        {...provided.dragHandleProps}
                        className={`p-3.5 pb-2 flex items-start justify-between cursor-grab active:cursor-grabbing group ${isOverWip ? 'border-b border-red-200/50 dark:border-red-500/20 mb-2' : ''}`}
                    >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            {isOverWip && <span className="shrink-0 mt-0.5" title="Vượt quá WIP Limit!"><AlertTriangle size={16} className="text-red-500 animate-pulse" /></span>}
                            <h3 className="font-bold text-[14px] text-slate-800 dark:text-white transition-colors tracking-wide break-words whitespace-normal min-w-0" title={list.title}>
                                {list.title}
                            </h3>
                            <button 
                                onClick={canManageColumns ? handleSetWipLimit : undefined}
                                className={`flex items-center justify-center whitespace-nowrap min-w-[20px] w-auto h-5 px-2 mt-px rounded-md text-[11px] font-bold shadow-sm border ${canManageColumns ? 'cursor-pointer hover:scale-105' : 'cursor-default'} transition-transform ${isOverWip ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-white/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 border-white/50 dark:border-white/5 hover:bg-white dark:hover:bg-white/20'}`}
                                title={canManageColumns ? "Cài đặt WIP Limit" : "WIP Limit"}
                            >
                                {list.tasks.length} {list.wipLimit ? `/ ${list.wipLimit}` : ''}
                            </button>
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                            {canManageColumns && (
                                <>
                                    <button 
                                        onClick={handleSetWipLimit}
                                        title="Cài đặt Cột"
                                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        <Settings2 size={16} />
                                    </button>
                                    <button 
                                        onClick={handleDeleteList}
                                        disabled={boardActions.isDeletingList}
                                        title="Xóa danh sách"
                                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                    >
                                        {boardActions.isDeletingList ? <span className="block w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Droppable Task List */}
                    <Droppable droppableId={list._id} isDropDisabled={isFilterActive || isViewer || !canMoveTask}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto px-2 pb-2 pt-2 min-h-[100px] transition-colors duration-200 custom-scrollbar ${
                            snapshot.isDraggingOver ? 'bg-black/5 dark:bg-white/5 rounded-xl' : ''
                        }`}
                    >
                        {filteredTasks.map((task, index) => (
                            <TaskCard 
                                key={task._id} 
                                task={task} 
                                index={index} 
                                onClick={() => onTaskClick(task)}
                                onDelete={canDeleteTask ? () => handleDeleteTask(task._id, task.title) : undefined}
                                isDragDisabled={isFilterActive || isViewer || !canMoveTask}
                                allTasks={allTasks}
                                workspaceMembers={workspaceMembers}
                            />
                        ))}
                        {provided.placeholder}
                        
                        {isFilterActive && filteredTasks.length === 0 && (
                            <div className="text-center text-sm text-slate-500 py-4 italic">
                                Không có thẻ nào khớp với bộ lọc
                            </div>
                        )}
                    </div>
                )}
            </Droppable>

            <div className="p-2 pt-0">
                {canCreateTask && (
                    isAddingTask ? (
                        <form onSubmit={handleCreateTask} className="bg-white/80 dark:bg-[#151A26]/80 backdrop-blur-md p-2.5 rounded-xl border border-blue-400/50 shadow-lg mt-1 animate-in fade-in zoom-in-95">
                            <textarea
                                autoFocus
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCreateTask(e);
                                    }
                                }}
                                placeholder="Nhập tiêu đề thẻ..."
                                className="w-full text-sm font-medium bg-transparent outline-none resize-none dark:text-white placeholder:text-slate-400 mb-2 min-h-[60px]"
                            />
                            <div className="flex items-center gap-2">
                                <Button type="submit" size="sm" isLoading={boardActions.isCreatingTask} className="rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                    Thêm thẻ
                                </Button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddingTask(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => setIsAddingTask(true)}
                            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50 hover:shadow-sm dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-all border border-transparent hover:border-white/50 dark:hover:border-white/5"
                        >
                            <Plus size={16} /> Thêm thẻ mới
                        </button>
                    )
                )}
            </div>
        </div>
            )}
        </Draggable>
    );
};

export const BoardColumn = React.memo(BoardColumnComponent, (prev, next) => {
    // Re-render nếu List (cột) thay đổi (đổi tên, thêm/bớt/đổi vị trí task)
    if (prev.list !== next.list) return false;
    
    // Re-render nếu bộ lọc thay đổi
    if (prev.isFilterActive !== next.isFilterActive) return false;
    if (prev.searchQuery !== next.searchQuery) return false;
    if (prev.selectedAssignees !== next.selectedAssignees) return false;
    if (prev.selectedComponent !== next.selectedComponent) return false;
    
    // Check permission changes
    if (prev.canCreateTask !== next.canCreateTask) return false;
    if (prev.canManageColumns !== next.canManageColumns) return false;
    if (prev.canDeleteTask !== next.canDeleteTask) return false;
    if (prev.canMoveTask !== next.canMoveTask) return false;
    if (prev.isViewer !== next.isViewer) return false;
    
    return true;
});
