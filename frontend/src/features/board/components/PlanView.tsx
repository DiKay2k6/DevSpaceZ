import React, { useState, useMemo } from 'react';
import { Board, Task } from '@/features/board/api/board.api';
import { ChevronRight, ChevronDown, Plus, LayoutList, CheckCircle2, Circle, AlertCircle, Clock, Search, Filter } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface PlanViewProps {
    board: Board;
    onTaskClick: (task: Task, listName: string) => void;
    onUpdateTask: (taskId: string, data: Partial<Task>) => void;
    searchQuery: string;
    selectedAssignees?: string[];
    selectedComponent?: string;
}

// Hàm đệ quy để xây dựng cây công việc
const buildTree = (tasks: Task[], parentId?: string): (Task & { children: any[] })[] => {
    return tasks
        .filter(t => t.parentId === parentId || (!parentId && !t.parentId))
        .map(t => ({
            ...t,
            children: buildTree(tasks, t._id)
        }));
};

export const PlanView: React.FC<PlanViewProps> = ({ board, onTaskClick, onUpdateTask, searchQuery, selectedAssignees = [], selectedComponent = '' }) => {
    const allTasks = useMemo(() => board.lists?.flatMap(l => l.tasks) || [], [board]);
    
    // Xây dựng cây
    const treeData = useMemo(() => {
        const isFilterActive = searchQuery || selectedAssignees.length > 0 || selectedComponent;
        
        // Lọc theo search/assignee/component (nếu có, làm phẳng cây để dễ nhìn)
        if (isFilterActive) {
            const filtered = allTasks.filter(task => {
                const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
                
                const matchesAssignee = selectedAssignees.length === 0 || 
                                        (task.assignees || []).some(a => selectedAssignees.includes(a._id));
                
                const matchesComponent = !selectedComponent || task.component === selectedComponent;
                
                return matchesSearch && matchesAssignee && matchesComponent;
            });
            return filtered.map(t => ({ ...t, children: [] }));
        }
        return buildTree(allTasks);
    }, [allTasks, searchQuery, selectedAssignees, selectedComponent]);

    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set(allTasks.map(t => t._id)));

    const toggleExpand = (taskId: string) => {
        const newKeys = new Set(expandedKeys);
        if (newKeys.has(taskId)) {
            newKeys.delete(taskId);
        } else {
            newKeys.add(taskId);
        }
        setExpandedKeys(newKeys);
    };

    const getStatusIcon = (status: string = 'Not Started') => {
        switch (status) {
            case 'Done': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'In Progress': return <Clock size={16} className="text-blue-500" />;
            case 'Review': return <AlertCircle size={16} className="text-amber-500" />;
            default: return <Circle size={16} className="text-slate-400" />;
        }
    };

    const getTypeColor = (type: string = 'Task') => {
        switch (type) {
            case 'Epic': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30';
            case 'Feature': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30';
            case 'Bug': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300 border-slate-200 dark:border-slate-500/30';
        }
    };

    const renderTreeRow = (node: Task & { children: any[] }, level: number = 0) => {
        const isExpanded = expandedKeys.has(node._id);
        const hasChildren = node.children.length > 0;
        const list = board.lists?.find(l => l._id === node.listId);
        
        // Tính toán Progress Bar cho Epic/Feature dựa trên việc con
        let percent = 0;
        if (hasChildren) {
            // Flatten tất cả các task con (sub-tree) để tính tổng
            const getAllDescendants = (n: any): any[] => {
                let desc: any[] = [];
                n.children.forEach((c: any) => {
                    desc.push(c);
                    desc = desc.concat(getAllDescendants(c));
                });
                return desc;
            };
            const descendants = getAllDescendants(node);
            const doneCount = descendants.filter(d => d.status === 'Done').length;
            percent = descendants.length > 0 ? Math.round((doneCount / descendants.length) * 100) : 0;
        }

        return (
            <React.Fragment key={node._id}>
                <div 
                    className="grid grid-cols-[1fr_150px_150px_200px] items-center gap-4 py-3 px-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 transition-colors cursor-pointer group"
                    onClick={() => onTaskClick(node, list?.title || '')}
                >
                    {/* Cột 1: Tên (Thụt lề) */}
                    <div className="flex items-center gap-2 relative min-w-0" style={{ paddingLeft: `${level * 28}px` }}>
                        {/* Tree lines cho các node con */}
                        {level > 0 && (
                            <>
                                <div className="absolute left-0 top-1/2 w-4 h-px bg-slate-300 dark:bg-white/20" style={{ left: `${(level * 28) - 16}px` }} />
                                <div className="absolute top-0 bottom-1/2 w-px bg-slate-300 dark:bg-white/20" style={{ left: `${(level * 28) - 16}px` }} />
                            </>
                        )}
                        <div 
                            className="w-5 h-5 flex items-center justify-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors relative z-10 bg-white dark:bg-transparent rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (hasChildren) toggleExpand(node._id);
                            }}
                        >
                            {hasChildren ? (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span className="w-4" />}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shadow-sm relative z-10 ${getTypeColor(node.type)}`}>
                            {node.type || 'Task'}
                        </span>
                        {/* Priority Badge */}
                        {node.priority && (
                            <div className={`flex items-center justify-center w-5 h-5 rounded border relative z-10 ${
                                node.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' :
                                node.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30' :
                                'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                            }`} title={`Độ ưu tiên: ${node.priority}`}>
                                {node.priority === 'High' ? <span className="font-bold">↑</span> :
                                 node.priority === 'Medium' ? <span className="font-bold">-</span> :
                                 <span className="font-bold">↓</span>}
                            </div>
                        )}
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10">
                            {node.title}
                        </span>
                    </div>

                    {/* Cột 2: Status */}
                    <div className="flex items-center gap-2">
                        {getStatusIcon(node.status)}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{node.status || 'Not Started'}</span>
                    </div>

                    {/* Cột 3: Assignee */}
                    <div className="flex items-center">
                        {node.assignees && node.assignees.length > 0 ? (
                            <div className="flex -space-x-2">
                                {node.assignees.map((a: any, i) => {
                                    const avatarUrl = a.avatar_url ? a.avatar_url : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.full_name || 'User')}&backgroundColor=6366f1&textColor=ffffff`;
                                    return (
                                        <img crossOrigin="anonymous" key={i} src={avatarUrl} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0B0F19]" title={a.full_name} />
                                    );
                                })}
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">Chưa giao</span>
                        )}
                    </div>

                    {/* Cột 4: Component / Progress (Fake for now) */}
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <div className="flex flex-col gap-1 w-full max-w-[120px]">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                    <span>Tiến độ</span>
                                    <span>{percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        ) : (
                            node.component ? (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 truncate max-w-[120px]" title={node.component}>
                                    {node.component}
                                </span>
                            ) : (
                                <span className="text-xs text-slate-400">-</span>
                            )
                        )}
                    </div>
                </div>

                {/* Render con */}
                {isExpanded && hasChildren && node.children.map(child => renderTreeRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            <div className="bg-white/80 dark:bg-[#111520]/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.05)] overflow-hidden flex flex-col max-h-full">
                
                {/* Header Dọc */}
                <div className="grid grid-cols-[1fr_150px_150px_200px] gap-4 py-4 px-6 bg-slate-100/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest sticky top-0 z-20 backdrop-blur-md">
                    <div>Tên công việc</div>
                    <div>Trạng thái</div>
                    <div>Người phụ trách</div>
                    <div>Thành phần</div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto custom-scrollbar pb-6 relative">
                    {/* Dây dọc ảo để nối các level 0 nếu cần (bỏ qua cho sạch) */}
                    {treeData.length > 0 ? (
                        treeData.map(node => renderTreeRow(node, 0))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <LayoutList size={48} className="mb-4 opacity-20" />
                            <p className="font-medium text-slate-500">Chưa có công việc nào.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
