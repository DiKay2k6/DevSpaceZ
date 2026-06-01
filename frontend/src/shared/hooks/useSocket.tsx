import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!user) return;

        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            // Gửi userId lên server để đăng ký
            newSocket.emit('register_user', user._id);
        });

        // Lắng nghe Notification Global
        newSocket.on('new_notification', (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            
            // Render custom toast cho Notification
            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white dark:bg-[#151A26] shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    Thông báo mới
                                </p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {data.content}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-slate-200 dark:border-white/10">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            ), {
                duration: 5000,
                position: 'bottom-right'
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return socket;
};
