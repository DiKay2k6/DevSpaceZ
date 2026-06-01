import React from 'react';
import { motion, Variants } from 'framer-motion';
import { teamMembers, contactChannels } from '../constants/supportData';

export const SupportChannels: React.FC = () => {
    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-1 space-y-6">

            {/* Contact Channels */}
            <motion.div variants={cardVariant} className="p-6 rounded-3xl border transition-colors duration-300 bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <h3 className="font-bold text-lg mb-5 text-slate-900 dark:text-white">Các kênh hỗ trợ nhanh</h3>
                <div className="space-y-2">
                    {contactChannels.map((channel, i) => (
                        <a key={i} href={channel.link} className="flex items-center gap-4 p-3 rounded-2xl transition-colors duration-300 hover:bg-slate-50 dark:hover:bg-[#ffffff05]">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${channel.colorClass}`}>
                                {channel.icon}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{channel.title}</p>
                                <p className="text-xs mt-0.5 transition-colors duration-300 text-slate-500 dark:text-slate-400">{channel.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </motion.div>

            {/* Đội ngũ Support */}
            <motion.div variants={cardVariant} className="p-6 rounded-3xl border transition-colors duration-300 bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                <h3 className="font-bold text-lg mb-3 text-blue-500">Đội ngũ Kỹ sư VLU</h3>
                <p className="text-[13px] leading-relaxed mb-6 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Hệ thống được phát triển và vận hành trực tiếp bởi sinh viên Khoa CNTT - Đại học Văn Lang.
                </p>
                <div className="space-y-4">
                    {teamMembers.map((member, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm ${member.color}`}>
                                {member.name.split(' ').pop()?.[0]}
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight mb-0.5 text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 text-slate-500 dark:text-slate-400">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};