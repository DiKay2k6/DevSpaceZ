import React, { useRef, useState } from 'react';
import { Upload, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { userApi } from '@/features/user/api/user.api';
import { handleApiError } from '@/shared/utils/error';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'] as const;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const AvatarUpload: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const [preview,     setPreview]     = useState<string | null>(null);
    const [file,        setFile]        = useState<File | null>(null);
    const [uploading,   setUploading]   = useState(false);
    const [error,       setError]       = useState<string | null>(null);
    const [successMsg,  setSuccessMsg]  = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0];
        if (!chosen) return;
        if (!ALLOWED_TYPES.includes(chosen.type as typeof ALLOWED_TYPES[number])) {
            setError('Chỉ hỗ trợ JPG, PNG hoặc WEBP.'); return;
        }
        if (chosen.size > MAX_SIZE_BYTES) {
            setError('Kích thước ảnh vượt quá 2MB.'); return;
        }
        setError(null);
        setSuccessMsg(null);
        setFile(chosen);
        setPreview(URL.createObjectURL(chosen));
    };

    const handleUpload = async () => {
        if (!file) return;
        try {
            setUploading(true);
            setError(null);
            const res = await userApi.uploadAvatar(file);
            updateUser(res.data.user);
            setSuccessMsg('Cập nhật ảnh đại diện thành công!');
            setFile(null);
            setPreview(null);
        } catch (error) {
            setError(handleApiError(error));
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar preview */}
            <div
                className="relative group cursor-pointer flex-shrink-0"
                onClick={() => !file && inputRef.current?.click()}
            >
                <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                    ) : user?.avatar_url ? (
                        <>
                            <img 
                                src={user.avatar_url} 
                                alt="Avatar" 
                                className="w-full h-full object-cover absolute inset-0 z-10" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            <div className="w-full h-full hidden items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-3xl absolute inset-0 z-0">
                                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-bold text-3xl absolute inset-0">
                            {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                {!file && (
                    <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <Camera size={18} className="text-white" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-3">
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleChange} />

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        {error}
                    </p>
                )}
                {successMsg && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
                        <CheckCircle2 size={14} /> {successMsg}
                    </p>
                )}

                {!file ? (
                    <>
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
                        >
                            <Upload size={15} /> Tải ảnh mới lên
                        </button>
                        <p className="text-xs text-slate-400 dark:text-slate-500">JPG, PNG, WEBP · Tối đa 2MB</p>
                    </>
                ) : (
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-all shadow-md shadow-blue-500/20"
                        >
                            {uploading
                                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</>
                                : 'Lưu ảnh'
                            }
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            <Trash2 size={14} /> Hủy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
