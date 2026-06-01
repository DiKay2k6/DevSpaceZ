import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/utils/error';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

interface Props {
    onBack: () => void;
    onSuccess: (email: string) => void;
}

export const ForgotPasswordForm: React.FC<Props> = ({ onBack, onSuccess }) => {
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        try {
            setApiError(null);
            await authApi.forgotPassword(data.email);
            // Thành công chuyển sang form reset password
            onSuccess(data.email);
        } catch (error) {
            setApiError(handleApiError(error));
        }
    };

    return (
        <div className="w-full">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                    Quên mật khẩu?
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Đừng lo, hãy nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
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
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            {...register('email')}
                            type="email"
                            className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-[#111520] border rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 ${errors.email ? 'border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'}`}
                            placeholder="name@company.com"
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi mã OTP'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                </button>
            </div>
        </div>
    );
};
