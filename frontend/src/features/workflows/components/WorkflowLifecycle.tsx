import React from 'react';
import { motion } from 'framer-motion';
import { lifecycleSteps } from '../constants/workflowsData';

export const WorkflowLifecycle: React.FC = () => {
    return (
        <section className="mb-32">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Một vòng đời Task diễn ra như thế nào?</h2>
                <p className="text-sm transition-colors duration-300 text-slate-500 dark:text-slate-400">Ví dụ quy trình thực hiện chức năng "Đăng nhập" trên DevSpace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Đường nối giữa các bước */}
                <div className="hidden md:block absolute top-[45%] left-[10%] w-[80%] h-0.5 border-t-2 border-dashed transition-colors duration-300 border-slate-300 dark:border-slate-700"></div>

                {lifecycleSteps.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 }}
                        className="relative text-center z-10"
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 border-4 shadow-lg transition-colors duration-300 bg-white dark:bg-[#1E293B] border-blue-50 dark:border-[#0F172A] text-blue-600 dark:text-blue-400">
                            {item.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">Bước {item.step}: {item.title}</h3>
                        <p className="text-sm leading-relaxed px-2 transition-colors duration-300 text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};