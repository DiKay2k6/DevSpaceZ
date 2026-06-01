import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Comment } from '@/features/board/api/board.api';
import { SearchedUser } from '@/features/workspace/api/workspace.api';
import { useAuthStore } from '@/entities/user/model/authStore';
import { Trash2 } from 'lucide-react';

interface TaskCommentsProps {
    comments: Comment[];
    workspaceMembers: SearchedUser[];
    isLoading: boolean;
    isCreatingComment?: boolean;
    onCreateComment: (content: string) => void;
    onDeleteComment?: (commentId: string) => void;
    isDeletingComment?: boolean;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({
    comments, workspaceMembers, isLoading, isCreatingComment = false, onCreateComment, onDeleteComment, isDeletingComment = false
}) => {
    const { user: currentUser } = useAuthStore();
    const [commentContent, setCommentContent] = useState('');
    const [showMentionMenu, setShowMentionMenu] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [mentionIndex, setMentionIndex] = useState(-1);

    const handleSubmit = () => {
        if (commentContent.trim()) {
            onCreateComment(commentContent);
            setCommentContent('');
        }
    };

    return (
        <div className="border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#151A26] p-6 shrink-0 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                Thảo luận
            </h3>

            {/* Danh sách Comment */}
            <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {isLoading ? (
                    <div className="text-center text-xs text-slate-500 py-2">Đang tải...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-4 italic">Chưa có bình luận nào.</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment._id} className="flex gap-3 group">
                            <img 
                                src={comment.userId?.avatar_url ? comment.userId.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.full_name || 'User')}&background=6366f1&color=fff`} 
                                alt={comment.userId?.full_name || 'User'} 
                                className="w-9 h-9 rounded-2xl object-cover shrink-0 ring-2 ring-white dark:ring-[#151A26] shadow-sm"
                            />
                            <div className="flex-1 bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none p-3 shadow-sm">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                                        {comment.userId?.full_name || 'Anonymous'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi }) : ''}
                                    </span>
                                    {currentUser?._id === comment.userId?._id && onDeleteComment && (
                                        <button 
                                            onClick={() => {
                                                if (window.confirm('Bạn có chắc muốn thu hồi bình luận này?')) {
                                                    onDeleteComment(comment._id);
                                                }
                                            }}
                                            disabled={isDeletingComment}
                                            className="ml-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Thu hồi bình luận"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Box with Mention Support */}
            <div className="relative mt-2">
                <textarea
                    value={commentContent}
                    onChange={(e) => {
                        const val = e.target.value;
                        setCommentContent(val);
                        
                        // Mention Logic
                        const cursorPosition = e.target.selectionStart;
                        const textBeforeCursor = val.slice(0, cursorPosition);
                        const match = textBeforeCursor.match(/@(\w*)$/);
                        
                        if (match) {
                            setShowMentionMenu(true);
                            setMentionFilter(match[1]);
                            setMentionIndex(textBeforeCursor.lastIndexOf('@'));
                        } else {
                            setShowMentionMenu(false);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (showMentionMenu && e.key === 'Escape') {
                            setShowMentionMenu(false);
                        } else if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (!showMentionMenu) handleSubmit();
                        }
                    }}
                    placeholder="Nhập bình luận... (Nhấn @ để nhắc tên, Enter để gửi)"
                    className="w-full bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-20 text-[14px] font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-blue-500 dark:focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-none h-[44px] min-h-[44px]"
                />
                
                {/* Mention Popup */}
                {showMentionMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                        <div className="max-h-[200px] overflow-y-auto p-1.5 custom-scrollbar">
                            {workspaceMembers.filter(m => m.full_name?.toLowerCase().includes(mentionFilter.toLowerCase())).map(member => (
                                <div 
                                    key={member._id}
                                    onClick={() => {
                                        const newContent = commentContent.substring(0, mentionIndex) + '@' + member.full_name + ' ' + commentContent.substring(mentionIndex + mentionFilter.length + 1);
                                        setCommentContent(newContent);
                                        setShowMentionMenu(false);
                                    }}
                                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    <img 
                                        src={member.avatar_url ? member.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'User')}&background=6366f1&color=fff`} 
                                        alt="Avatar" 
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{member.full_name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button 
                    onClick={handleSubmit}
                    disabled={!commentContent.trim() || isCreatingComment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isCreatingComment ? 'Đang gửi...' : 'Gửi'}
                </button>
            </div>
        </div>
    );
};
