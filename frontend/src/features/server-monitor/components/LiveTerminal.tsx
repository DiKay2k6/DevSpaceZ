import React from 'react';
import { motion, Variants } from 'framer-motion';
import { SystemLog } from '../constants/monitorData';

interface LiveTerminalProps {
    logs: SystemLog[];
}

export const LiveTerminal: React.FC<LiveTerminalProps> = ({ logs }) => {
    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <motion.div variants={cardVariant} initial="hidden" animate="visible" className="xl:col-span-1 h-full flex flex-col">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Live Server Logs
            </h2>

            <div className="flex-1 bg-[#090C15] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col min-h-[400px]">
                <div className="px-4 py-3 bg-[#111520] border-b border-slate-800 flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 ml-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected: devspace-nginx
                    </span>
                </div>

                <div className="p-5 font-mono text-[11px] leading-relaxed text-slate-300 flex-1 overflow-y-auto space-y-1.5">
                    <p className="text-[#27C93F] mb-4">$ tail -f /var/log/nginx/access.log & docker logs</p>

                    {logs.map((log, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-3"
                        >
                            <span className="text-slate-600 shrink-0">[{log.time}]</span>
                            <span className={`break-all ${log.type === 'error' ? 'text-[#FF5F56]' :
                                log.type === 'success' ? 'text-[#27C93F]' : 'text-slate-300'
                                }`}>
                                {log.message}
                            </span>
                        </motion.div>
                    ))}

                    <div className="flex gap-3 mt-1">
                        <span className="text-slate-600">[{new Date().toLocaleTimeString('vi-VN', { hour12: false })}]</span>
                        <span className="w-2 h-4 bg-slate-400 animate-pulse inline-block"></span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};