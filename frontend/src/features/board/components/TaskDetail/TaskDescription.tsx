import React, { useState, useEffect } from 'react';
import { AlignLeft } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/shared/ui/Button';

interface TaskDescriptionProps {
    description: string;
    isViewer: boolean;
    isUpdating: boolean;
    onUpdateDescription: (desc: string) => void;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({
    description: initialDescription, isViewer, isUpdating, onUpdateDescription
}) => {
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [description, setDescription] = useState(initialDescription || '');

    useEffect(() => {
        if (!isEditingDesc) {
            setDescription(initialDescription || '');
        }
    }, [initialDescription, isEditingDesc]);

    const handleSaveDescription = () => {
        setIsEditingDesc(false);
        if (description !== (initialDescription || '')) {
            onUpdateDescription(description);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2 tracking-wide uppercase">
                    <AlignLeft size={16} className="text-slate-400" /> Mô tả chi tiết
                </h3>
                <div className="flex items-center gap-2">
                    {isUpdating && <span className="text-[10px] font-bold text-blue-500 uppercase animate-pulse bg-blue-500/10 px-2 py-0.5 rounded">Đang lưu...</span>}
                    {!isEditingDesc && !isViewer && (
                        <button 
                            onClick={() => setIsEditingDesc(true)}
                            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 px-2 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-500/10 rounded transition-colors"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>
            
            <div data-color-mode="auto">
                {isEditingDesc ? (
                    <div className="border border-blue-500 rounded-xl overflow-hidden shadow-sm">
                        <MDEditor
                            value={description}
                            onChange={(val) => setDescription(val || '')}
                            preview="edit"
                            height={250}
                            className="!border-0"
                        />
                        <div className="flex justify-end gap-2 p-2 bg-slate-50 dark:bg-[#151A26] border-t border-slate-200 dark:border-white/10">
                            <Button size="sm" variant="outline" onClick={() => { setIsEditingDesc(false); setDescription(initialDescription || ''); }}>Hủy</Button>
                            <Button size="sm" onClick={handleSaveDescription}>Lưu mô tả</Button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className={`w-full min-h-[140px] bg-slate-50 dark:bg-white/[0.02] p-4 rounded-xl border border-transparent transition-all markdown-body-container ${isViewer ? 'cursor-default' : 'hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:border-slate-200 dark:hover:border-white/10 cursor-pointer'}`}
                        onClick={() => !isViewer && setIsEditingDesc(true)}
                    >
                        {description ? (
                            <MDEditor.Markdown source={description} style={{ backgroundColor: 'transparent', fontSize: '14px' }} />
                        ) : (
                            <span className="text-slate-400 text-[15px] font-medium">Thêm mô tả về yêu cầu, luồng xử lý hoặc ghi chú... (Hỗ trợ Markdown)</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
