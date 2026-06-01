import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { targetAudiences } from '../constants/landingData';

export const TargetAudienceSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const duration = 6000;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % targetAudiences.length);
        }, duration);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="w-full max-w-[85rem] mx-auto px-6 py-24 relative z-10 border-t border-slate-200/10"
        >
            <motion.div variants={itemVariants} className="text-center mb-16 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                    Được thiết kế cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">mọi vai trò.</span>
                </h2>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Dù bạn là ai, DevSpace luôn có giải pháp tối ưu nhất cho quy trình của bạn.</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto min-h-[500px]">
                <motion.div variants={itemVariants} className="lg:w-[38%] flex flex-col gap-3">
                    {targetAudiences.map((aud, idx) => {
                        const isActive = activeIndex === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all duration-300 text-left outline-none overflow-hidden ${isActive
                                    ? 'bg-white dark:bg-[#1E293B] border-purple-200 dark:border-purple-500/50 shadow-xl dark:shadow-2xl shadow-purple-500/10 dark:shadow-black'
                                    : 'bg-slate-50 dark:bg-transparent border-transparent hover:bg-white dark:hover:bg-[#1E293B]/50'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                    {aud.icon}
                                </div>
                                <span className={`text-lg font-bold transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {aud.role}
                                </span>
                                {isActive && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: duration / 1000, ease: "linear" }}
                                        className="absolute bottom-0 left-0 h-1 bg-purple-500 opacity-60"
                                    />
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                <motion.div variants={itemVariants} className="lg:w-[62%] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, x: 20, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -20, scale: 0.98 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                            className="h-full w-full p-8 md:p-12 rounded-[2.5rem] border flex flex-col justify-center relative overflow-hidden bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none -mt-20 -mr-20 bg-purple-100/60 dark:bg-purple-500/10"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
                                    Giải pháp cho dự án của bạn
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black mb-8 leading-[1.2] text-slate-900 dark:text-white">
                                    {targetAudiences[activeIndex].headline}
                                </h3>
                                <div className="grid grid-cols-1 gap-6 mb-10">
                                    <div className="p-6 rounded-2xl border bg-rose-50 dark:bg-rose-500/5 border-rose-100 dark:border-rose-500/10">
                                        <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold uppercase text-[11px] tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Nỗi đau
                                        </div>
                                        <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium dark:font-normal">{targetAudiences[activeIndex].pain}</p>
                                    </div>
                                    <div className="p-6 rounded-2xl border bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/10">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold uppercase text-[11px] tracking-widest">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Giải pháp
                                        </div>
                                        <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 font-medium dark:font-normal">{targetAudiences[activeIndex].solution}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200/10">
                                    {targetAudiences[activeIndex].tags.map((tag, tIdx) => (
                                        <span key={tIdx} className="px-4 py-2 rounded-full border text-xs font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.section>
    );
};