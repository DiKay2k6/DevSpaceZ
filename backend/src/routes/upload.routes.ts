import express from 'express';
import multer from 'multer';
import { protect } from '../middlewares/auth.middleware';
import { AppError } from '../utils/appError';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Đảm bảo thư mục tồn tại
const uploadDir = 'public/uploads/tasks';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer để lưu file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file độc nhất để tránh trùng lặp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Bộ lọc file (Chỉ cho phép ảnh và PDF)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new AppError(400, 'Chỉ chấp nhận file định dạng Hình ảnh hoặc PDF!'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: fileFilter
});

// API Endpoint để Upload
router.post('/', protect, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Vui lòng chọn một file để tải lên' });
    }

    const fileUrl = `/uploads/tasks/${req.file.filename}`;

    res.status(200).json({
        status: 'success',
        message: 'Tải file thành công',
        data: {
            filename: req.file.originalname,
            url: fileUrl,
            mimetype: req.file.mimetype
        }
    });
});

// ==========================================
// CẤU HÌNH UPLOAD CHO CHAT (ẢNH & VIDEO)
// ==========================================
const chatUploadDir = 'public/uploads/chat';
if (!fs.existsSync(chatUploadDir)) {
    fs.mkdirSync(chatUploadDir, { recursive: true });
}

const chatStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, chatUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const chatFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new AppError(400, 'Chỉ chấp nhận file định dạng Hình ảnh hoặc Video!'));
    }
};

const chatUpload = multer({ 
    storage: chatStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // Giới hạn 15MB cho video/ảnh
    fileFilter: chatFileFilter
});

router.post('/chat', protect, chatUpload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'Vui lòng chọn một file để tải lên' });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    // Xác định xem file là image hay video
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    res.status(200).json({
        status: 'success',
        message: 'Tải file thành công',
        data: {
            filename: req.file.originalname,
            url: fileUrl,
            mimetype: req.file.mimetype,
            mediaType: mediaType
        }
    });
});

export default router;
