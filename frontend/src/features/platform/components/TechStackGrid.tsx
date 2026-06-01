import React from 'react';
import { motion, Variants } from 'framer-motion';

export const TechStackGrid: React.FC = () => {
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
        <section>
            <motion.div
                variants={headerVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="mb-12 text-center"
            >
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Công nghệ Cốt lõi</h2>
            </motion.div>

            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Card 1: Frontend */}
                <motion.div
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="md:col-span-2 p-8 rounded-3xl border cursor-default transition-colors transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-[#1E293B] dark:to-[#0F172A] border-blue-100 dark:border-slate-700 shadow-sm dark:shadow-xl text-slate-900 dark:text-white"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#61DAFB]/20 text-[#61DAFB] rounded-xl">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold">Frontend UI/UX</h3>
                    </div>
                    <p className="text-base leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-300">
                        Xây dựng bằng React.js (Vite) cho tốc độ build cực nhanh. Giao diện được tối ưu hóa bằng Tailwind CSS v4 với phong cách Glassmorphism và Framer Motion để xử lý các animation kéo thả Kanban mượt mà nhất.
                    </p>
                </motion.div>

                {/* Card 2: Database */}
                <motion.div
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="p-8 rounded-3xl border cursor-default transition-colors transition-shadow duration-300 bg-white dark:bg-[#1E293B]/50 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl text-slate-900 dark:text-white"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#47A248]/20 text-[#47A248] rounded-xl">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold">Database Layer</h3>
                    </div>
                    <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-300">
                        MongoDB (Mongoose) xử lý lưu trữ cấu trúc Task dạng phân cấp phức tạp. Redis đảm nhiệm caching kết quả thống kê và giữ kết nối WebSockets ổn định.
                    </p>
                </motion.div>

                {/* Card 3: Backend */}
                <motion.div
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="p-8 rounded-3xl border cursor-default transition-colors transition-shadow duration-300 bg-white dark:bg-[#1E293B]/50 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl text-slate-900 dark:text-white"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#339933]/20 text-[#339933] rounded-xl">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold">Backend API</h3>
                    </div>
                    <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-300">
                        Node.js & Express.js. Khả năng xử lý I/O không đồng bộ xuất sắc, cực kỳ phù hợp cho các luồng truyền dữ liệu log từ server và webhook thanh toán.
                    </p>
                </motion.div>

                {/* Card 4: DevOps & Infra */}
                <motion.div
                    variants={cardVariant}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="md:col-span-2 p-8 rounded-3xl border cursor-default transition-colors transition-shadow duration-300 bg-gradient-to-tr from-violet-50 to-white dark:from-[#2E1065]/40 dark:to-[#0F172A] border-violet-100 dark:border-slate-700 shadow-sm dark:shadow-xl text-slate-900 dark:text-white"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#2496ED]/20 text-[#2496ED] rounded-xl">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m-2.954-2.716h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185H8.075a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185H8.075a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.185m0 2.716h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H8.075a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.954-2.716h2.118a.186.186 0 00.186-.186V6.29a.186.186 0 00-.186-.185H5.121a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.185m0 2.716h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H5.121a.185.185 0 00-.186.185v1.888c0 .102.084.185.186.185M14.98 13.678h-2.961a.186.186 0 00-.186.185v1.888c0 .102.083.185.186.185h2.961a.186.186 0 00.186-.185v-1.888a.186.186 0 00-.186-.185m-1.48-1.358h2.119a.186.186 0 00.186-.185V10.24a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.895c0 .102.083.185.185.185m6.877 2.15c0-.127-.061-.24-.162-.303l-1.92-1.22c-.105-.067-.23-.069-.335-.008l-1.91 1.096c-.101.058-.162.164-.162.28v2.302c0 .114.056.215.15.275l1.91 1.23c.099.064.225.064.324 0l1.93-1.22c.098-.061.157-.165.157-.282v-2.15h-.002zM12.015 17.5l-3.328-1.745c-.217-.114-.467-.114-.684 0l-3.328 1.745c-.217.114-.352.348-.352.595v4.61c0 .248.135.48.352.595l3.328 1.745c.108.057.23.086.352.086.12 0 .24-.03.352-.086l3.328-1.745c.217-.114.352-.348.352-.595v-4.61c0-.248-.135-.48-.352-.595z" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold">DevOps & System Infra</h3>
                    </div>
                    <p className="text-base leading-relaxed transition-colors duration-300 text-slate-600 dark:text-slate-300">
                        Môi trường đồng nhất từ máy lập trình viên lên production bằng Docker. Nginx điều hướng an toàn các luồng WebSockets `/ws`. Docker Engine API cung cấp dữ liệu theo dõi sức khỏe server.
                    </p>
                </motion.div>
            </motion.div>
        </section>
    );
};