import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/authStore';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface Props {
    onSwitch: () => void;
    onRequireVerification: (email: string) => void; // Thêm prop để giao tiếp với AuthPage
    onForgotPassword: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSwitch, onRequireVerification, onForgotPassword }) => {
    const navigate = useNavigate();
    const { login, error } = useAuthStore();

    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
            navigate('/dashboard');
        } catch (err) {
            // Error đã được handle ở Zustand
        }
    };

    // Kiểm tra xem lỗi hiện tại có chứa từ khóa "chưa được kích hoạt" từ Backend trả về không
    const isUnverifiedError = error?.includes('chưa được kích hoạt');

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Đăng nhập</h2>
                <p className="text-slate-500 dark:text-slate-400">Chào mừng bạn quay lại DevSpacez</p>
            </div>

            {/* BỘ HIỂN THỊ LỖI THÔNG MINH */}
            {error && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>

                            {/* Nút hiển thị riêng cho trường hợp chưa kích hoạt OTP */}
                            {isUnverifiedError && (
                                <button
                                    onClick={() => onRequireVerification(getValues('email'))}
                                    className="mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 underline underline-offset-2 transition-colors"
                                >
                                    Chuyển đến trang xác thực OTP
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    placeholder="name@company.com"
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register('email')}
                />

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Mật khẩu</label>
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        autoComplete="current-password"
                        {...register('password')}
                    />
                </div>

                <Button type="submit" isLoading={isSubmitting} fullWidth>
                    Đăng nhập
                </Button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                Chưa có tài khoản?{' '}
                <button onClick={onSwitch} className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                    Tạo tài khoản mới
                </button>
            </p>
        </div>
    );
};