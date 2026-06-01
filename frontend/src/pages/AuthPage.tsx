import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { AuthBanner } from '../features/auth/components/AuthBanner';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { VerifyOtpForm } from '../features/auth/components/VerifyOtpForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { VerifyResetOtpForm } from '../features/auth/components/VerifyResetOtpForm';
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm';
import myLogo from '@/assets/images/logo.png';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot_password' | 'verify_reset_otp' | 'reset_password';

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const initialMode = (searchParams.get('mode') as AuthMode) || 'login';

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [registeredEmail, setRegisteredEmail] = useState<string>('');
    const [resetToken, setResetToken] = useState<string>('');
    const { theme, toggleTheme } = useTheme();

    const formVariants: Variants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
    };

    return (
        <div className="min-h-screen flex transition-colors duration-300 bg-white dark:bg-[#0B0F19]">
            {/* Nút Toggle Theme */}
            <div className="absolute top-6 right-6 z-50">
                <button onClick={toggleTheme} className="p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border bg-white/80 dark:bg-[#ffffff0a] border-slate-200 dark:border-[#ffffff1a] text-slate-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white shadow-sm">
                    {theme === 'light' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    )}
                </button>
            </div>

            <AuthBanner />

            {/* RIGHT PANEL: FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                <div className="absolute top-6 left-6 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={myLogo} alt="DevSpace Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                            devspace<span className="text-blue-500">z</span>
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-md relative">
                    <AnimatePresence mode="wait">
                        {mode === 'login' && (
                            <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <LoginForm
                                    onSwitch={() => setMode('register')}
                                    // Bổ sung luồng nhảy qua form OTP khi đăng nhập thất bại do chưa kích hoạt
                                    onRequireVerification={(email) => {
                                        setRegisteredEmail(email);
                                        setMode('verify');
                                    }}
                                    onForgotPassword={() => setMode('forgot_password')}
                                />
                            </motion.div>
                        )}

                        {mode === 'register' && (
                            <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <RegisterForm
                                    onSwitch={() => setMode('login')}
                                    onSuccess={(email) => {
                                        setRegisteredEmail(email);
                                        setMode('verify');
                                    }}
                                />
                            </motion.div>
                        )}

                        {mode === 'verify' && (
                            <motion.div key="verify" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <VerifyOtpForm
                                    email={registeredEmail}
                                    onBack={() => setMode('login')}
                                />
                            </motion.div>
                        )}

                        {mode === 'forgot_password' && (
                            <motion.div key="forgot_password" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <ForgotPasswordForm
                                    onBack={() => setMode('login')}
                                    onSuccess={(email) => {
                                        setRegisteredEmail(email);
                                        setMode('verify_reset_otp');
                                    }}
                                />
                            </motion.div>
                        )}

                        {mode === 'verify_reset_otp' && (
                            <motion.div key="verify_reset_otp" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <VerifyResetOtpForm
                                    email={registeredEmail}
                                    onBack={() => setMode('forgot_password')}
                                    onSuccess={(token) => {
                                        setResetToken(token);
                                        setMode('reset_password');
                                    }}
                                />
                            </motion.div>
                        )}

                        {mode === 'reset_password' && (
                            <motion.div key="reset_password" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                                <ResetPasswordForm
                                    resetToken={resetToken}
                                    onBack={() => setMode('verify_reset_otp')}
                                    onSuccess={() => setMode('login')}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;