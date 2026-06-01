import React, { useState } from 'react';
import { X, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { Building2, User } from 'lucide-react';

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string, orgId: string | null, enableCloud?: boolean) => void;
    isLoading: boolean;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
    const { currentOrganization } = useOrganizationStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [enableCloud, setEnableCloud] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        
        const orgId = currentOrganization ? currentOrganization._id : null;

        onSubmit(title, description, orgId, enableCloud);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal Panel */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#111520] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800/60">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                            <LayoutDashboard size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tạo dự án mới</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Khởi tạo một bảng Kanban trống</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <Input
                            label="Tên dự án"
                            placeholder="Ví dụ: DevSpaceZ Kanban v2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Mô tả (Tuỳ chọn)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn gọn về dự án này..."
                            className="w-full text-sm px-4 py-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[80px] resize-none"
                        />
                    </div>

                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Không gian tạo dự án</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {currentOrganization ? currentOrganization.name : 'Dự án cá nhân'}
                            </p>
                        </div>
                        <div className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${currentOrganization ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'}`}>
                            {currentOrganization ? <Building2 size={14} /> : <User size={14} />}
                            {currentOrganization ? 'Tổ chức' : 'Cá nhân'}
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setEnableCloud(!enableCloud)}>
                        <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-0.5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">☁️</span> 
                                Môi trường Cloud IDE
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[250px]">Khởi tạo sẵn không gian lưu trữ source code và Web Container cho dự án này.</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors relative ${enableCloud ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${enableCloud ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Huỷ bỏ
                        </Button>
                        <Button 
                            type="submit" 
                            isLoading={isLoading}
                            disabled={!title.trim() || isLoading}
                        >
                            Tạo dự án
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
