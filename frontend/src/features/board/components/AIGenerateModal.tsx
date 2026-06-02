import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { aiApi } from '@/features/ai/api/ai.api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
}

export const AIGenerateModal: React.FC<Props> = ({ isOpen, onClose, boardId }) => {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const queryClient = useQueryClient();

    if (!isOpen) return null;

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            toast.error('Vui lòng nhập mô tả dự án');
            return;
        }

        try {
            setIsGenerating(true);
            const res = await aiApi.generateBoardTasks(boardId, prompt);
            toast.success(res.message || 'Tạo Tasks thành công!');
            
            // Re-fetch board data
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
            onClose();
            setPrompt('');
        } catch (error: any) {
            const errorMessage = typeof error === 'string' ? error : (error.response?.data?.message || 'Có lỗi xảy ra khi gọi AI');
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111520] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">AI Copilot</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tự động tạo Cột và Thẻ công việc</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                            disabled={isGenerating}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleGenerate}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Mô tả dự án hoặc tính năng bạn muốn xây dựng
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isGenerating}
                                placeholder="Ví dụ: Tạo cho tôi một hệ thống giỏ hàng gồm backend Nodejs và frontend React..."
                                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none text-sm text-slate-800 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                disabled={isGenerating}
                            >
                                Hủy bỏ
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={!prompt.trim() || isGenerating}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        AI Đang suy nghĩ...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} className="mr-2" />
                                        Phân tích & Khởi tạo
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
