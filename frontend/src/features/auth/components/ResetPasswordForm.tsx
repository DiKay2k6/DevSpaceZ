import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/utils/error';
import { Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z.object({
    newPassword: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"]
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface Props {
    resetToken: string;
    onBack: () => void;
    onSuccess: () => void;
}

export const ResetPasswordForm: React.FC<Props> = ({ resetToken, onBack, onSuccess }) => {
    const [apiError, setApiError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = async (data: ResetPasswordData) => {
        try {
            setApiError(null);
            await authApi.resetPassword({
                resetToken,
                newPassword: data.newPassword
            });
            alert('Đặt lại mật khẩu thành công!');
            onSuccess();
        } catch (error) {
            setApiError(handleApiError(error));
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                    Đặt lại mật khẩu
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Vui lòng nhập mật khẩu mới của bạn.
                </p>
            </div>

            {apiError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('newPassword')}
                            type={showPassword ? "text" : "password"}
                            className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-[#111520] border rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 ${errors.newPassword ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'}`}
                            placeholder="Mật khẩu mới"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('confirmPassword')}
                            type={showConfirmPassword ? "text" : "password"}
                            className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-[#111520] border rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 ${errors.confirmPassword ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'}`}
                            placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang xử lý...
                        </>
                    ) : (
                        'Đổi mật khẩu'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại
                </button>
            </div>
        </div>
    );
};
