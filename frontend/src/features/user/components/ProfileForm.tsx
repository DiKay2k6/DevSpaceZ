import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { userApi } from '@/features/user/api/user.api';
import { handleApiError } from '@/shared/utils/error';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
    full_name:      z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
    specialization: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// ─── Field component ─────────────────────────────────────────────────────────
const Field: React.FC<{
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}> = ({ label, hint, error, children }) => (
    <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
        </label>
        {children}
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const ProfileForm: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [saving,   setSaving]   = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            full_name:      user?.full_name ?? '',
            specialization: user?.specialization ?? '',
        },
    });

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            setFeedback(null);
            const res = await userApi.updateProfile(data);
            updateUser(res.data.user);
            setFeedback({ ok: true, msg: 'Cập nhật thành công!' });
        } catch (error) {
            setFeedback({ ok: false, msg: handleApiError(error) });
        } finally {
            setSaving(false);
        }
    };

    const inputBase = 'w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500';
    const inputNormal = `${inputBase} border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;
    const inputError  = `${inputBase} border-red-400 focus:ring-2 focus:ring-red-400/20`;
    const inputDisabled = `${inputBase} border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed`;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Feedback banner */}
            {feedback && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                    feedback.ok
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                }`}>
                    {feedback.ok && <CheckCircle2 size={15} />}
                    {feedback.msg}
                </div>
            )}

            <Field label="Họ và tên" error={errors.full_name?.message}>
                <input {...register('full_name')} placeholder="Nguyễn Văn A"
                    className={errors.full_name ? inputError : inputNormal} />
            </Field>

            <Field label="Chuyên môn" hint="Hiển thị trên header và hồ sơ của bạn.">
                <input {...register('specialization')} placeholder="VD: Fullstack Developer, Data Scientist..."
                    className={inputNormal} />
            </Field>

            <Field label="Email" hint="Email không thể thay đổi sau khi đăng ký.">
                <input value={user?.email ?? ''} disabled className={inputDisabled} />
            </Field>

            <div className="pt-2">
                <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
                    {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</> : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};
