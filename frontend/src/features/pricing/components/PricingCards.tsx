import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRICING_CONFIG, formatPrice } from '../constants/pricingData';

interface PricingCardsProps {
    isYearly: boolean;
}

export const PricingCards: React.FC<PricingCardsProps> = ({ isYearly }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">

            {/* Gói Student (Free) */}
            <div className="p-10 rounded-[32px] border flex flex-col transition-all duration-300 bg-white dark:bg-[#ffffff03] border-slate-200 dark:border-[#ffffff10] shadow-sm dark:shadow-none">
                <div className="mb-6">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Cá nhân</div>
                    <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Sinh viên</h3>
                    <p className="text-sm transition-colors duration-300 text-slate-500 dark:text-slate-400">Dành cho học tập và đồ án môn học.</p>
                </div>

                <div className="mb-10 flex items-baseline h-[60px]">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">0đ</span>
                    <span className="ml-2 text-slate-500 dark:text-slate-400">/vĩnh viễn</span>
                </div>

                <div className="w-full h-px mb-10 transition-colors duration-300 bg-slate-100 dark:bg-slate-800" />

                <ul className="space-y-4 mb-12 flex-1">
                    {["1 Workspace duy nhất", "5 thành viên cộng tác", "500MB Lưu trữ tài liệu", "Bảng Agile Kanban"].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-900 dark:text-white">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            {f}
                        </li>
                    ))}
                </ul>

                <button className="w-full py-4 rounded-2xl font-bold transition-all duration-300 bg-slate-100 dark:bg-[#ffffff0a] text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-[#ffffff15]">
                    Đang sử dụng
                </button>
            </div>

            {/* Gói Pro */}
            <div className="p-10 rounded-[32px] border-2 flex flex-col relative transition-all duration-300 bg-white dark:bg-[#ffffff05] border-blue-500 dark:border-blue-500/50 shadow-xl dark:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <div className="absolute -top-3.5 left-8 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Khuyên dùng
                </div>

                <div className="mb-6">
                    <div className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2">Đội ngũ</div>
                    <h3 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Professional</h3>
                    <p className="text-sm transition-colors duration-300 text-slate-500 dark:text-slate-400">Toàn bộ tính năng quản trị & giám sát.</p>
                </div>

                <div className="mb-10 flex flex-col justify-center h-[60px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isYearly ? 'yearly' : 'monthly'}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-baseline"
                        >
                            <span className="text-5xl font-bold text-blue-500">
                                {isYearly ? formatPrice(PRICING_CONFIG.yearly) : formatPrice(PRICING_CONFIG.monthly)}đ
                            </span>
                            <span className="text-sm font-bold ml-2 transition-colors duration-300 text-slate-500 dark:text-slate-400">
                                {isYearly ? '/ năm' : '/ tháng'}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="w-full h-px mb-10 transition-colors duration-300 bg-slate-100 dark:bg-slate-800" />

                <ul className="space-y-4 mb-12 flex-1">
                    {[
                        "Không giới hạn Workspace",
                        "5GB Lưu trữ & Cloud CDN",
                        "Live Dashboard Docker & Nginx",
                        "API Webhook & Tự động hóa"
                    ].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            {f}
                        </li>
                    ))}
                </ul>

                <div className="space-y-3">
                    <button className="w-full py-4 rounded-2xl font-bold bg-[#A50064] hover:bg-[#8A0053] text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-[#A50064]/20">
                        Thanh toán MoMo
                    </button>
                    <button className="w-full py-4 rounded-2xl font-bold border transition-all duration-300 bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
                        Thẻ tín dụng / PayPal
                    </button>
                </div>
            </div>

        </div>
    );
};