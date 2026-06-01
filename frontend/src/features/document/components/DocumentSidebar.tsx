import React, { useState } from 'react';
import { IDocument } from '../api/document.api';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, Plus, Loader2, MoreVertical, Trash2, FileUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '../api/document.api';
import toast from 'react-hot-toast';

interface SidebarProps {
    docs: IDocument[];
    boards: any[];
    selectedWorkspaceId: string | null;
    setSelectedWorkspaceId: (id: string | null) => void;
    selectedDocId: string | null;
    setSelectedDocId: (id: string | null) => void;
    isLoadingDocs: boolean;
    isCreating: boolean;
    createDoc: () => void;
}

const TreeNode: React.FC<{
    item: IDocument;
    docs: IDocument[];
    selectedDocId: string | null;
    setSelectedDocId: (id: string | null) => void;
    level: number;
    onDrop: (draggedId: string, targetId: string | null) => void;
    onDeleteFolder: (id: string) => void;
}> = ({ item, docs, selectedDocId, setSelectedDocId, level, onDrop, onDeleteFolder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const children = docs.filter(d => d.parentId === item._id);

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', item._id);
        e.stopPropagation();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.isFolder && !isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== item._id && item.isFolder) {
            onDrop(draggedId, item._id);
        }
    };

    return (
        <div>
            <div
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                    if (item.isFolder) setIsOpen(!isOpen);
                    else setSelectedDocId(item._id);
                }}
                className={`flex items-center gap-1.5 p-2 rounded-xl cursor-pointer transition-colors group ${
                    selectedDocId === item._id 
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-[#151A26] text-slate-700 dark:text-slate-300'
                } ${isDragOver ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-500/20' : ''}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {item.isFolder ? (
                    <div className="flex items-center gap-1">
                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        {isOpen ? <FolderOpen size={16} className="text-blue-500" /> : <Folder size={16} className="text-blue-500" />}
                    </div>
                ) : (
                    <FileText size={16} className="ml-5 opacity-60" />
                )}
                <span className="font-medium text-sm truncate flex-1 select-none">
                    {item.title}
                </span>
                
                {item.isFolder && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm(`Bạn có chắc muốn xóa thư mục "${item.title}"? Các file bên trong sẽ được đưa ra ngoài.`)) {
                                onDeleteFolder(item._id);
                            }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            {item.isFolder && isOpen && (
                <div className="mt-0.5">
                    {children.map(child => (
                        <TreeNode 
                            key={child._id} 
                            item={child} 
                            docs={docs} 
                            selectedDocId={selectedDocId} 
                            setSelectedDocId={setSelectedDocId} 
                            level={level + 1}
                            onDrop={onDrop}
                            onDeleteFolder={onDeleteFolder}
                        />
                    ))}
                    {children.length === 0 && (
                        <div className="text-xs text-slate-400 italic py-1" style={{ paddingLeft: `${(level + 1) * 16 + 8 + 24}px` }}>
                            Thư mục trống
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const DocumentSidebar: React.FC<SidebarProps> = ({
    docs,
    boards,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedDocId,
    setSelectedDocId,
    isLoadingDocs,
    isCreating,
    createDoc
}) => {
    const queryClient = useQueryClient();
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const rootDocs = docs.filter(d => !d.parentId);

    const moveMutation = useMutation({
        mutationFn: ({ id, parentId }: { id: string, parentId: string | null }) => documentApi.move(id, parentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
            toast.success('Đã di chuyển tài liệu');
        },
        onError: () => toast.error('Lỗi di chuyển tài liệu')
    });

    const createFolderMutation = useMutation({
        mutationFn: () => documentApi.createFolder('Thư mục mới', selectedWorkspaceId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
        }
    });

    const deleteFolderMutation = useMutation({
        mutationFn: (id: string) => documentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
            toast.success('Đã xóa thư mục');
        },
        onError: () => toast.error('Lỗi khi xóa thư mục')
    });

    const handleDropOnRoot = (e: React.DragEvent) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId) {
            moveMutation.mutate({ id: draggedId, parentId: null });
        }
    };
    
    const importMutation = useMutation({
        mutationFn: (file: File) => documentApi.importWord(file, selectedWorkspaceId!, null),
        onSuccess: (newDoc) => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
            setSelectedDocId(newDoc._id);
            toast.success('Nhập file Word thành công!');
        },
        onError: () => toast.error('Lỗi nhập file Word')
    });
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.docx')) {
                toast.error('Chỉ hỗ trợ file .docx');
                return;
            }
            importMutation.mutate(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm ${selectedDocId ? 'hidden md:flex' : 'flex w-full md:w-80'}`}>
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col gap-4">
                <select 
                    value={selectedWorkspaceId || ''} 
                    onChange={(e) => {
                        setSelectedWorkspaceId(e.target.value);
                        setSelectedDocId(null);
                    }}
                    className="w-full bg-slate-50 dark:bg-[#151A26] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-blue-500 transition-colors font-semibold appearance-none cursor-pointer"
                >
                    {boards?.map(b => {
                        const wId = typeof b.workspaceId === 'object' ? (b.workspaceId as any)._id : b.workspaceId;
                        return <option key={wId} value={wId}>{b.title}</option>;
                    })}
                </select>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => createDoc()}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors text-sm font-semibold"
                    >
                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Tài liệu
                    </button>
                    <button 
                        onClick={() => createFolderMutation.mutate()}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 transition-colors text-sm font-semibold"
                    >
                        {createFolderMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Folder size={16} />}
                        Thư mục
                    </button>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm font-medium"
                >
                    {importMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                    Nhập từ Word (.docx)
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".docx" className="hidden" />
            </div>
            
            <div 
                className="flex-1 overflow-y-auto custom-scrollbar p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropOnRoot}
            >
                {isLoadingDocs ? (
                    <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                    <div className="space-y-0.5">
                        {rootDocs.map(doc => (
                            <TreeNode 
                                key={doc._id} 
                                item={doc} 
                                docs={docs} 
                                selectedDocId={selectedDocId} 
                                setSelectedDocId={setSelectedDocId}
                                level={0}
                                onDrop={(draggedId, targetId) => moveMutation.mutate({ id: draggedId, parentId: targetId })}
                                onDeleteFolder={(id) => deleteFolderMutation.mutate(id)}
                            />
                        ))}
                        {docs.length === 0 && (
                            <div className="text-center p-6 text-sm text-slate-400">
                                Chưa có tài liệu nào.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
