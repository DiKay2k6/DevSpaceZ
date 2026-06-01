import React from 'react';
import { motion, Variants } from 'framer-motion';
import { kanbanData } from '../constants/workflowsData';

export const KanbanPreview: React.FC = () => {
    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <section className="mb-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Giao diện Bảng Agile / Kanban</h2>
                <p className="text-sm transition-colors duration-300 text-slate-500 dark:text-slate-400">Kéo thả mượt mà với Framer Motion. Dữ liệu đồng bộ tức thì bằng WebSockets.</p>
            </div>

            <motion.div
                variants={cardVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-4 md:p-8 rounded-[40px] border backdrop-blur-xl transition-colors duration-300 bg-white/60 dark:bg-[#1E293B]/40 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl"
            >
                {/* Thanh công cụ ảo của Bảng */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 px-2 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-white shadow-md">SP</div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sprint #1: Foundation Setup</h3>
                            <p className="text-xs transition-colors duration-300 text-slate-500 dark:text-slate-400">13/05/2026 - 27/05/2026</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="text-sm px-4 py-2 rounded-lg font-bold transition-colors duration-300 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/30">
                            + Tạo Task mới
                        </button>
                    </div>
                </div>

                {/* Cột Kanban */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {kanbanData.map((col, idx) => (
                        <div key={idx} className="p-4 rounded-3xl border transition-colors duration-300 bg-slate-50/50 dark:bg-[#ffffff03] border-slate-200 dark:border-slate-800/50">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{col.title}</span>
                                <span className="text-xs px-2.5 py-1 rounded-full font-bold transition-colors duration-300 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{col.count}</span>
                            </div>

                            <div className="flex flex-col gap-4">
                                {col.tasks.map((task, tIdx) => (
                                    <motion.div
                                        key={tIdx}
                                        whileHover={{ y: -4, scale: 1.01 }}
                                        className="p-5 rounded-2xl border cursor-grab active:cursor-grabbing transition-colors transition-shadow duration-300 hover:shadow-md bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-700/70"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-500/10 border border-transparent dark:border-blue-500/20">{task.id}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${task.priority === 'Critical' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-transparent dark:border-red-500/20' :
                                                    task.priority === 'High' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-transparent dark:border-orange-500/20' :
                                                        'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-transparent dark:border-slate-500/20'
                                                }`}>{task.priority}</span>
                                        </div>
                                        <h4 className="font-bold text-[15px] mb-1 text-slate-900 dark:text-white">{task.title}</h4>
                                        <p className="text-xs mb-4 line-clamp-2 transition-colors duration-300 text-slate-500 dark:text-slate-400">{task.desc}</p>

                                        <div className="flex justify-between items-center border-t pt-3 border-slate-100 dark:border-slate-200/10">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400">1 file</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[9px] text-white font-bold shadow-sm">
                                                    {task.user.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};