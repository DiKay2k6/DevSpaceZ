import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/authStore';
import { userApi } from '@/features/user/api/user.api';

// ─── Schema ───────────────────────────────────────────────────────────────────
const schema = z
    .object({
        old_password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        new_password: z.string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
            .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
        confirm_password: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
    })
    .refine(d => d.new_password === d.confirm_password, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirm_password'],
    })
    .refine(d => d.old_password !== d.new_password, {
        message: 'Mật khẩu mới không được trùng mật khẩu cũ',
        path: ['new_password'],
    });

type FormData = z.infer<typeof schema>;

// ─── Password field ───────────────────────────────────────────────────────────
const PasswordField: React.FC<{
    label: string;
    id: string;
    autoComplete?: string;
    error?: string;
    registration: ReturnType<typeof useForm<FormData>>['register'] extends (name: any, ...args: any[]) => infer R ? R : never;
}> = ({ label, id, autoComplete, error, registration }) => {
    const [show, setShow] = useState(false);

    const base = 'w-full pl-10 pr-12 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500';
    const cls = error
        ? `${base} border-red-400 focus:ring-2 focus:ring-red-400/20`
        : `${base} border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`;

    return (
        <div>
            {label && <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>}
            <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input {...registration} id={id} autoComplete={autoComplete} type={show ? 'text' : 'password'} className={cls} placeholder="••••••••" />
                <button type="button" onClick={() => setShow(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ChangePasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const handleForgotPassword = async () => {
        await logout();
        navigate('/auth?mode=forgot_password');
    };

    const onSubmit = async (data: FormData) => {
        try {
            setSaving(true);
            setFeedback(null);
            await userApi.changePassword({ old_password: data.old_password, new_password: data.new_password });
            setFeedback({ ok: true, msg: 'Đổi mật khẩu thành công!' });
            reset();
        } catch (err: any) {
            setFeedback({ ok: false, msg: err?.response?.data?.message ?? err?.message ?? 'Đã có lỗi xảy ra' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {feedback && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${feedback.ok
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40'
                    }`}>
                    {feedback.ok && <CheckCircle2 size={15} />}
                    {feedback.msg}
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu hiện tại</label>
                    <button type="button" onClick={handleForgotPassword} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">
                        Quên mật khẩu?
                    </button>
                </div>
                <PasswordField label="" id="old_password" autoComplete="current-password" registration={register('old_password')} error={errors.old_password?.message} />
            </div>

            <PasswordField label="Mật khẩu mới" id="new_password" autoComplete="new-password" registration={register('new_password')} error={errors.new_password?.message} />
            <PasswordField label="Xác nhận mật khẩu" id="confirm" autoComplete="new-password" registration={register('confirm_password')} error={errors.confirm_password?.message} />

            <div className="pt-2">
                <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2">
                    {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang lưu...</> : 'Cập nhật mật khẩu'}
                </button>
            </div>
        </form>
    );
};
