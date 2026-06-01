import React from 'react';
import { motion, Variants } from 'framer-motion';

export const MonitorHeader: React.FC = () => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
    };

    return (
        <motion.div variants={headerVariant} initial="hidden" animate="visible" className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 border transition-colors duration-300 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    SYSTEM ONLINE
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">
                    Infrastructure <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-[#34D399] dark:to-[#3B82F6]">Monitor</span>
                </h1>
                <p className="text-base transition-colors duration-300 text-slate-500 dark:text-slate-400">
                    Giám sát cụm Container Docker và phân tích log Nginx theo thời gian thực.
                </p>
            </div>

            {/* Server Info Tag */}
            <div className="flex items-center gap-4 px-5 py-3 rounded-2xl border backdrop-blur-md transition-colors duration-300 bg-white dark:bg-[#1E293B]/60 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400 dark:text-slate-500">Host Node</p>
                    <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">devspace.vlu.edu.vn</p>
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-500/30"></div>
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400 dark:text-slate-500">IP Address</p>
                    <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-500">192.168.1.100</p>
                </div>
            </div>
        </motion.div>
    );
};