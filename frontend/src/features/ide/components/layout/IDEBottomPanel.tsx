import React from 'react';
import { Terminal as TerminalIcon, AlertTriangle, CheckCircle2, ChevronDown, FileCode2, XCircle } from 'lucide-react';
import { TerminalComponent } from '@/features/ide/components/TerminalComponent';
import { WebContainer } from '@webcontainer/api';
import { LocalFileNode } from '@/features/ide/utils/local-fs.utils';

interface IDEBottomPanelProps {
    bottomTab: 'terminal' | 'problems';
    setBottomTab: (tab: 'terminal' | 'problems') => void;
    ideMode: 'web' | 'script';
    markers: any[];
    theme: 'light' | 'dark';
    handleFileSelect: (path: string) => void;
    wc: WebContainer | null;
    localRootNode: LocalFileNode | null;
    scriptOutput: { text: string; isError: boolean } | null;
}

export const IDEBottomPanel: React.FC<IDEBottomPanelProps> = ({
    bottomTab,
    setBottomTab,
    ideMode,
    markers,
    theme,
    handleFileSelect,
    wc,
    localRootNode,
    scriptOutput
}) => {
    return (
        <div className="flex-[2] bg-white dark:bg-[#1e1e1e] min-h-0 relative flex flex-col">
            <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#252526] text-xs font-medium uppercase tracking-wider">
                <button 
                    onClick={() => setBottomTab('terminal')} 
                    className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${bottomTab === 'terminal' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e1e1e]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                    <TerminalIcon size={14} /> {ideMode === 'web' ? 'Terminal' : 'Output'}
                </button>
                <button 
                    onClick={() => setBottomTab('problems')} 
                    className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${bottomTab === 'problems' ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-[#1e1e1e]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/5'}`}
                >
                    <AlertTriangle size={14} /> Problems 
                    {markers.length > 0 && <span className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-1.5 py-0.5 rounded-full text-[10px]">{markers.length}</span>}
                </button>
            </div>
            
            <div className="flex-1 min-h-0">
                <div className={`w-full h-full ${bottomTab === 'problems' ? 'block' : 'hidden'} overflow-y-auto font-mono text-sm transition-colors ${theme === 'dark' ? 'bg-[#1e1e1e] text-slate-300' : 'bg-white text-slate-700'}`}>
                    {markers.length === 0 ? (
                        <div className="p-4 text-slate-400 italic flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" /> Không phát hiện lỗi nào trong dự án.
                        </div>
                    ) : (
                        <div className="p-4 flex flex-col gap-6 pb-10">
                            {(Object.entries(
                                markers.reduce((acc, marker) => {
                                    const path = marker.resource?.path?.substring(1) || 'Unknown';
                                    if (!acc[path]) acc[path] = [];
                                    acc[path].push(marker);
                                    return acc;
                                }, {} as Record<string, any[]>)
                            ) as [string, any[]][]).map(([path, fileMarkers], index) => (
                                <div key={index} className="flex flex-col">
                                    <div 
                                        onClick={() => handleFileSelect(path)}
                                        className="flex items-center gap-2 mb-1 px-2 py-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/5 rounded transition-colors group"
                                    >
                                        <ChevronDown size={14} className="text-slate-400" />
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <FileCode2 size={14} className="text-blue-500" />
                                            {path.split('/').pop()}
                                            <span className="text-[11px] text-slate-400 font-normal ml-1 truncate max-w-[200px]">
                                                {path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 px-1.5 py-0.5 rounded-full text-[10px] font-bold ml-1">
                                            {fileMarkers.length}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-[2px] pl-[26px]">
                                        {fileMarkers.map((m, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => handleFileSelect(path)}
                                                className="flex items-start gap-2 py-1.5 px-2 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded cursor-pointer group"
                                            >
                                                <XCircle size={14} className={`shrink-0 mt-0.5 ${m.severity === 8 ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`} />
                                                <div className="flex flex-col leading-tight">
                                                    <span className="text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                        {m.message}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5">
                                                        [{m.source || 'Lỗi'}] dòng {m.startLineNumber}, cột {m.startColumn}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={`w-full h-full ${bottomTab === 'terminal' && ideMode === 'web' ? 'block' : 'hidden'}`}>
                    <TerminalComponent 
                        webcontainerInstance={wc} 
                        theme={theme} 
                        welcomeMessage={
                            localRootNode?.children?.some((c: LocalFileNode) => c.name === 'frontend' || c.name === 'backend') 
                            ? 'Dự án Fullstack/Web: Vui lòng gõ lệnh "cd frontend" hoặc "cd backend" trước khi chạy npm install!' 
                            : undefined
                        }
                    />
                </div>

                <div className={`w-full h-full ${bottomTab === 'terminal' && ideMode === 'script' ? 'block' : 'hidden'}`}>
                    <div className={`w-full h-full p-4 overflow-y-auto font-mono text-sm transition-colors ${theme === 'dark' ? 'bg-[#1e1e1e] text-slate-300' : 'bg-white text-slate-700'}`}>
                        {scriptOutput ? (
                            <pre className={`whitespace-pre-wrap ${scriptOutput.isError ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {scriptOutput.text}
                            </pre>
                        ) : (
                            <div className="text-slate-400 dark:text-slate-500 italic">Nhấn Run Code để xem kết quả...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
