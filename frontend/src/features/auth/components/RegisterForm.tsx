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

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Đã có tài khoản?{' '}
                <button onClick={onSwitch} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Đăng nhập ngay
                </button>
            </p>
        </div>
    );
};