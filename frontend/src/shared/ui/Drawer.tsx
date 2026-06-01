import React, { useEffect, useRef } from 'react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children: React.ReactNode;
    position?: 'right' | 'left';
    width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
    isOpen,
    onClose,
    title,
    children,
    position = 'right',
    width = 'md',
    showCloseButton = true,
    className = '',
    overlayClassName = ''
}) => {
    const drawerRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(drawerRef, onClose);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthClass = {
        'sm': 'w-full sm:w-[400px]',
        'md': 'w-full sm:w-[500px] md:w-[600px]',
        'lg': 'w-full sm:w-[600px] md:w-[800px]',
        'xl': 'w-full sm:w-[800px] md:w-[1000px]',
        'full': 'w-full',
    }[width];

    const positionClass = position === 'right' ? 'justify-end' : 'justify-start';
    const animationClass = position === 'right' 
        ? 'animate-in slide-in-from-right duration-300' 
        : 'animate-in slide-in-from-left duration-300';

    const drawerContent = (
        <div className={`fixed inset-0 z-50 flex ${positionClass}`}>
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300 ${overlayClassName}`} />
            
            {/* Side Panel */}
            <div 
                ref={drawerRef}
                className={`relative ${widthClass} h-full bg-white dark:bg-[#0B0F19]/95 backdrop-blur-3xl shadow-2xl flex flex-col border-${position === 'right' ? 'l' : 'r'} border-slate-200 dark:border-white/10 ${animationClass} ${className}`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#111520] shrink-0">
                        {typeof title === 'string' ? (
                            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
                        ) : (
                            <div className="flex-1">{title}</div>
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
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(drawerContent, document.body);
};
