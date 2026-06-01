import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip, ExternalLink } from 'lucide-react';

interface Attachment {
    _id: string;
    url: string;
    mimetype: string;
    filename: string;
    createdAt: string;
}

interface TaskAttachmentsProps {
    taskId: string;
    attachments: Attachment[];
    isUploading: boolean;
    onUploadFile: (file: File) => void;
    canUpload?: boolean;
}

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
    taskId, attachments = [], isUploading, onUploadFile, canUpload = false
}) => {
    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUploadFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        maxSize: 5 * 1024 * 1024, // 5MB
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'application/pdf': ['.pdf']
        }
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-300 flex items-center gap-2 tracking-wide uppercase">
                    <Paperclip size={16} className="text-slate-400" /> Tài liệu đính kèm
                </h3>
            </div>
            
            {canUpload && (
                <div 
                    {...getRootProps()} 
                    className={`w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                        isDragActive 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-[#111520]'
                    }`}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-blue-500">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-semibold">Đang tải lên...</p>
                        </div>
                    ) : (
                        <>
                            <Paperclip size={24} className="mx-auto text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {isDragActive ? 'Thả file vào đây...' : 'Kéo & thả file hoặc click để chọn file (Tối đa 5MB)'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Hỗ trợ: PDF, JPG, PNG</p>
                        </>
                    )}
                </div>
            )}

            {/* List Attachments */}
            {attachments.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map(att => (
                        <div key={att._id} className="flex items-start gap-3 p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl group relative overflow-hidden">
                            {att.mimetype.startsWith('image/') ? (
                                <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden shrink-0">
                                    <img src={att.url} alt={att.filename} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-xs">PDF</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate pr-6">{att.filename}</p>
                                <p className="text-[10px] font-medium text-slate-500">{new Date(att.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <a 
                                href={att.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
