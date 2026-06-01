import React from 'react';
import { motion, Variants } from 'framer-motion';
import { containers } from '../constants/monitorData';

export const DockerContainers: React.FC = () => {
    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
    };

    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="xl:col-span-2 space-y-4">
            <motion.h2 variants={cardVariant} className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 9.87a4.13 4.13 0 00-1.85-3.08A4.18 4.18 0 0017.65 6a4.2 4.2 0 00-2.83 1.05 4.15 4.15 0 00-1.25 2.82c0 .03 0 .06 0 .1-.56.12-1.14.28-1.74.49-1.28.44-2.58 1.05-3.8 1.83a15.42 15.42 0 00-4.08 3.86A11.16 11.16 0 002.5 19a1 1 0 001 1h17a1 1 0 001-1 11.23 11.23 0 001.06-9.13zM6.5 18H4.2a9.23 9.23 0 011.08-2.34 13.43 13.43 0 013.48-3.32c1.07-.68 2.22-1.21 3.35-1.6A14.28 14.28 0 0114.5 10c0-.52.12-1.03.35-1.5a2.2 2.2 0 011.38-1.24A2.16 2.16 0 0117.65 7a2.18 2.18 0 011.58.67 2.12 2.12 0 01.6 1.5c0 .48-.15.95-.44 1.34a2.22 2.22 0 01-1.32.78c-.28.05-.57.06-.86.04a1 1 0 00-1.12.83c-.07.6-.26 1.18-.55 1.7A12.3 12.3 0 016.5 18zm13 0h-11a14.24 14.24 0 005.1-4.14c.2-.28.38-.56.55-.86a1 1 0 00-.83-1.48c-.24-.03-.49-.03-.74 0a4.13 4.13 0 002.6-2.18 9.3 9.3 0 012.38 6.16 1 1 0 00.12.5 1 1 0 00.82.5z" /></svg>
                Docker Containers
            </motion.h2>

            {containers.map((container, idx) => (
                <motion.div
                    key={idx}
                    variants={cardVariant}
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-3xl border transition-all duration-300 bg-white dark:bg-[#1E293B]/40 border-slate-200 dark:border-slate-800 hover:shadow-md dark:hover:bg-[#1E293B]/60"
                >
                    <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{container.name}</h3>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors duration-300 ${container.status === 'Running'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
                                }`}>
                                {container.status}
                            </span>
                        </div>
                        <div className="text-xs font-mono flex items-center gap-3 transition-colors duration-300 text-slate-500 dark:text-slate-400">
                            <span>Image: {container.image}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500"></span>
                            <span>Port: {container.port}</span>
                        </div>
                    </div>

                    <div className="flex gap-6 mb-4 md:mb-0 md:px-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold mb-1 transition-colors duration-300 text-slate-400 dark:text-slate-500">CPU</p>
                            <p className="font-mono text-sm text-slate-900 dark:text-white">{container.cpu}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold mb-1 transition-colors duration-300 text-slate-400 dark:text-slate-500">RAM</p>
                            <p className="font-mono text-sm text-slate-900 dark:text-white">{container.mem}</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        {container.status === 'Running' ? (
                            <>
                                <button className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-300 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">Restart</button>
                                <button className="flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-300 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/30">Stop</button>
                            </>
                        ) : (
                            <button className="flex-1 md:flex-none px-8 py-2 rounded-xl text-xs font-bold transition-colors duration-300 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/30">Start</button>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};