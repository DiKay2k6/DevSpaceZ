import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/features/auth/api/auth.api';
import { handleApiError } from '@/shared/utils/error';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
    onSwitch: () => void;
    onSuccess: (email: string) => void;
}

export const RegisterForm: React.FC<Props> = ({ onSwitch, onSuccess }) => {
    const [apiError, setApiError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setApiError(null);
            const { confirmPassword, ...submitData } = data;
            await authApi.register(submitData);
            onSuccess(data.email);
        } catch (error) {
            setApiError(handleApiError(error));
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Tạo tài khoản</h2>
                <p className="text-slate-500 dark:text-slate-400">Trải nghiệm quản lý dự án đỉnh cao</p>
            </div>

            {apiError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800/50">
                    {apiError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Họ và tên"
                    placeholder="Nguyễn Văn A"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="name@company.com"
                    error={errors.email?.message}
                    {...register('email')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Mật khẩu"
                        type="password"
                        placeholder="Ít nhất 8 ký tự"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <Input
                        label="Xác nhận mật khẩu"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />
                </div>

                <Button type="submit" isLoading={isSubmitting} fullWidth className="mt-2 text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 shadow-lg">
                    Tạo tài khoản
                </Button>
            </form>

            <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
                <span className="text-xs font-medium text-slate-500 uppercase">Hoặc đăng ký với</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <a 
                    href={`${import.meta.env.MODE === 'development' ? (import.meta.env.VITE_API_URL || '/api/v1') : '/api/v1'}/auth/google`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151A26] hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                    Google
                </a>
                <a 
                    href={`${import.meta.env.MODE === 'development' ? (import.meta.env.VITE_API_URL || '/api/v1') : '/api/v1'}/auth/github`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151A26] hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fill="currentColor"/></svg>
                    GitHub
                </a>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Đã có tài khoản?{' '}
                <button onClick={onSwitch} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Đăng nhập ngay
                </button>
            </p>
        </div>
    );
};