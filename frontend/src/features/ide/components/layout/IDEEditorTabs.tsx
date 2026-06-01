import React from 'react';
import { X } from 'lucide-react';

interface IDEEditorTabsProps {
    openFiles: string[];
    currentFile: string;
    handleFileSelect: (path: string) => void;
    closeTab: (file: string) => void;
    handleDragStart: (e: React.DragEvent, file: string) => void;
    handleDrop: (e: React.DragEvent, file: string) => void;
    handleDragOver: (e: React.DragEvent) => void;
}

export const IDEEditorTabs: React.FC<IDEEditorTabsProps> = ({
    openFiles,
    currentFile,
    handleFileSelect,
    closeTab,
    handleDragStart,
    handleDrop,
    handleDragOver
}) => {
    return (
        <div className="flex bg-slate-100 dark:bg-[#2d2d2d] overflow-x-auto custom-scrollbar border-b border-slate-200 dark:border-[#1e1e1e] min-h-[35px]">
            {openFiles.length === 0 ? (
                <div className="px-4 py-2 text-sm text-slate-400 italic border-r border-transparent">No file open</div>
            ) : openFiles.map(file => (
                <div 
                    key={file}
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onDrop={(e) => handleDrop(e, file)}
                    onDragOver={handleDragOver}
                    onClick={() => handleFileSelect(file)}
                    className={`group flex items-center gap-2 px-4 py-2 border-r border-slate-200 dark:border-[#1e1e1e] text-sm cursor-pointer border-t-2 transition-colors ${
                        currentFile === file 
                            ? 'bg-white dark:bg-[#1e1e1e] text-blue-600 dark:text-white border-t-blue-500' 
                            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-[#1e1e1e]/50 border-t-transparent'
                    }`}
                >
                    <span className="truncate max-w-[150px]">{file.split('/').pop()}</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(file);
                        }}
                        className={`ml-1 rounded-md p-0.5 transition-opacity ${currentFile === file ? 'opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700' : 'opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        <X size={14} className="text-slate-500 hover:text-red-500" />
                    </button>
                </div>
            ))}
        </div>
    );
};
