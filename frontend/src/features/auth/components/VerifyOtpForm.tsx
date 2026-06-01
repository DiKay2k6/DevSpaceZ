import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/entities/user/model/authStore';
import { handleApiError } from '@/shared/utils/error';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const otpSchema = z.object({
    otp: z.string().length(6, 'Mã OTP phải có đúng 6 chữ số'),
});

type OtpFormData = z.infer<typeof otpSchema>;

interface Props {
    email: string;
    onBack: () => void;
}

export const VerifyOtpForm: React.FC<Props> = ({ email, onBack }) => {
    const navigate = useNavigate();
    const { checkAuth } = useAuthStore();
    const [apiError, setApiError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema)
    });

    const onSubmit = async (data: OtpFormData) => {
        try {
            setApiError(null);
            // 1. Gửi OTP xác thực
            await authApi.verifyOTP({ email, otp: data.otp });
            // 2. Cookie đã được set, bắt Zustand tự lấy thông tin User
            await checkAuth();
            // 3. Đá vào Dashboard
            navigate('/dashboard');
        } catch (error: any) {
            setApiError(handleApiError(error));
        }
    };

    const handleResend = async () => {
        try {
            setIsResending(true);
            setApiError(null);
            await authApi.resendOTP(email);
            alert('Đã gửi lại mã. Vui lòng kiểm tra email!');
        } catch (error: any) {
            setApiError(handleApiError(error));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div>
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Kiểm tra Email</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Chúng tôi vừa gửi mã 6 số đến <br />
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
                    <Input
                        type="text"
                        maxLength={6}
                        className="text-center tracking-[0.5em] text-2xl font-bold py-4"
                        placeholder="••••••"
                        error={errors.otp?.message}
                        {...register('otp')}
                    />
                </div>

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    fullWidth
                    className="py-3.5"
                >
                    Kích hoạt tài khoản
                </Button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-3 text-sm">
                <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={isResending}
                    className="font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                    {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
                </Button>
                <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline">
                    Quay lại đăng nhập
                </Button>
            </div>
        </div>
    );
};