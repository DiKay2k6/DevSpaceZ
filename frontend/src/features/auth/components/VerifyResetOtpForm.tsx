import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/utils/error';

const otpSchema = z.object({
    otp: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface Props {
    email: string;
    onBack: () => void;
    onSuccess: (resetToken: string) => void;
}

export const VerifyResetOtpForm: React.FC<Props> = ({ email, onBack, onSuccess }) => {
    const [apiError, setApiError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema)
    });

    const onSubmit = async (data: OtpFormData) => {
        try {
            setApiError(null);
            const response = await authApi.verifyResetOTP({ email, otp: data.otp });
            // Thành công -> Báo cho AuthPage biết token để chuyển qua form ResetPassword
            onSuccess((response as any).data.resetToken);
        } catch (error: any) {
            setApiError(typeof error === 'string' ? error : (error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra'));
        }
    };

    const handleResend = async () => {
        try {
            setIsResending(true);
            setApiError(null);
            await authApi.resendResetOTP(email);
            alert('Đã gửi lại mã. Vui lòng kiểm tra email!');
        } catch (error: any) {
            setApiError(typeof error === 'string' ? error : (error?.response?.data?.message || error?.message || 'Đã có lỗi xảy ra'));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div>
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Xác thực yêu cầu</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chúng tôi vừa gửi mã OTP 6 số đến <br />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>
                </p>
            </div>

            {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/50 text-center">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <input
                        {...register('otp')}
                        type="text"
                        maxLength={6}
                        className={`w-full px-4 py-4 text-center tracking-[0.5em] text-2xl font-bold rounded-xl border bg-slate-50 dark:bg-[#111520] text-slate-900 dark:text-white focus:ring-2 outline-none transition-all ${errors.otp ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'}`}
                        placeholder="••••••"
                    />
                    {errors.otp && <p className="mt-2 text-sm text-center text-red-500">{errors.otp.message}</p>}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg flex justify-center"
                >
                    {isSubmitting ? <span className="animate-pulse">Đang xác thực...</span> : 'Xác thực OTP'}
                </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                    {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                </button>
                <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                    Quay lại
                </button>
            </div>
        </div>
    );
};
