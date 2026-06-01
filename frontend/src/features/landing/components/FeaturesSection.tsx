import React from 'react';
import { motion, Variants } from 'framer-motion';
import { getFeaturesData } from '../constants/landingData';
import { useTheme } from '@/shared/contexts/ThemeContext';

export const FeaturesSection: React.FC<{
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}> = ({ onMouseEnter, onMouseLeave }) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const features = getFeaturesData(isLight);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="w-full max-w-[85rem] mx-auto px-6 py-24 relative z-10"
        >
            <motion.div variants={itemVariants} className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                    Mọi công cụ bạn cần, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-[#60A5FA] dark:to-[#A78BFA]">ở cùng một nơi.</span>
                </h2>
                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                    Được thiết kế để tối ưu hóa hiệu suất cho cả đội ngũ phát triển lẫn vận hành.
                </p>
            </motion.div>

            <div className="p-4 md:p-6 rounded-[2rem] border transition-colors duration-300 backdrop-blur-xl bg-slate-100/50 dark:bg-[#ffffff05] border-slate-200 dark:border-[#ffffff10] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -6 }} // Framer Motion xử lý trượt lên
                            // FIX: Đã thay transition-all thành transition-colors transition-shadow
                            className={`group relative flex flex-col p-5 rounded-[24px] cursor-default overflow-hidden z-10 
                                transition-colors transition-shadow duration-300
                                bg-white dark:bg-[#ffffff08] border border-slate-200 dark:border-[#ffffff10] 
                                hover:shadow-2xl dark:hover:bg-[#ffffff0d] dark:hover:border-[#ffffff20] dark:hover:shadow-black/80
                                ${isLight ? feature.lightHoverBorder : ''} 
                                ${isLight ? feature.lightHoverShadow : ''}`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${isLight ? feature.lightHoverGlow : feature.darkHoverGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0`}></div>
                            <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent ${feature.spotlight} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[1px] z-0`}></div>

                            <div className={`relative h-44 rounded-xl mb-6 flex overflow-hidden border transition-colors duration-300 z-10 bg-gradient-to-br border-slate-100 dark:border-transparent group-hover:border-white/50 dark:group-hover:border-white/10 ${feature.gradientBox}`}>
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] z-0"></div>
                                <div className="relative z-10 w-full h-full">{feature.mockup}</div>
                            </div>
                            <div className="relative flex flex-col flex-grow z-10">
                                <h3 className="text-lg font-bold mb-2 transition-colors duration-300 text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-400">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};