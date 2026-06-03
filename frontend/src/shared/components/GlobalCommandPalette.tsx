import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, CheckSquare, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/shared/api/axiosClient';
import { useUserProfileStore } from '@/entities/user/model/userProfileStore';

interface SearchResult {
    boards: any[];
    tasks: any[];
}

export const GlobalCommandPalette: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ boards: [], tasks: [] });
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { openProfile } = useUserProfileStore();
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setQuery('');
            setResults({ boards: [], tasks: [] });
        }
    }, [isOpen]);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ boards: [], tasks: [] });
            return;
        }

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            performSearch(query);
        }, 300); // debounce 300ms

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [query]);

    const performSearch = async (q: string) => {
        try {
            setLoading(true);
            const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
            setResults(res.data?.data || { boards: [], tasks: [] });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <div className="relative w-full max-w-[650px] bg-white dark:bg-[#151A26] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 border-b border-slate-100 dark:border-white/10">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tìm kiếm dự án, thẻ công việc... (Cmd + K)"
                        className="w-full bg-transparent border-none px-4 py-4 text-base font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
                    />
                    {loading && <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mr-3"></div>}
                    <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-500 rounded border border-slate-200 dark:border-white/5">ESC</kbd>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                    {query.trim().length < 2 ? (
                        <div className="p-8 text-center text-slate-500 font-medium text-sm">
                            Gõ ít nhất 2 ký tự để tìm kiếm toàn hệ thống.
                        </div>
                    ) : (!results?.boards?.length && !results?.tasks?.length) && !loading ? (
                        <div className="p-8 text-center text-slate-500 font-medium text-sm">
                            Không tìm thấy kết quả nào phù hợp.
                        </div>
                    ) : (
                        <div className="space-y-4 py-2">
                            {/* Boards Section */}
                            {(results?.boards?.length ?? 0) > 0 && (
                                <div>
                                    <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Dự án (Projects)</h3>
                                    {results?.boards?.map(board => (
                                        <div 
                                            key={board._id} 
                                            className="group px-3 py-2.5 mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-3"
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate(`/dashboard/b/${board._id}`);
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                                                <Hash size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{board.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Tasks Section */}
                            {(results?.tasks?.length ?? 0) > 0 && (
                                <div>
                                    <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 mt-4">Thẻ công việc (Tasks)</h3>
                                    {results?.tasks?.map(task => (
                                        <div 
                                            key={task._id} 
                                            className="group px-3 py-2.5 mx-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center gap-3"
                                            onClick={() => {
                                                setIsOpen(false);
                                                navigate(`/dashboard/b/${task.boardId}`);
                                                // Có thể thêm tính năng tự động mở TaskDetailModal qua URL param ?taskId=... trong tương lai
                                            }}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                                                <CheckSquare size={16} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">
                                                    <span className="text-slate-400 mr-2 font-mono text-[10px]">DEV-{task.order + 100}</span>
                                                    {task.title}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="truncate">Dự án: {task.boardName}</span>
                                                    <span>•</span>
                                                    <span>{task.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
