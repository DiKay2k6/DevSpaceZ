import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError';

// 1. Tạo thư mục nếu chưa tồn tại
const uploadDir = 'public/uploads/avatars';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Lưu file vào thư mục này
    },
    filename: (req, file, cb) => {
        // Đặt tên file: userId_timestamp.ext
        const userId = (req as any).user._id.toString();
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${userId}_${Date.now()}${ext}`);
    }
});

// 3. Filter chỉ cho phép upload ảnh
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError('Chỉ hỗ trợ file định dạng ảnh (JPG, PNG, WEBP)', 400));
    }
};

// 4. Khởi tạo Middleware
export const uploadAvatar = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // Giới hạn 2MB
    }
});
