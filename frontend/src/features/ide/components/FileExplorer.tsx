import React, { useState } from 'react';
import { Folder, FileCode2, FileJson, FileType2, FileImage, Plus, FolderPlus, Trash2, X, Edit2, Shield } from 'lucide-react';

export interface FileNode {
    name: string;
    type: 'file' | 'dir';
    path: string;
    children?: FileNode[];
}

interface FileExplorerProps {
    files: FileNode[];
    onFileSelect: (path: string, language: string) => void;
    onCreateFile: (path: string) => void;
    onDeleteFile: (path: string) => void;
    onCreateFolder?: (path: string) => void;
    onRenameFile?: (oldPath: string, newPath: string) => void;
    onRefresh?: () => void;
    onManagePermissions?: (path: string) => void;
}

const getFileIconAndColor = (filename: string) => {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return { icon: FileCode2, color: 'text-yellow-500' };
    if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return { icon: FileCode2, color: 'text-blue-500' };
    if (filename.endsWith('.css')) return { icon: FileType2, color: 'text-sky-500' };
    if (filename.endsWith('.json')) return { icon: FileJson, color: 'text-green-500' };
    if (filename.match(/\.(png|jpe?g|gif|svg)$/)) return { icon: FileImage, color: 'text-purple-500' };
    return { icon: FileType2, color: 'text-slate-400' };
};

const getLanguageFromFilename = (filename: string) => {
    if (filename.match(/\.(js|jsx)$/)) return 'javascript';
    if (filename.match(/\.(ts|tsx)$/)) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.html')) return 'html';
    return 'plaintext';
};

const FileTreeNode: React.FC<{
    node: FileNode;
    level: number;
    onFileSelect: (path: string, language: string) => void;
    onCreateFile: (path: string) => void;
    onDeleteFile: (path: string) => void;
    onCreateFolder?: (path: string) => void;
    onRenameFile?: (oldPath: string, newPath: string) => void;
    onManagePermissions?: (path: string) => void;
}> = ({ node, level, onFileSelect, onCreateFile, onDeleteFile, onCreateFolder, onRenameFile, onManagePermissions }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newName, setNewName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(node.name);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleCreateSubmit = (e: React.FormEvent, type: 'file' | 'dir') => {
        e.preventDefault();
        if (newName.trim()) {
            const fullPath = node.path === '' ? newName.trim() : `${node.path}/${newName.trim()}`;
            if (type === 'file') onCreateFile(fullPath);
            if (type === 'dir' && onCreateFolder) onCreateFolder(fullPath);
            setNewName('');
            setIsCreatingFile(false);
            setIsCreatingFolder(false);
            setIsExpanded(true); // Mở folder để thấy file mới
        }
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (renameValue.trim() && renameValue.trim() !== node.name && onRenameFile) {
            const parentPath = node.path.substring(0, node.path.lastIndexOf('/'));
            const newPath = parentPath ? `${parentPath}/${renameValue.trim()}` : renameValue.trim();
            onRenameFile(node.path, newPath);
        }
        setIsRenaming(false);
    };

    if (node.type === 'dir') {
        // Render Directory
        return (
            <div className="w-full">
                <div 
                    className="flex items-center justify-between group cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/50 py-1 rounded-md transition-colors"
                    style={{ paddingLeft: `${level * 12 + 8}px`, paddingRight: '8px' }}
                    onClick={toggleExpand}
                >
                    <div className="flex items-center gap-1.5 overflow-hidden w-full">
                        <Folder size={14} className="text-blue-400 fill-blue-400/20 shrink-0" />
                        {isRenaming ? (
                            <form onSubmit={handleRenameSubmit} className="w-full mr-2">
                                <input type="text" autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={handleRenameSubmit} onClick={e => e.stopPropagation()} className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1 text-sm text-slate-800 dark:text-slate-200 outline-none" />
                            </form>
                        ) : (
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate select-none">{node.name || 'ROOT'}</span>
                        )}
                    </div>
                    {node.name !== '' && ( // Khác root thì mới cho xóa
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); setIsCreatingFile(true); }} className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" title="New File"><Plus size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setIsCreatingFolder(true); }} className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" title="New Folder"><FolderPlus size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setRenameValue(node.name); }} className="p-0.5 text-slate-400 hover:text-blue-500" title="Rename folder"><Edit2 size={13} /></button>
                            {onManagePermissions && <button onClick={(e) => { e.stopPropagation(); onManagePermissions(node.path); }} className="p-0.5 text-slate-400 hover:text-purple-500" title="Permissions"><Shield size={13} /></button>}
                            <button onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }} className="p-0.5 text-slate-400 hover:text-red-500" title="Delete folder"><Trash2 size={13} /></button>
                        </div>
                    )}
                </div>
                
                {/* Khu vực tạo file/folder mới nằm NGAY DƯỚI folder hiện tại */}
                {(isExpanded || node.name === '') && (
                    <div className="w-full">
                        {isCreatingFile && (
                            <form onSubmit={(e) => handleCreateSubmit(e, 'file')} className="flex items-center gap-2 my-1" style={{ paddingLeft: `${(level + 1) * 12 + 8}px`, paddingRight: '8px' }}>
                                <FileType2 size={14} className="text-slate-400 shrink-0" />
                                <input type="text" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => setIsCreatingFile(false)} placeholder="filename.js" className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                            </form>
                        )}
                        {isCreatingFolder && (
                            <form onSubmit={(e) => handleCreateSubmit(e, 'dir')} className="flex items-center gap-2 my-1" style={{ paddingLeft: `${(level + 1) * 12 + 8}px`, paddingRight: '8px' }}>
                                <Folder size={14} className="text-blue-400 shrink-0" />
                                <input type="text" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => setIsCreatingFolder(false)} placeholder="folder_name" className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                            </form>
                        )}
                        {node.children?.map((child, idx) => (
                            <FileTreeNode 
                                key={idx} 
                                node={child} 
                                level={level + 1} 
                                onFileSelect={onFileSelect} 
                                onCreateFile={onCreateFile} 
                                onDeleteFile={onDeleteFile} 
                                onCreateFolder={onCreateFolder} 
                                onRenameFile={onRenameFile}
                                onManagePermissions={onManagePermissions}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Render File
    const { icon: Icon, color } = getFileIconAndColor(node.name);
    const lang = getLanguageFromFilename(node.name);
    return (
        <div 
            onClick={() => onFileSelect(node.path, lang)}
            className="flex items-center justify-between group cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-800/50 py-1 rounded-md transition-colors w-full"
            style={{ paddingLeft: `${level * 12 + 8}px`, paddingRight: '8px' }}
        >
            <div className="flex items-center gap-1.5 overflow-hidden w-full">
                <Icon size={14} className={`${color} shrink-0`} />
                {isRenaming ? (
                    <form onSubmit={handleRenameSubmit} className="w-full mr-2">
                        <input type="text" autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onBlur={handleRenameSubmit} onClick={e => e.stopPropagation()} className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1 text-sm text-slate-800 dark:text-slate-200 outline-none" />
                    </form>
                ) : (
                    <span className="text-sm text-slate-600 dark:text-slate-300 truncate select-none">{node.name}</span>
                )}
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setRenameValue(node.name); }} className="p-0.5 text-slate-400 hover:text-blue-500" title="Rename file"><Edit2 size={13} /></button>
                {onManagePermissions && <button onClick={(e) => { e.stopPropagation(); onManagePermissions(node.path); }} className="p-0.5 text-slate-400 hover:text-purple-500" title="Permissions"><Shield size={13} /></button>}
                <button onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }} className="p-0.5 text-slate-400 hover:text-red-500" title="Delete file"><Trash2 size={13} /></button>
            </div>
        </div>
    );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, onCreateFile, onDeleteFile, onCreateFolder, onRenameFile, onRefresh, onManagePermissions }) => {
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newName, setNewName] = useState('');

    const rootNode: FileNode = {
        name: '',
        path: '',
        type: 'dir',
        children: files
    };

    const handleRootCreateSubmit = (e: React.FormEvent, type: 'file' | 'dir') => {
        e.preventDefault();
        if (newName.trim()) {
            if (type === 'file') onCreateFile(newName.trim());
            if (type === 'dir' && onCreateFolder) onCreateFolder(newName.trim());
            setNewName('');
            setIsCreatingFile(false);
            setIsCreatingFolder(false);
        }
    };

    return (
        <div className="w-64 bg-slate-50 dark:bg-[#111520] border-r border-slate-200 dark:border-white/5 flex flex-col h-full select-none">
            <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-white/5 shrink-0">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">Explorer</h3>
                <div className="flex items-center gap-1">
                    <button onClick={() => { setIsCreatingFile(true); setIsCreatingFolder(false); }} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="New File at Root">
                        <Plus size={14} />
                    </button>
                    <button onClick={() => { setIsCreatingFolder(true); setIsCreatingFile(false); }} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="New Folder at Root">
                        <FolderPlus size={14} />
                    </button>
                    {onRefresh && (
                        <button onClick={onRefresh} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" title="Refresh Explorer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {isCreatingFile && (
                    <form onSubmit={(e) => handleRootCreateSubmit(e, 'file')} className="flex items-center gap-2 mb-1 px-2">
                        <FileType2 size={14} className="text-slate-400 shrink-0" />
                        <input type="text" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => setIsCreatingFile(false)} placeholder="filename.js" className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                    </form>
                )}
                {isCreatingFolder && (
                    <form onSubmit={(e) => handleRootCreateSubmit(e, 'dir')} className="flex items-center gap-2 mb-1 px-2">
                        <Folder size={14} className="text-blue-400 shrink-0" />
                        <input type="text" autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={() => setIsCreatingFolder(false)} placeholder="folder_name" className="w-full bg-slate-200 dark:bg-[#1e1e1e] border border-blue-500 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none" />
                    </form>
                )}
                
                {/* Bỏ root node ảo, map thẳng files */}
                {files.map((file, idx) => (
                    <FileTreeNode 
                        key={idx} 
                        node={file} 
                        level={0} 
                        onFileSelect={onFileSelect} 
                        onCreateFile={onCreateFile} 
                        onDeleteFile={onDeleteFile} 
                        onCreateFolder={onCreateFolder} 
                        onRenameFile={onRenameFile}
                        onManagePermissions={onManagePermissions}
                    />
                ))}
                
                {files.length === 0 && !isCreatingFile && !isCreatingFolder && (
                    <div className="px-4 py-8 text-center text-slate-400 text-sm">
                        Thư mục trống. Hãy tạo file mới!
                    </div>
                )}
            </div>
        </div>
    );
};
