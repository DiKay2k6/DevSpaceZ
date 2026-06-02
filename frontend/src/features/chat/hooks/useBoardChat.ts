import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi, IMessage } from '../api/chat.api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';

export const useBoardChat = (boardId: string) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom helper
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // 1. Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const res = await chatApi.getMessages(boardId);
                setMessages(res.data.data.messages);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Lỗi khi lấy tin nhắn:', error);
            } finally {
                setLoading(false);
            }
        };

        if (boardId) {
            fetchMessages();
        }
    }, [boardId]);

    // 2. Initialize Socket Connection
    useEffect(() => {
        if (!boardId) return;

        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            newSocket.emit('join_board', boardId);
        });

        newSocket.on('receive_message', (newMessage: IMessage) => {
            setMessages((prev) => {
                // Tránh duplicate tin nhắn nếu đã có trong state
                const exists = prev.some(msg => msg._id === newMessage._id);
                if (exists) return prev;
                return [...prev, newMessage];
            });
            setTimeout(scrollToBottom, 100);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('leave_board', boardId);
            newSocket.disconnect();
        };
    }, [boardId]);

    return {
        messages,
        setMessages,
        loading,
        socket,
        messagesEndRef,
        scrollToBottom
    };
};
