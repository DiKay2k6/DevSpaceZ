import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Image as ImageIcon, FileVideo, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useBoardChat } from '../hooks/useBoardChat';
import { chatApi } from '../api/chat.api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Props {
    boardId: string;
    boardStatus: string;
    isOpen: boolean;
    onClose: () => void;
}

export const BoardChatDrawer: React.FC<Props> = ({ boardId, boardStatus, isOpen, onClose }) => {
    const { user } = useAuthStore();
    const { messages, loading, socket, messagesEndRef, scrollToBottom } = useBoardChat(boardId);
    
    const [inputValue, setInputValue] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isCompleted = boardStatus === 'Completed';

    // Auto scroll when drawer opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 200);
        }
    }, [isOpen, scrollToBottom]);

    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCompleted || !inputValue.trim() || uploading) return;

        const content = inputValue.trim();
        setInputValue('');

        try {
            await chatApi.sendMessage(boardId, content);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi gửi tin nhắn');
            setInputValue(content); // restore input if failed
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || isCompleted) return;

        // Reset input
        e.target.value = '';

        if (file.size > 15 * 1024 * 1024) {
            toast.error('File quá lớn! Vui lòng chọn file dưới 15MB');
            return;
        }

        try {
            setUploading(true);
            const uploadRes = await chatApi.uploadMedia(file);
            const { url, mediaType } = uploadRes.data.data;
            
            // Sau khi upload thành công, gửi tin nhắn chứa media
            await chatApi.sendMessage(boardId, '', url, mediaType);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi upload file');
        } finally {
            setUploading(false);
        }
    };

    const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : 'U';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-[#111520] shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-white/10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Thảo luận Dự án</h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Trực tuyến (Real-time)
                    </p>
                </div>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-transparent custom-scrollbar relative">
                {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <Loader2 className="animate-spin mr-2" size={20} /> Đang tải...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                        <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Send size={24} />
                        </div>
                        <p className="text-sm font-medium">Chưa có tin nhắn nào</p>
                        <p className="text-xs">Hãy là người đầu tiên bắt đầu cuộc thảo luận!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId._id === user?._id;
                        const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId._id !== msg.senderId._id);
                        
                        return (
                            <div key={msg._id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                    {!isMe && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                                            {msg.senderId.avatar_url ? (
                                                <img src={msg.senderId.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display='none'; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display='flex'; }}/>
                                            ) : null}
                                            <div className={`w-full h-full items-center justify-center ${msg.senderId.avatar_url ? 'hidden' : 'flex'}`}>
                                                {getInitials(msg.senderId.full_name)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    {showAvatar && (
                                        <span className="text-[11px] text-slate-400 mb-1 ml-1">{msg.senderId.full_name}</span>
                                    )}
                                    
                                    {msg.content && (
                                        <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                                            isMe 
                                                ? 'bg-blue-600 text-white rounded-br-sm' 
                                                : 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-transparent rounded-bl-sm'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    )}

                                    {msg.mediaUrl && msg.mediaType === 'image' && (
                                        <div className="mt-1 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm max-w-full">
                                            <img src={msg.mediaUrl} alt="attachment" className="max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                        </div>
                                    )}

                                    {msg.mediaUrl && msg.mediaType === 'video' && (
                                        <div className="mt-1 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm max-w-full">
                                            <video src={msg.mediaUrl} controls className="max-w-full max-h-48 object-cover bg-black" />
                                        </div>
                                    )}

                                    <span className="text-[10px] text-slate-400 mt-1">
                                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
                {uploading && (
                    <div className="flex flex-row-reverse gap-2">
                        <div className="w-8 h-8 flex-shrink-0" />
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-white/10 rounded-2xl rounded-br-sm animate-pulse">
                            <Loader2 size={14} className="animate-spin text-slate-500 dark:text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Đang gửi media...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-px w-full" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-[#111520] border-t border-slate-200 dark:border-white/10">
                {isCompleted ? (
                    <div className="w-full py-3 px-4 bg-slate-100 dark:bg-white/5 rounded-xl text-center text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <X size={16} /> Dự án đã hoàn tất, nhóm chat bị khóa.
                    </div>
                ) : (
                    <form onSubmit={handleSendText} className="flex items-end gap-2 relative">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                        />
                        <input 
                            type="file" 
                            accept="video/*" 
                            className="hidden" 
                            id="video-upload" 
                            onChange={handleFileUpload} 
                        />

                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors disabled:opacity-50"
                            title="Gửi ảnh"
                        >
                            <ImageIcon size={20} />
                        </button>

                        <button 
                            type="button" 
                            onClick={() => document.getElementById('video-upload')?.click()}
                            disabled={uploading}
                            className="p-2.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-colors disabled:opacity-50"
                            title="Gửi video (Max 15MB)"
                        >
                            <FileVideo size={20} />
                        </button>

                        <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center pr-1 border border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-[#1a2133] transition-colors">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                disabled={uploading}
                                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none disabled:opacity-50"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || uploading}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none transition-all mr-0.5 my-0.5"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
