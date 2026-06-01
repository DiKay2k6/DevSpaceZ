import React from 'react';
import { motion, Variants } from 'framer-motion';
import { systemStats } from '../constants/monitorData';

export const SystemStats: React.FC = () => {
    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
    };

    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {systemStats.map((stat, idx) => (
                <motion.div key={idx} variants={cardVariant} className="p-5 rounded-3xl border cursor-default transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-[#1E293B]/40 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{stat.icon}</span>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</h3>
                    </div>
                    <div className={`text-2xl font-bold font-mono transition-colors duration-300 ${stat.status === 'high' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-white'}`}>
                        {stat.value}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};