import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Building, Loader2 } from 'lucide-react';
import { organizationApi } from '@/features/organization/api/organization.api';
import { Button } from '@/shared/ui/Button';
import { handleApiError } from '@/shared/utils/error';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { Modal } from '@/shared/ui/Modal';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateOrganizationModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();
    const { setCurrentOrganization } = useOrganizationStore();

    const { mutate: createOrg, isPending } = useMutation({
        mutationFn: (data: { name: string; description: string }) => organizationApi.createOrganization(data),
        onSuccess: (newOrg) => {
            toast.success('Tạo Tổ chức thành công!');
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            setCurrentOrganization(newOrg);
            setName('');
            setDescription('');
            onClose();
        },
        onError: (err) => handleApiError(err)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Vui lòng nhập tên Tổ chức');
            return;
        }
        createOrg({ name, description });
    };

    const titleContent = (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Building size={20} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tạo Tổ chức mới</h2>
                <p className="text-sm text-slate-500 font-normal">Khởi tạo không gian làm việc cho công ty/nhóm của bạn</p>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={titleContent}
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Tên Tổ chức <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Công ty TNHH DevSpaceZ"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1A202C] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        autoFocus
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Mô tả (Không bắt buộc)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả ngắn gọn về tổ chức..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#1A202C] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1 py-2.5 rounded-xl">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" variant="primary" disabled={isPending} className="flex-1 py-2.5 rounded-xl">
                        {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Tạo Tổ chức'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
