import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport from './utils/passport';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import boardRoutes from './routes/board.routes';
import listRoutes from './routes/list.routes';
import taskRoutes from './routes/task.routes';
import workspaceRoutes from './routes/workspace.routes';
import commentRoutes from './routes/comment.routes';
import analyticsRoutes from './routes/analytics.routes';
import documentRoutes from './routes/document.routes';
import dockerRoutes from './routes/docker.routes';
import uploadRoutes from './routes/upload.routes';
import dashboardRoutes from './routes/dashboard.routes';
import notificationRoutes from './routes/notification.routes';
import organizationRoutes from './routes/organization.routes';
import subteamRoutes from './routes/subteam.routes';
import contactRoutes from './routes/contact.routes';
import roleRoutes from './routes/role.routes';
import ideRoutes from './routes/ide.routes';
import ideContainerRoutes from './routes/ideContainer.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';
import { globalErrorHandler } from './middlewares/errorHandler.middleware';
import { logger } from './utils/logger';

const app = express();

// ============================================================================
// 1. GLOBAL MIDDLEWARES (LỚP GIÁP BẢO VỆ)
// ============================================================================

// a0. Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`[${req.method}] ${req.url}`);
    next();
});

// a. Helmet: Cấu hình các HTTP Headers bảo mật để chống lại các lỗ hổng web phổ biến
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// c. Rate Limiting: Chống Spam API & Brute-force attacks
const limiter = rateLimit({
    max: 2000, // Tăng lên 2000 requests (SPAs gọi API rất nhiều)
    windowMs: 15 * 60 * 1000, // Trong vòng 15 phút (trên 1 IP)
    message: 'Quá nhiều request từ IP của bạn, vui lòng thử lại sau 15 phút!'
});
app.use('/api', limiter); // Áp dụng cho tất cả các route bắt đầu bằng /api

// d. Body Parser & Cookie Parser
app.use(express.json({ limit: '5mb' })); // Giới hạn payload 5mb cho phép gửi nội dung HTML lớn
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// e. Phục vụ các file tĩnh (Static Files) như hình ảnh avatar
app.use('/uploads', express.static('public/uploads'));


// ============================================================================
// 2. ROUTES (ĐIỀU HƯỚNG)
// ============================================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/boards', boardRoutes);
app.use('/api/v1/lists', listRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/docker', dockerRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/subteams', subteamRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/ide', ideRoutes);
app.use('/api/v1/lsp', ideContainerRoutes);
app.use('/api/v1/chat', chatRoutes);

// Route kiểm tra sức khỏe hệ thống (Health Check)
app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'success', message: 'Hệ thống hoạt động bình thường!' });
});


// ============================================================================
// 3. GLOBAL ERROR HANDLER (LƯỚI BẮT LỖI CUỐI CÙNG)
// ============================================================================
app.use(globalErrorHandler);

export default app;