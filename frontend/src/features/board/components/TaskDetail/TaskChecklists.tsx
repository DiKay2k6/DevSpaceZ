import React from 'react';
import { CheckSquare, X } from 'lucide-react';

interface ChecklistItem {
    _id?: string;
    title: string;
    isCompleted: boolean;
}

interface TaskChecklistsProps {
    checklists: ChecklistItem[];
    isViewer: boolean;
    onUpdateChecklists: (checklists: ChecklistItem[]) => void;
}

export const TaskChecklists: React.FC<TaskChecklistsProps> = ({
    checklists = [], isViewer, onUpdateChecklists
}) => {
    const total = checklists.length;
    const completed = checklists.filter(c => c.isCompleted).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckSquare size={16} className="text-slate-400" /> Hạng mục con (Checklist)
                </h3>
            </div>
            
            {/* Progress bar */}
            {total > 0 && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-8 text-right">{percent}%</span>
                </div>
            )}

            <div className="space-y-1.5 mb-3 bg-slate-50 dark:bg-[#151A26] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                {checklists.map((item, idx) => (
                    <div key={item._id || idx} className="flex items-start gap-3 group px-2 py-1.5 hover:bg-white dark:hover:bg-[#111520] rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5 hover:shadow-sm">
                        <input 
                            type="checkbox" 
                            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" 
                            checked={item.isCompleted} 
                            disabled={isViewer}
                            onChange={() => {
                                const newChecklists = [...checklists];
                                newChecklists[idx].isCompleted = !newChecklists[idx].isCompleted;
                                onUpdateChecklists(newChecklists);
                            }}
                        />
                        <span className={`flex-1 text-sm ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.title}
                        </span>
                        {!isViewer && (
                            <button 
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    const newChecklists = checklists.filter((_, i) => i !== idx);
                                    onUpdateChecklists(newChecklists);
                                }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
                {!isViewer && (
                    <button 
                        onClick={() => {
                            const title = window.prompt('Nhập nội dung checklist:');
                            if (title) {
                                const newChecklists = [...checklists, { title, isCompleted: false }];
                                onUpdateChecklists(newChecklists);
                            }
                        }}
                        className="w-full text-left text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                    >
                        + Thêm mục con...
                    </button>
                )}
            </div>
        </div>
    );
};
