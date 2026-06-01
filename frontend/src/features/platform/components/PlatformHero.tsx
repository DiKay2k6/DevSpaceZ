import React from 'react';
import { motion, Variants } from 'framer-motion';

export const PlatformHero: React.FC = () => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }
        }
    };

    return (
        <motion.div
            variants={headerVariant}
            initial="hidden"
            animate="visible"
            className="text-center mb-24"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6 border transition-colors duration-300 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                ENTERPRISE-LEVEL ARCHITECTURE
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                Được xây dựng trên nền tảng <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-[#60A5FA] dark:to-[#A78BFA]">
                    Micro-services linh hoạt.
                </span>
            </h1>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed transition-colors duration-300 text-slate-500 dark:text-slate-400">
                DevSpace áp dụng mô hình kiến trúc Client-Server đa tầng kết hợp với Container hóa toàn diện, đảm bảo khả năng mở rộng và hiệu suất tối đa.
            </p>
        </motion.div>
    );
};