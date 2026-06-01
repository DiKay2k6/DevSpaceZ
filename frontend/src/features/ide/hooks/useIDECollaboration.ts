import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuthStore } from '@/entities/user/model/authStore';
import { getWebSocketUrl } from '@/shared/utils/websocket';

interface IDECollaborationOptions {
    roomId: string | null;
    isHost: boolean;
}

export const useIDECollaboration = ({ roomId, isHost }: IDECollaborationOptions) => {
    const { user } = useAuthStore();
    const yDocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const [connected, setConnected] = useState(false);
    const [collaborators, setCollaborators] = useState<any[]>([]);

    useEffect(() => {
        if (!roomId) return;

        // Khởi tạo Yjs Document
        const ydoc = new Y.Doc();
        yDocRef.current = ydoc;

        // Cấu hình URL WebSocket Backend (Thay đổi khi deploy)
        const wsUrl = getWebSocketUrl('/yjs');

        // Khởi tạo WebsocketProvider
        const provider = new WebsocketProvider(wsUrl, `devspacez-ide-${roomId}`, ydoc);
        providerRef.current = provider;

        provider.on('status', ({ status }: { status: string }) => {
            setConnected(status === 'connected');
        });

        // Thiết lập Awareness (thông tin User & Cursor)
        const awareness = provider.awareness;

        // Sinh màu ngẫu nhiên cho user
        const colors = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea', '#ed64a6'];
        const userColor = colors[Math.floor(Math.random() * colors.length)];

        awareness.setLocalStateField('user', {
            name: user?.full_name || 'Guest User',
            color: userColor,
            avatar: user?.avatar_url || null,
            isHost
        });

        // Lắng nghe sự thay đổi của danh sách user đang online
        awareness.on('change', () => {
            const states = Array.from(awareness.getStates().entries());
            const activeUsers = states
                .filter(([clientId, state]) => clientId !== awareness.clientID && state.user) // Lọc bỏ chính mình và các user rác
                .map(([clientId, state]) => ({
                    clientId,
                    ...state.user
                }));
            setCollaborators(activeUsers);
        });

        return () => {
            provider.disconnect();
            provider.destroy();
            ydoc.destroy();
        };
    }, [roomId, user, isHost]);

    return {
        ydoc: yDocRef.current,
        provider: providerRef.current,
        awareness: providerRef.current?.awareness || null,
        connected,
        collaborators
    };
};
