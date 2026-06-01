import React from 'react';
import { motion, Variants } from 'framer-motion';

export const WorkflowHero: React.FC = () => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
    };

    return (
        <motion.div variants={headerVariant} initial="hidden" animate="visible" className="text-center mb-24">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                Quy trình làm việc <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-[#60A5FA] dark:to-[#A78BFA]">Minh bạch.</span><br />
                Tự động hóa mọi bước đi.
            </h1>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed transition-colors duration-300 text-slate-500 dark:text-slate-400">
                Hiểu rõ ai đang làm gì, tiến độ đến đâu. Không còn cảnh trôi tin nhắn hay thất lạc tài liệu. DevSpace số hóa toàn bộ quy trình làm đồ án và quản lý dự án phần mềm của bạn.
            </p>
        </motion.div>
    );
};