import React, { useState, useEffect } from 'react';
import { X, Trash2, GitBranch, Copy, Check, Loader2 } from 'lucide-react';

interface TaskHeaderProps {
    taskTitle: string;
    listName: string;
    taskOrder: number;
    taskType: string;
    isViewer: boolean;
    canManageTask: boolean;
    isDeleting: boolean;
    onUpdateTitle: (title: string) => void;
    onClose: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
    taskTitle, listName, taskOrder, taskType, isViewer, canManageTask, isDeleting, onUpdateTitle, onClose
}) => {
    const [title, setTitle] = useState(taskTitle);
    const [copiedBranch, setCopiedBranch] = useState(false);

    useEffect(() => {
        setTitle(taskTitle);
    }, [taskTitle]);

    const handleBlurTitle = () => {
        if (title.trim() && title !== taskTitle && canManageTask) {
            onUpdateTitle(title.trim());
        } else {
            setTitle(taskTitle);
        }
    };

    const getBranchPrefix = () => {
        return taskType === 'Feature' ? 'feature' : taskType === 'Bug' ? 'bugfix' : 'chore';
    };

    const getBranchName = () => {
        return `${getBranchPrefix()}/DEV-${taskOrder + 100}-${taskTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
    };

    return (
        <div className="flex flex-col shrink-0">
            {/* Top Actions Bar */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400 tracking-wide">{listName}</span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500">DEV-{taskOrder + 100}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Title Section */}
            <div className="px-6 pt-6 pb-4 space-y-4">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlurTitle}
                    disabled={!canManageTask}
                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                    className="w-full text-2xl md:text-[28px] leading-tight font-extrabold bg-transparent border-2 border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-blue-500 dark:focus:border-blue-500/50 focus:bg-slate-50 dark:focus:bg-white/5 rounded-xl px-3 py-1.5 -ml-3 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Tên công việc..."
                />

                {/* Git Branch Hint */}
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-[#111520] rounded-lg border border-slate-200 dark:border-white/10 shadow-sm w-fit group">
                    <GitBranch size={14} className="text-slate-400" />
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-medium select-all">
                        {getBranchName()}
                    </span>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(getBranchName());
                            setCopiedBranch(true);
                            setTimeout(() => setCopiedBranch(false), 2000);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-800 rounded transition-all opacity-0 group-hover:opacity-100 ml-2"
                        title="Copy Branch Name"
                    >
                        {copiedBranch ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
