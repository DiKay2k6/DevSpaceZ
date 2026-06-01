import React from 'react';
import { motion, Variants } from 'framer-motion';
import { DISCOUNT_PERCENT } from '../constants/pricingData';

interface PricingHeroProps {
    isYearly: boolean;
    setIsYearly: (val: boolean) => void;
}

export const PricingHero: React.FC<PricingHeroProps> = ({ isYearly, setIsYearly }) => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
    };

    return (
        <motion.div
            variants={headerVariant}
            initial="hidden"
            animate="visible"
            className="text-center mb-16"
        >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
                Mở khóa <span className="text-blue-500">toàn bộ tiềm năng.</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto transition-colors duration-300 text-slate-500 dark:text-slate-400">
                Dễ dàng nâng cấp tài nguyên để quản lý các dự án lớn hơn, giám sát hạ tầng Docker chuyên sâu và lưu trữ không giới hạn.
            </p>

            {/* Sliding Toggle */}
            <div className="mt-12 flex justify-center">
                <div className="relative flex p-1 rounded-full border transition-colors duration-300 bg-slate-100 dark:bg-[#ffffff0a] border-slate-200 dark:border-[#ffffff1a]">

                    {/* Nền xanh trượt phía sau */}
                    <motion.div
                        className="absolute top-1 bottom-1 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"
                        initial={false}
                        animate={{
                            x: isYearly ? '100%' : '0%',
                            width: '50%'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        style={{ left: 4, right: 4, width: 'calc(50% - 4px)' }}
                    />

                    {/* Nút Tháng */}
                    <button
                        onClick={() => setIsYearly(false)}
                        className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors duration-300 ${!isYearly ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        HÀNG THÁNG
                    </button>

                    {/* Nút Năm */}
                    <button
                        onClick={() => setIsYearly(true)}
                        className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors duration-300 flex items-center gap-2 ${isYearly ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        HÀNG NĂM
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border transition-colors duration-300 ${isYearly ? 'bg-white/20 border-white/30 text-white' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                            -{DISCOUNT_PERCENT}%
                        </span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};