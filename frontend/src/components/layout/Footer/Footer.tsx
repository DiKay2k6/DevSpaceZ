import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { productLinks, resourceLinks, teamLinks, socialLinks } from './constants/footerData';
import myLogo from '@/assets/images/logo.png';

export const Footer: React.FC = () => {
    const linkVariants: Variants = {
        rest: { scale: 1 },
        hover: { scale: 1.03, originX: 0 }
    };

    return (
        <footer className="relative pt-20 pb-10 border-t transition-colors duration-300 overflow-hidden bg-white dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-800/50">

            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] rounded-full blur-[120px] pointer-events-none z-0 bg-blue-50/50 dark:bg-blue-900/10" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-6">
                            <img src={myLogo} alt="DevSpace Logo" className="w-8 h-8 object-contain" />
                            <span className="text-2xl font-bold tracking-wide text-slate-900 dark:text-white">
                                devspace<span className="text-blue-500">z</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
                            Hệ sinh thái quản lý dự án Agile và giám sát hạ tầng toàn diện. Được phát triển bởi đội ngũ kỹ sư công nghệ tương lai từ Đại học Văn Lang (VLU).
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Sản phẩm</h3>
                        <ul className="space-y-4">
                            {productLinks.map((item, i) => (
                                <motion.li key={i} variants={linkVariants} initial="rest" whileHover="hover">
                                    <a href={item.href} className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                        {item.label}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Tài nguyên</h3>
                        <ul className="space-y-4">
                            {resourceLinks.map((item, i) => (
                                <motion.li key={i} variants={linkVariants} initial="rest" whileHover="hover">
                                    <a href={item.href} className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                        {item.label}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Đội ngũ</h3>
                        <ul className="space-y-4">
                            {teamLinks.map((item, i) => (
                                <motion.li key={i} variants={linkVariants} initial="rest" whileHover="hover">
                                    <a href={item.href} className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                                        {item.label}
                                    </a>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 border-slate-200 dark:border-slate-800/80">
                    <p className="text-xs text-slate-500">
                        &copy; 2026 DevSpacez. Được thiết kế cho Đồ án CNTT - Đại học Văn Lang.
                    </p>

                    <div className="flex gap-2">
                        {socialLinks.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                title={item.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl transition-all duration-300 text-slate-500 hover:bg-blue-50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white"
                            >
                                {item.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};