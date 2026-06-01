import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code2, Loader2, Moon, Sun, Play, Users, Share2, Copy, Check } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import toast from 'react-hot-toast';

interface IDEHeaderProps {
    projectLoaded: boolean;
    isBooting: boolean;
    ideMode: 'web' | 'script';
    setIdeMode: (mode: 'web' | 'script') => void;
    currentLanguage: string;
    setCurrentLanguage: (lang: string) => void;
    isExecuting: boolean;
    handleRunScript: () => void;
    roomId?: string | null;
    isHost?: boolean;
    collaborators?: any[];
    isCloud?: boolean;
    isSavingCloud?: boolean;
}

export const IDEHeader: React.FC<IDEHeaderProps> = ({
    projectLoaded,
    ideMode,
    setIdeMode,
    currentLanguage,
    setCurrentLanguage,
    isExecuting,
    handleRunScript,
    roomId,
    isHost,
    collaborators = [],
    isCloud = false,
    isSavingCloud = false
}) => {
    const { theme, toggleTheme } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (!roomId) return;
        const url = new URL(window.location.href);
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-12 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 bg-slate-50 dark:bg-[#252526] shrink-0">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center justify-center p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex items-center gap-2 font-bold text-sm tracking-wide">
                    <Code2 size={18} className="text-blue-500" />
                    DevSpaceZ WebIDE
                    {roomId && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase border border-blue-200 dark:border-blue-800/50">
                            Live
                        </span>
                    )}
                </div>
            </div>

            {projectLoaded && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-slate-200 dark:bg-[#1e1e1e] rounded-lg p-1">
                        <button 
                            onClick={() => {
                                setIdeMode('web');
                                setCurrentLanguage('javascript');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${ideMode === 'web' ? 'bg-white dark:bg-[#252526] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Node.js (Web)
                        </button>
                        <button 
                            onClick={() => {
                                setIdeMode('script');
                                setCurrentLanguage('python');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${ideMode === 'script' && currentLanguage === 'python' ? 'bg-white dark:bg-[#252526] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Python
                        </button>
                        <button 
                            onClick={() => {
                                setIdeMode('script');
                                setCurrentLanguage('java');
                            }}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${ideMode === 'script' && currentLanguage === 'java' ? 'bg-white dark:bg-[#252526] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            Java
                        </button>
                    </div>

                    {ideMode === 'script' && (
                        <button 
                            onClick={handleRunScript}
                            disabled={isExecuting}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                            Run Code
                        </button>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2">
                {/* Live Share Collaborators */}
                {collaborators.length > 0 && (
                    <div className="flex items-center -space-x-2 mr-2">
                        {collaborators.map((user, idx) => (
                            <div 
                                key={user.clientId || idx}
                                title={user.name}
                                className="w-7 h-7 rounded-full border-2 border-white dark:border-[#2d2d2d] flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-help"
                                style={{ backgroundColor: user.color || '#48bb78' }}
                            >
                                {user.name?.substring(0, 2).toUpperCase() || 'GU'}
                            </div>
                        ))}
                    </div>
                )}

                {/* Share Button (Only for Host) */}
                {isHost && projectLoaded && (
                    <button 
                        onClick={handleShare}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            copied 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50'
                        }`}
                    >
                        {copied ? <Check size={14} /> : <Share2 size={14} />}
                        {copied ? 'Copied' : 'Share'}
                    </button>
                )}

                {/* Cloud Save Status */}
                {isCloud && (
                    <div className="flex items-center px-2 py-1 text-xs">
                        {isSavingCloud ? (
                            <span className="text-yellow-600 dark:text-yellow-400 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving...</span>
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1"><Check size={12} /> Saved</span>
                        )}
                    </div>
                )}

                <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ml-1"
                >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
            </div>
        </div>
    );
};
