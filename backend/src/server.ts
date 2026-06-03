import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import http from 'http';
import { initSocket } from './utils/socket';
import { connectRedis } from './services/cache.service';
import { initYjsSocket } from './utils/yjsSocket';
import { initLspSocket } from './utils/lspSocket';
import './workers/email.worker'; // Khởi động email worker

import { startGitWorker } from './workers/git.worker';

// Nạp file .env trước khi thực thi bất kỳ logic nào
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    // Chờ kết nối DB và Redis thành công mới mở Port
    await connectDB();
    await connectRedis();

    const server = http.createServer(app);
    initSocket(server);
    initYjsSocket(server);
    initLspSocket(server);
    startGitWorker();

    server.listen(PORT, () => {
        console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
    });
};

startServer();