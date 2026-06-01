import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi, IDocument } from '@/features/document/api/document.api';
import { useBoards } from '@/features/board/hooks/useBoards';
import { FileText, Plus, Save, Trash2, Loader2, ArrowLeft, Share2, Download, PenLine, FileOutput } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { DocumentSidebar } from '@/features/document/components/DocumentSidebar';
import { CollaborativeEditor } from '@/features/document/components/CollaborativeEditor';
import { DocumentShareModal } from '@/features/document/components/DocumentShareModal';

export const Docs: React.FC = () => {
    const { currentOrganization } = useOrganizationStore();
    const { data: boards, isLoading: isLoadingBoards } = useBoards(currentOrganization?._id);
    const queryClient = useQueryClient();

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isFetchingDoc, setIsFetchingDoc] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    useEffect(() => {
        if (boards && boards.length > 0 && !selectedWorkspaceId) {
            const firstWorkspaceId = typeof boards[0].workspaceId === 'object' ? (boards[0].workspaceId as any)._id : boards[0].workspaceId;
            setSelectedWorkspaceId(firstWorkspaceId);
        }
    }, [boards, selectedWorkspaceId]);

    const { data: docs, isLoading: isLoadingDocs } = useQuery({
        queryKey: ['documents', selectedWorkspaceId],
        queryFn: () => documentApi.getAll(selectedWorkspaceId!),
        enabled: !!selectedWorkspaceId
    });

    const activeDoc = docs?.find(d => d._id === selectedDocId);

    const { mutate: createDoc, isPending: isCreating } = useMutation({
        mutationFn: () => documentApi.create(title || 'Tài liệu mới', content, selectedWorkspaceId!),
        onSuccess: (newDoc) => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
            setSelectedDocId(newDoc._id);
        }
    });

    const { mutate: updateDoc, isPending: isUpdating } = useMutation({
        mutationFn: () => documentApi.update(selectedDocId!, title, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
        }
    });

    const { mutate: deleteDoc, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => documentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', selectedWorkspaceId] });
            setSelectedDocId(null);
            setTitle('');
            setContent('');
        }
    });

    const handleExportWord = async () => {
        if (!selectedDocId) return;
        setIsExporting(true);
        try {
            await documentApi.exportWord(selectedDocId, title || 'Tài_liệu');
            toast.success('Đã tải file Word');
        } catch (error) {
            toast.error('Lỗi khi tải file Word');
        } finally {
            setIsExporting(false);
            setIsExportMenuOpen(false);
        }
    };

    const handleExportPDF = () => {
        const element = document.querySelector('.ProseMirror') as HTMLElement;
        if (!element) {
            toast.error('Không tìm thấy nội dung tài liệu');
            return;
        }
        setIsExporting(true);
        const opt: any = {
            margin: 15,
            filename: `${title || 'Tài_liệu'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save().then(() => {
            setIsExporting(false);
            setIsExportMenuOpen(false);
            toast.success('Đã xuất file PDF');
        }).catch(() => {
            setIsExporting(false);
            toast.error('Lỗi xuất PDF');
        });
    };

    useEffect(() => {
        if (selectedDocId) {
            // Fetch full content ngay lập tức khi selectedDocId thay đổi, không cần chờ list docs cập nhật
            setIsFetchingDoc(true);
            documentApi.getById(selectedDocId).then(fullDoc => {
                setTitle(fullDoc.title);
                setContent(fullDoc.content);
                setIsFetchingDoc(false);
            }).catch(() => {
                setIsFetchingDoc(false);
            });
        }
    }, [selectedDocId]);

    if (isLoadingBoards || isLoadingDocs) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!selectedWorkspaceId && !isLoadingBoards) {
        return <div className="p-8 text-center text-slate-500">Bạn chưa có dự án/workspace nào! Vui lòng tạo dự án trước.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DocumentSidebar 
                docs={docs || []}
                boards={boards || []}
                selectedWorkspaceId={selectedWorkspaceId}
                setSelectedWorkspaceId={setSelectedWorkspaceId}
                selectedDocId={selectedDocId}
                setSelectedDocId={setSelectedDocId}
                isLoadingDocs={isLoadingDocs}
                isCreating={isCreating}
                createDoc={() => createDoc()}
            />

            {/* Document Editor */}
            {selectedDocId ? (
                <div className="flex-1 min-w-0 relative">
                    {isFetchingDoc ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <CollaborativeEditor 
                            key={selectedDocId} 
                            docId={selectedDocId} 
                            initialTitle={title}
                            initialContent={content}
                            onTitleChange={(newTitle) => setTitle(newTitle)}
                            viewMode={viewMode}
                            headerActions={
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-white/10">
                                    <div className="flex bg-slate-200/50 dark:bg-slate-900/50 rounded-lg p-0.5 mr-1">
                                        <button
                                            onClick={() => setViewMode('edit')}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            <PenLine size={14} /> Sửa
                                        </button>
                                        <button
                                            onClick={() => setViewMode('preview')}
                                            className={`flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            <FileOutput size={14} /> Bản In
                                        </button>
                                    </div>

                                    <Button 
                                        size="sm" 
                                        leftIcon={<Save size={14} />}
                                        onClick={() => updateDoc()}
                                        isLoading={isUpdating}
                                        className="h-8 shadow-sm px-3"
                                    >
                                        Lưu
                                    </Button>
                                    
                                    <div className="relative">
                                        <button 
                                            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors flex items-center"
                                            disabled={isExporting}
                                        >
                                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                        </button>
                                        
                                        {isExportMenuOpen && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setIsExportMenuOpen(false)}></div>
                                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-20 py-1 overflow-hidden">
                                                    <button 
                                                        onClick={handleExportWord}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                                    >
                                                        <FileText size={16} className="text-blue-500" />
                                                        Xuất file Word (.docx)
                                                    </button>
                                                    <button 
                                                        onClick={handleExportPDF}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                                                    >
                                                        <FileOutput size={16} className="text-red-500" />
                                                        Xuất file PDF (.pdf)
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button 
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(confirm('Bạn có chắc muốn xóa tài liệu này?')) deleteDoc(selectedDocId);
                                        }}
                                        disabled={isDeleting}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            }
                        />
                    )}
                </div>
            ) : (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm text-slate-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p>Chọn một tài liệu để xem hoặc tạo mới</p>
                </div>
            )}
            
            {activeDoc && (
                <DocumentShareModal 
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    document={activeDoc}
                    workspaceId={selectedWorkspaceId!}
                    organizationId={currentOrganization?._id}
                />
            )}
        </div>
    );
};

export default Docs;
