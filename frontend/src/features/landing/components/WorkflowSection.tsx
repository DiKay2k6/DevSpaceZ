import React from 'react';
import { motion, Variants } from 'framer-motion';
import { workflowSteps } from '../constants/landingData';

export const WorkflowSection: React.FC = () => {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="w-full max-w-[85rem] mx-auto px-6 py-24 relative z-10 border-t border-slate-200/10"
        >
            <motion.div variants={itemVariants} className="text-center mb-20 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                    Quy trình làm việc <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#60A5FA] dark:to-[#A78BFA]">liền mạch.</span>
                </h2>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                    Chuỗi phát triển vòng đời phần mềm (SDLC) hoàn hảo mà không cần chuyển đổi qua lại giữa nhiều nền tảng.
                </p>
            </motion.div>

            <div className="max-w-4xl mx-auto relative">
                <div className="absolute left-6 md:left-[32px] top-4 bottom-4 w-1 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex flex-col gap-12">
                    {workflowSteps.map((step, idx) => (
                        <motion.div key={idx} variants={itemVariants} className="relative flex items-start group">
                            <div className="absolute left-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl z-10 transition-transform duration-300 group-hover:scale-110 shadow-lg bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-white dark:ring-[#111520]">
                                {step.number}
                            </div>
                            <div className="ml-24 w-full md:w-[85%]">
                                <div className="p-8 rounded-3xl transition-all duration-300 border bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl hover:border-slate-300 dark:hover:border-blue-500/30">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">{step.icon}</div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{step.title}</h3>
                                    </div>
                                    <p className="leading-relaxed text-[15px] text-slate-600 dark:text-slate-300">{step.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};