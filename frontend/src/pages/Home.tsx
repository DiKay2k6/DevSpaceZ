import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Xóa AuthContext cũ, Import Zustand Auth Store mới
import { useAuthStore } from '@/entities/user/model/authStore';
import { StardustWaves } from '../features/landing/components/StardustWaves';
import { FeaturesSection } from '../features/landing/components/FeaturesSection';
import { WorkflowSection } from '../features/landing/components/WorkflowSection';
import { TargetAudienceSection } from '../features/landing/components/TargetAudienceSection';

const Home: React.FC = () => {
    const [isHoveringFeatures, setIsHoveringFeatures] = useState<boolean>(false);

    // Lấy trạng thái từ Zustand thay vì Context
    const { isAuthenticated } = useAuthStore();

    return (
        <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">

            {/* Background Light Glow */}
            <div className="absolute top-[-20%] left-[10%] w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent rounded-full blur-3xl pointer-events-none z-0 dark:hidden" />

            <div
                className="w-full absolute top-0 left-0 pointer-events-none z-0"
                style={{
                    height: '120vh',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)'
                }}
            >
                <StardustWaves isHoveringFeatures={isHoveringFeatures} />
            </div>

            <div className="w-full h-[80px] relative z-20"></div>

            <main className="w-full flex-1 min-h-[85vh] flex flex-col justify-start pt-16 md:pt-24 items-center text-center px-4 z-10 relative pointer-events-none">
                <h1 className="text-[44px] md:text-[56px] font-bold tracking-tight leading-[1.15] mb-6">
                    <span className="text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-[#60A5FA] dark:to-[#A78BFA]">
                        The Unified Workspace.
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-[#A78BFA] dark:via-[#E879F9] dark:to-[#2DD4BF]">
                        Powerful Infrastructure Monitoring.
                    </span>
                </h1>

                <p className="text-[16px] max-w-2xl leading-[1.6] mb-10 transition-colors duration-300 font-medium text-slate-500 dark:text-[#9CA3AF] dark:font-normal">
                    DevSpace hợp nhất quy trình Agile, quản lý tài liệu và giám sát Docker & Nginx
                    <br className="hidden md:block" /> thời gian thực thành một màn hình liền mạch. Quản lý container, xem logs và
                    <br className="hidden md:block" /> nâng cấp tài nguyên một cách dễ dàng trong hệ sinh thái của chúng tôi.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pointer-events-auto">
                    {/* Đổi isLoggedIn thành isAuthenticated */}
                    {isAuthenticated ? (
                        /* Giao diện ĐÃ ĐĂNG NHẬP: 1 Nút duy nhất đưa vào thẳng khu vực làm việc */
                        <Link to="/dashboard">
                            <button className="px-10 py-3.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-[#2563EB] dark:to-[#9333EA] dark:shadow-[0_0_25px_rgba(147,51,234,0.35)] dark:hover:shadow-[0_0_45px_rgba(147,51,234,0.6)]">
                                QUAY LẠI WORKSPACE
                            </button>
                        </Link>
                    ) : (
                        /* Giao diện CHƯA ĐĂNG NHẬP: 2 Nút (Get Started và Explore Demo) */
                        <>
                            <Link to="/auth">
                                <button className="px-8 py-3.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 bg-slate-900 text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_25px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-[#2563EB] dark:to-[#9333EA] dark:shadow-[0_0_25px_rgba(147,51,234,0.35)] dark:hover:shadow-[0_0_45px_rgba(147,51,234,0.6)]">
                                    GET STARTED
                                </button>
                            </Link>

                            <Link to="/demo">
                                <button className="px-8 py-3.5 rounded-full font-bold text-[13px] tracking-wide transition-all duration-300 bg-white text-slate-700 border border-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:text-slate-900 hover:shadow-[0_8px_15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-[#A855F7] dark:to-[#06B6D4] dark:text-white dark:border-none dark:shadow-[0_0_25px_rgba(6,182,212,0.35)] dark:hover:shadow-[0_0_45px_rgba(6,182,212,0.6)]">
                                    EXPLORE DASHBOARD
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </main>

            <FeaturesSection
                onMouseEnter={() => setIsHoveringFeatures(true)}
                onMouseLeave={() => setIsHoveringFeatures(false)}
            />

            <WorkflowSection />

            <TargetAudienceSection />

        </div>
    );
};

export default Home;