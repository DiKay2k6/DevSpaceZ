import React from 'react';
import { motion, Variants } from 'framer-motion';

export const SupportHero: React.FC = () => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <>
            <motion.div variants={headerVariant} initial="hidden" animate="visible" className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                    Chúng tôi ở đây để <span className="text-blue-500">hỗ trợ bạn.</span>
                </h1>
                <p className="text-lg max-w-2xl mx-auto transition-colors duration-300 text-slate-500 dark:text-slate-400">
                    Dù bạn gặp sự cố về kết nối Docker, trục trặc thanh toán MoMo hay cần hướng dẫn quy trình Kanban, đội ngũ kỹ sư của DevSpacez luôn sẵn sàng lắng nghe.
                </p>
            </motion.div>

            <motion.div variants={headerVariant} initial="hidden" animate="visible" className="max-w-4xl mx-auto mb-16">
                <div className="p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-none transition-colors duration-300 bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm transition-colors duration-300 text-emerald-800 dark:text-emerald-400">Tất cả hệ thống đang hoạt động bình thường</h4>
                            <p className="text-xs mt-1 transition-colors duration-300 text-emerald-600 dark:text-emerald-500/70">Cập nhật lần cuối: Vài giây trước</p>
                        </div>
                    </div>
                    <button className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 bg-white dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-transparent hover:bg-emerald-50 dark:hover:bg-emerald-500/30">
                        Xem chi tiết Server
                    </button>
                </div>
            </motion.div>
        </>
    );
};