import React, { useEffect, useRef } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    showCloseButton?: boolean;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'md',
    showCloseButton = true,
    className = ''
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Lắng nghe click bên ngoài để đóng modal
    useOnClickOutside(modalRef, onClose);

    // Lắng nghe phím Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Khóa cuộn trang khi mở modal
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full mx-4',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div
                ref={modalRef}
                className={`bg-white dark:bg-[#111520] w-full ${maxWidthClass} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ${className}`}
            >
                {/* Header (Optional) */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#111520] shrink-0">
                        {typeof title === 'string' ? (
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                        ) : (
                            <div>{title}</div>
                        )}
                        
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ml-auto"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};
