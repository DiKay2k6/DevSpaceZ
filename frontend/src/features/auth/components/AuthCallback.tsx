import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/authStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AuthCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setAccessToken, checkAuth } = useAuthStore();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const error = searchParams.get('error');

        const authenticate = async () => {
            if (error) {
                toast.error('Đăng nhập bằng Mạng xã hội thất bại.');
                navigate('/auth', { replace: true });
                return;
            }

            if (sessionId) {
                try {
                    // Đổi sessionId lấy Access Token & Set Cookie qua Vercel Proxy
                    const res = await authApi.oauthSuccess(sessionId);
                    
                    if (res.data?.accessToken) {
                        setAccessToken(res.data.accessToken);
                    }

                    // Gọi checkAuth để cập nhật Store chuẩn nhất
                    await checkAuth();
                    toast.success('Đăng nhập mạng xã hội thành công!');
                    navigate('/dashboard', { replace: true });
                } catch (err: any) {
                    toast.error(err || 'Không thể xác thực thông tin người dùng.');
                    navigate('/auth', { replace: true });
                }
            } else {
                navigate('/auth', { replace: true });
            }
        };

        authenticate();
    }, [searchParams, navigate, setAccessToken, checkAuth]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Đang xác thực thông tin đăng nhập...</p>
            </div>
        </div>
    );
};
