import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useBoards } from '@/features/board/hooks/useBoards';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { chatApi } from '@/features/chat/api/chat.api';
import { useChat } from '@/features/chat/hooks/useChat';
import { Search, Hash, MessageSquare, Send, Image as ImageIcon, FileVideo, Loader2, User as UserIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Conversation {
    _id: string;
    participants: {
        _id: string;
        full_name: string;
        avatar_url?: string;
    }[];
    lastMessageAt: string;
}

export const ChatPage: React.FC = () => {
    const { user } = useAuthStore();
    const { currentOrganization } = useOrganizationStore();
    const { data: boards } = useBoards(currentOrganization?._id);
    const navigate = useNavigate();
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeTab, setActiveTab] = useState<'boards' | 'direct'>('boards');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [activeChatId, setActiveChatId] = useState<string | undefined>();
    const [activeChatName, setActiveChatName] = useState<string>('');
    const [activeChatAvatar, setActiveChatAvatar] = useState<string | undefined>();
    
    // Khởi tạo Chat Hook
    const { messages, loading, messagesEndRef, scrollToBottom } = useChat(activeChatId, activeTab === 'direct');
    
    const [inputValue, setInputValue] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch conversations (Direct Messages)
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await chatApi.getConversations();
                setConversations(res.data.data.conversations);
            } catch (error) {
                console.error("Lỗi lấy danh sách chat cá nhân", error);
            }
        };
        fetchConversations();
    }, []);

    const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : 'U';

    const handleSendText = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeChatId || !inputValue.trim() || uploading) return;

        const content = inputValue.trim();
        setInputValue('');

        try {
            await chatApi.sendMessage(activeChatId, activeTab === 'direct', content);
            setTimeout(scrollToBottom, 100);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi gửi tin nhắn');
            setInputValue(content); 
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeChatId) return;

        e.target.value = '';

        if (file.size > 15 * 1024 * 1024) {
            toast.error('File quá lớn! Vui lòng chọn file dưới 15MB');
            return;
        }

        try {
            setUploading(true);
            const uploadRes = await chatApi.uploadMedia(file);
            const { url, mediaType } = uploadRes.data.data;
            
            await chatApi.sendMessage(activeChatId, activeTab === 'direct', '', url, mediaType);
            setTimeout(scrollToBottom, 100);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi khi upload file');
        } finally {
            setUploading(false);
        }
    };

    const renderSidebarList = () => {
        if (activeTab === 'boards') {
            const filteredBoards = boards?.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!filteredBoards?.length) {
                return <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy dự án nào</div>;
            }
            return filteredBoards.map(board => (
                <button
                    key={board._id}
                    onClick={() => {
                        setActiveChatId(board._id);
                        setActiveChatName(board.title);
                        setActiveChatAvatar(undefined);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        activeChatId === board._id 
                        ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                    } border text-left mb-1`}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        <Hash size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className={`font-semibold truncate ${activeChatId === board._id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-white'}`}>
                            {board.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Nhóm dự án</p>
                    </div>
                </button>
            ));
        }

        const filteredConversations = conversations.filter(c => {
            const otherUser = c.participants.find(p => p._id !== user?._id);
            return otherUser?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        if (!filteredConversations.length) {
            return <div className="p-4 text-center text-sm text-slate-500">Không có đoạn chat cá nhân nào</div>;
        }

        return filteredConversations.map(conv => {
            const otherUser = conv.participants.find(p => p._id !== user?._id);
            if (!otherUser) return null;

            return (
                <button
                    key={conv._id}
                    onClick={() => {
                        setActiveChatId(conv._id);
                        setActiveChatName(otherUser.full_name);
                        setActiveChatAvatar(otherUser.avatar_url);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        activeChatId === conv._id 
                        ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                    } border text-left mb-1`}
                >
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {otherUser.avatar_url ? (
                            <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <span className="font-bold text-slate-500 dark:text-slate-400">{getInitials(otherUser.full_name)}</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className={`font-semibold truncate ${activeChatId === conv._id ? 'text-purple-700 dark:text-purple-400' : 'text-slate-800 dark:text-white'}`}>
                            {otherUser.full_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {conv.lastMessageAt ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true, locale: vi }) : 'Bắt đầu trò chuyện'}
                        </p>
                    </div>
                </button>
            );
        });
    };

    return (
        <div className="h-screen w-screen bg-white dark:bg-[#0B0F19] flex overflow-hidden">
            {/* Cột trái: Sidebar Chat */}
            <div className="w-[320px] md:w-[380px] border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-transparent h-full">
                {/* Header Cột trái */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-500" />
                        Tin nhắn
                    </h2>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                        title="Quay lại Dashboard"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-xs font-medium hidden md:block">Quay lại</span>
                    </button>
                </div>

                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center px-4 mb-2">
                    <button
                        onClick={() => setActiveTab('boards')}
                        className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'boards' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        Dự án
                    </button>
                    <button
                        onClick={() => setActiveTab('direct')}
                        className={`flex-1 pb-2 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'direct' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                    >
                        Cá nhân
                    </button>
                </div>

                {/* Danh sách Chat */}
                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                    {renderSidebarList()}
                </div>
            </div>

            {/* Cột phải: Khung Chat */}
            <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0B0F19]">
                {!activeChatId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                            <MessageSquare size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Chưa chọn đoạn chat nào</h3>
                        <p className="text-sm">Vui lòng chọn một dự án hoặc bạn bè để bắt đầu trò chuyện</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/10 shrink-0 bg-white dark:bg-[#111520] z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-inner ${
                                    activeTab === 'boards' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                    {activeTab === 'boards' ? (
                                        <Hash size={20} />
                                    ) : activeChatAvatar ? (
                                        <img src={activeChatAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    ) : (
                                        <UserIcon size={20} className="text-slate-500 dark:text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{activeChatName}</h3>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        Đang kết nối
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-transparent custom-scrollbar">
                            {loading && messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Loader2 className="animate-spin mb-4" size={32} /> 
                                    <p>Đang tải tin nhắn...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <p className="text-lg font-medium">Bắt đầu cuộc trò chuyện!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId._id === user?._id;
                                    const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId._id !== msg.senderId._id);
                                    
                                    return (
                                        <div key={msg._id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'}`}>
                                            {/* Avatar */}
                                            <div className={`w-10 h-10 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                                {!isMe && (
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-sm">
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
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                {showAvatar && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 ml-1 font-medium">{msg.senderId.full_name}</span>
                                                )}
                                                
                                                {msg.content && (
                                                    <div className={`px-4 py-2.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${
                                                        isMe 
                                                            ? 'bg-blue-600 text-white rounded-br-sm' 
                                                            : 'bg-white dark:bg-[#1a2133] text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-transparent rounded-bl-sm'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                )}

                                                {msg.mediaUrl && msg.mediaType === 'image' && (
                                                    <div className={`mt-1.5 rounded-xl overflow-hidden border shadow-sm max-w-[300px] sm:max-w-[400px] ${isMe ? 'border-blue-500/30' : 'border-slate-200 dark:border-white/10'}`}>
                                                        <img src={msg.mediaUrl} alt="attachment" className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                                    </div>
                                                )}

                                                {msg.mediaUrl && msg.mediaType === 'video' && (
                                                    <div className={`mt-1.5 rounded-xl overflow-hidden border shadow-sm max-w-[300px] sm:max-w-[400px] bg-black ${isMe ? 'border-blue-500/30' : 'border-slate-200 dark:border-white/10'}`}>
                                                        <video src={msg.mediaUrl} controls className="w-full h-auto" />
                                                    </div>
                                                )}

                                                <span className="text-[11px] text-slate-400 mt-1.5">
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: vi })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            {uploading && (
                                <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                                    <div className="w-10 h-10 flex-shrink-0" />
                                    <div className="flex items-center gap-2 px-5 py-3 bg-slate-200 dark:bg-white/10 rounded-2xl rounded-br-sm animate-pulse">
                                        <Loader2 size={16} className="animate-spin text-slate-500 dark:text-slate-400" />
                                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang gửi media...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white dark:bg-[#111520] border-t border-slate-200 dark:border-white/10 z-10 shrink-0">
                            <form onSubmit={handleSendText} className="flex items-end gap-3 max-w-5xl mx-auto w-full relative">
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

                                <div className="flex items-center gap-1 mb-1">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all disabled:opacity-50"
                                        title="Gửi ảnh"
                                    >
                                        <ImageIcon size={22} />
                                    </button>

                                    <button 
                                        type="button" 
                                        onClick={() => document.getElementById('video-upload')?.click()}
                                        disabled={uploading}
                                        className="p-3 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all disabled:opacity-50"
                                        title="Gửi video (Max 15MB)"
                                    >
                                        <FileVideo size={22} />
                                    </button>
                                </div>

                                <div className="flex-1 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-end border border-transparent focus-within:border-blue-500/30 focus-within:bg-white dark:focus-within:bg-[#1a2133] focus-within:shadow-sm transition-all overflow-hidden min-h-[52px]">
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendText(e);
                                            }
                                        }}
                                        placeholder="Nhập tin nhắn... (Nhấn Enter để gửi)"
                                        disabled={uploading}
                                        className="flex-1 bg-transparent px-4 py-3.5 text-[15px] text-slate-800 dark:text-white placeholder-slate-400 outline-none disabled:opacity-50 resize-none max-h-32 min-h-[52px]"
                                        rows={1}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!inputValue.trim() || uploading}
                                        className="p-2.5 mb-1.5 mr-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center shrink-0"
                                    >
                                        <Send size={18} className="ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
