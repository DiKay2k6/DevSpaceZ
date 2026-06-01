import React, { useState } from 'react';
import { X, Palette, CheckCircle2, Trash2, Lock } from 'lucide-react';
import { Board, boardApi } from '@/features/board/api/board.api';
import { Button } from '@/shared/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BOARD_KEYS } from '@/features/board/hooks/useBoards';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    board: Board;
    onUpdateBackground: (bg: string) => void;
    isUpdating: boolean;
    canEditBoard: boolean;
    canDeleteBoard: boolean;
}

const SOLID_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9'
];

const GRADIENTS = [
    'linear-gradient(135deg, #00C6ff, #0072ff)',
    'linear-gradient(135deg, #fceabb, #f8b500)',
    'linear-gradient(135deg, #11998e, #38ef7d)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
    'linear-gradient(135deg, #84fab0, #8fd3f4)',
];

const IMAGE_BGS = [
    'url(https://images.unsplash.com/photo-1506744626753-dba37c1a8511?w=800&q=80)',
    'url(https://images.unsplash.com/photo-1473091540282-9b846e7965e3?w=800&q=80)',
    'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80)',
    'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80)',
];

export const BoardSettingsDrawer: React.FC<Props> = ({ isOpen, onClose, board, onUpdateBackground, isUpdating, canEditBoard, canDeleteBoard }) => {
    if (!isOpen) return null;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: mutateDeleteBoard, isPending: isDeleting } = useMutation({
        mutationFn: () => boardApi.deleteBoard(board._id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: BOARD_KEYS.all });
            onClose();
            navigate('/dashboard');
        }
    });

    const handleDelete = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ Dự án này? Toàn bộ Thẻ và Cột sẽ bị xóa vĩnh viễn và không thể khôi phục!')) {
            mutateDeleteBoard();
        }
    };

    const currentBg = board.background || '#3b82f6';

    const BackgroundOption = ({ bg }: { bg: string }) => {
        const isSelected = currentBg === bg;
        
        return (
            <button
                onClick={() => canEditBoard && onUpdateBackground(bg)}
                className={`relative group rounded-xl overflow-hidden aspect-video border-2 transition-all shadow-sm
                    ${isSelected ? 'border-blue-500 scale-95 shadow-md' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}
                    ${!canEditBoard ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                `}
                style={{ background: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <CheckCircle2 className="text-white drop-shadow-md" size={24} />
                    </div>
                )}
                {!canEditBoard && !isSelected && (
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock size={16} className="text-white" />
                    </div>
                )}
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative w-full max-w-sm h-full bg-white dark:bg-[#141b2d] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette size={20} className="text-blue-500" />
                        Tuỳ chỉnh Bảng
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-bg-800 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Ảnh nền */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Hình ảnh</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {IMAGE_BGS.map((bg, i) => (
                                <BackgroundOption key={i} bg={bg} />
                            ))}
                        </div>
                    </div>

                    {/* Gradient */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Màu Gradient</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {GRADIENTS.map((bg, i) => (
                                <BackgroundOption key={i} bg={bg} />
                            ))}
                        </div>
                    </div>

                    {/* Màu đơn sắc */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Màu đơn sắc</h3>
                        <div className="grid grid-cols-4 gap-3">
                            {SOLID_COLORS.map((bg, i) => (
                                <BackgroundOption key={i} bg={bg} />
                            ))}
                        </div>
                    </div>

                </div>

                {/* Nút Xóa Dự Án */}
                {canDeleteBoard && (
                    <div className="p-6 border-t border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 mt-auto">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 dark:text-red-400 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /> : <Trash2 size={16} />}
                            {isDeleting ? 'Đang xóa...' : 'Xóa Dự án này'}
                        </button>
                    </div>
                )}

                {/* Footer loading state */}
                {isUpdating && !isDeleting && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        Đang lưu...
                    </div>
                )}
            </div>
        </div>
    );
};
