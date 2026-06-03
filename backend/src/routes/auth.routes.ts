import express from 'express';
// Cập nhật: Thêm getAllUsers vào đây
import { register, login, logout, verifyOTP, resendOTP, getMe, getAllUsers, forgotPassword, verifyResetOTP, resetPassword, refreshTokenController } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/authorize.middleware'; // Import middleware phân quyền
import passport from '../utils/passport';
import { oauthCallback, oauthSuccess } from '../controllers/auth.controller';

// Import Middleware và các Schema
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, verifyOtpSchema, resendOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';

const router = express.Router();

// Lắp "máy quét" validate vào trước khi cho gọi controller
router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/login', validate(loginSchema), login);
router.post('/resend-otp', validate(resendOtpSchema), resendOTP);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', validate(verifyOtpSchema), verifyResetOTP); // Dùng lại verifyOtpSchema vì đều cần email + otp
router.post('/resend-reset-otp', validate(forgotPasswordSchema), forgotPassword); // Dùng lại forgotPassword logic vì nó chỉ sinh và gửi lại OTP
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Route đăng xuất
router.post('/logout', logout);

// --- OAUTH ROUTES ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=OAuthFailed`, session: false }), oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=OAuthFailed`, session: false }), oauthCallback);

router.post('/oauth-success', oauthSuccess);

// Route refresh token
router.post('/refresh-token', refreshTokenController);

// Route lấy thông tin cá nhân (Cần Token)
router.get('/me', protect, getMe);

/**
 * @route   GET /api/v1/auth/users
 * @desc    Lấy danh sách tất cả người dùng
 * @access  Private (Chỉ dành cho Admin)
 */
// Ổ khóa 2 lớp: protect (Phải đăng nhập) -> restrictTo (Phải là Admin)
router.get('/users', protect, restrictTo('Manager'), getAllUsers);

export default router;