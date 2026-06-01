import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { supportTopics } from '../constants/supportData';

export const TicketForm: React.FC = () => {
    const [ticketSubmitted, setTicketSubmitted] = useState<boolean>(false);

    const headerVariant: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTicketSubmitted(true);
        setTimeout(() => setTicketSubmitted(false), 5000);
    };

    return (
        <motion.div variants={headerVariant} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2">
            <div className="p-8 md:p-10 rounded-[32px] border transition-colors duration-300 bg-white dark:bg-[#151B2B]/80 border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Tạo yêu cầu hỗ trợ (Submit a Ticket)</h2>
                    <p className="text-sm leading-relaxed transition-colors duration-300 text-slate-500 dark:text-slate-400">
                        Mô tả chi tiết sự cố hoặc thắc mắc của bạn. Các vấn đề liên quan đến <strong className="text-slate-700 dark:text-slate-300">Thanh toán (Billing)</strong> và <strong className="text-slate-700 dark:text-slate-300">Mất kết nối WebSockets</strong> sẽ được hệ thống ưu tiên định tuyến xử lý trước.
                    </p>
                </div>

                {ticketSubmitted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-2xl text-center border transition-colors duration-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-emerald-500/30">✓</div>
                        <h3 className="text-xl font-bold mb-2 transition-colors duration-300 text-emerald-800 dark:text-emerald-400">Ticket đã được gửi thành công!</h3>
                        <p className="text-sm transition-colors duration-300 text-emerald-600 dark:text-emerald-500/80">Mã Tracking: <strong className="font-mono bg-emerald-500/20 px-1 rounded">#TKT-8842</strong>. Đội ngũ kỹ sư sẽ kiểm tra hệ thống và phản hồi qua email cho bạn sớm nhất.</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-900 dark:text-white">Email liên hệ <span className="text-red-500">*</span></label>
                                <input required type="email" placeholder="you@vlu.edu.vn" className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-colors duration-300 bg-slate-50 dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#0B0F1A] focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600" />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-900 dark:text-white">Chủ đề hỗ trợ</label>
                                <select className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-colors duration-300 appearance-none bg-slate-50 dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#0B0F1A] focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white">
                                    {supportTopics.map((topic, index) => (
                                        <option key={index}>{topic}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-sm font-bold flex justify-between text-slate-900 dark:text-white">
                                Mô tả chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea required rows={6} placeholder="Mô tả cụ thể các bước dẫn đến lỗi để chúng tôi có thể tái tạo lại vấn đề trên môi trường test..." className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-colors duration-300 resize-none bg-slate-50 dark:bg-[#0B0F1A] border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#0B0F1A] focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"></textarea>
                            <p className="text-[11px] text-slate-500">* Hỗ trợ định dạng Markdown nếu bạn cần gửi nội dung Code Snippet.</p>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
                                <span className="text-xs transition-colors duration-300 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">Cho phép kỹ sư DevSpace truy cập Workspace để kiểm tra</span>
                            </label>
                            <button type="submit" className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20">
                                Gửi Yêu Cầu
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};