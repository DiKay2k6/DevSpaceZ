import React from 'react';
import { Link } from 'react-router-dom';
import myLogo from '@/assets/images/logo.png';

export const AuthBanner: React.FC = () => {
    return (
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-50 dark:bg-[#111520] border-r border-slate-200 dark:border-slate-800 flex-col justify-between p-12">
            {/* Background Glow trang trí */}
            <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none z-0 bg-blue-400/20 dark:bg-blue-600/10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none z-0 bg-purple-400/20 dark:bg-purple-600/10" />

            <div className="relative z-10">
                <Link to="/" className="flex items-center gap-3 w-fit mb-16">
                    <img src={myLogo} alt="DevSpace Logo" className="w-10 h-10 object-contain" />
                    <span className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white">
                        devspace<span className="text-blue-500">z</span>
                    </span>
                </Link>

                <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-slate-900 dark:text-white">
                    Hợp nhất <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Quy trình làm việc.
                    </span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                    Chỉ với một tài khoản, bạn có thể quản lý Agile Kanban, giám sát Docker và lưu trữ tài liệu chuẩn hóa trên cùng một nền tảng.
                </p>
            </div>

            <div className="relative z-10 mt-auto border-t border-slate-200 dark:border-slate-800 pt-8">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#111520] bg-blue-500 flex items-center justify-center text-white text-xs font-bold">K</div>
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#111520] bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">H</div>
                        <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#111520] bg-purple-500 flex items-center justify-center text-white text-xs font-bold">G</div>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tham gia cùng <strong className="text-slate-900 dark:text-white">2,000+</strong> kỹ sư phần mềm.</p>
                </div>
            </div>
        </div>
    );
};