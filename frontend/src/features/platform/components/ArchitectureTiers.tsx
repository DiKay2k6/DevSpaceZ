import React from 'react';
import { motion, Variants } from 'framer-motion';
import { architectureTiers } from '../constants/platformData';

export const ArchitectureTiers: React.FC = () => {
    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
    };

    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15, mass: 1 } }
    };

    return (
        <section className="mb-32">
            <motion.div
                variants={headerVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Sơ đồ Kiến trúc 5 Tầng</h2>
                <p className="text-sm transition-colors duration-300 text-slate-500 dark:text-slate-400">
                    Luồng dữ liệu liền mạch từ Giao diện người dùng đến Hạ tầng máy chủ.
                </p>
            </motion.div>

            <div className="relative">
                {/* Đường line kết nối */}
                <div className="hidden lg:block absolute top-[50%] left-0 w-full h-0.5 -translate-y-1/2 transition-colors duration-300 bg-slate-200 dark:bg-slate-800"></div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                >
                    {architectureTiers.map((tier, idx) => (
                        <motion.div
                            key={idx}
                            variants={cardVariant}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            className="relative p-6 rounded-3xl border backdrop-blur-md cursor-default transition-colors transition-shadow duration-300 bg-white/90 dark:bg-[#1E293B]/90 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl"
                        >
                            <div className="absolute -top-4 left-6 px-3 py-1 rounded-lg text-xs font-bold border transition-colors duration-300 bg-blue-600 dark:bg-blue-500 text-white border-blue-700 dark:border-blue-400">
                                Tier {tier.step}
                            </div>
                            <h3 className="mt-4 text-xl font-bold mb-1 text-slate-900 dark:text-white">{tier.title}</h3>
                            <div className="text-blue-500 text-sm font-semibold mb-3">{tier.tech}</div>
                            <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-400">
                                {tier.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};