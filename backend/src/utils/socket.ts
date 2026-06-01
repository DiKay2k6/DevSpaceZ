import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

// Map lưu trữ connection của user: key = userId, value = socketId
const userSockets = new Map<string, string>();

export const initSocket = (server: Server) => {
    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        },
        destroyUpgrade: false
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        // Lắng nghe khi user đăng nhập thành công và gửi userId lên
        socket.on('register_user', (userId: string) => {
            socket.join(userId);
            console.log(`[Socket] User ${userId} registered with socket ${socket.id}`);
        });

        socket.on('join_board', (boardId: string) => {
            socket.join(boardId);
            console.log(`[Socket] Socket ${socket.id} joined board ${boardId}`);
        });

        socket.on('leave_board', (boardId: string) => {
            socket.leave(boardId);
            console.log(`[Socket] Socket ${socket.id} left board ${boardId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io has not been initialized!');
    }
    return io;
};

export const sendNotificationToUser = (userId: string, eventName: string, data: any) => {
    if (io) {
        io.to(userId.toString()).emit(eventName, data);
    }
};
