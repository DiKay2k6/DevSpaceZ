import React, { useState, useEffect } from 'react';
import { Search, Zap, CheckCircle2, User, X, Tag } from 'lucide-react';
import { Task } from '@/features/board/api/board.api';
import { useAuthStore } from '@/entities/user/model/authStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tasks: Task[];
    onUpdateTask: (taskId: string, data: Partial<Task>) => void;
    onOpenTask: (task: Task) => void;
}

export const CommandPalette: React.FC<Props> = ({ isOpen, onClose, tasks, onUpdateTask, onOpenTask }) => {
    const [query, setQuery] = useState('');
    const { user } = useAuthStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-command-palette'));
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase()));

    const handleAction = (task: Task, action: 'start' | 'done' | 'assign_me') => {
        if (action === 'start') onUpdateTask(task._id, { status: 'In Progress' });
        if (action === 'done') onUpdateTask(task._id, { status: 'Done' });
        if (action === 'assign_me' && user) {
            const currentAssignees = task.assignees?.map(a => a._id) || [];
            if (!currentAssignees.includes(user._id)) {
                onUpdateTask(task._id, { assignees: [...currentAssignees, user._id] as any });
            }
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-[600px] bg-white dark:bg-[#151A26] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-white/10">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm thẻ hoặc gõ lệnh... (vd: fix, login)"
                        className="w-full bg-transparent border-none px-4 py-4 text-base font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-500 rounded border border-slate-200 dark:border-white/5">ESC</kbd>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
                    {query.trim() === '' ? (
                        <div className="p-8 text-center text-slate-500 font-medium text-sm">
                            Bắt đầu gõ để tìm kiếm thẻ và thao tác nhanh.
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        <div className="space-y-1">
                            {filteredTasks.map(task => (
                                <div key={task._id} className="group p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
                                    <div 
                                        className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2 cursor-pointer hover:text-blue-500 transition-colors"
                                        onClick={() => { onOpenTask(task); onClose(); }}
                                    >
                                        <span className="text-slate-400 mr-2 font-mono text-[11px]">DEV-{task.order + 100}</span>
                                        {task.title}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleAction(task, 'start')} className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                                            <Zap size={12} /> Bắt đầu làm (In Progress)
                                        </button>
                                        <button onClick={() => handleAction(task, 'done')} className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                                            <CheckCircle2 size={12} /> Hoàn thành (Done)
                                        </button>
                                        <button onClick={() => handleAction(task, 'assign_me')} className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors">
                                            <User size={12} /> Nhận việc (Assign Me)
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-slate-500 font-medium text-sm">
                            Không tìm thấy thẻ nào phù hợp.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
