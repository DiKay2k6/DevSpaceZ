import React from 'react';

export const IntroSection: React.FC = () => (
    <article className="max-w-4xl">
        <div className="text-blue-500 font-bold text-sm mb-4">Documentation / Giới thiệu</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">DevSpacez là gì?</h1>
        <p className="text-lg leading-relaxed mb-6 transition-colors duration-300 text-slate-600 dark:text-slate-400">
            DevSpacez là một hệ sinh thái hợp nhất được thiết kế riêng cho các đội ngũ công nghệ (IT Teams) và sinh viên thực hiện đồ án. Nó giải quyết bài toán phân mảnh công cụ khi kết hợp 3 yếu tố cốt lõi vào một nền tảng duy nhất:
        </p>
        <ul className="space-y-4 mb-10">
            <li className="p-5 rounded-2xl border transition-colors duration-300 bg-slate-50 dark:bg-[#151B2B] border-slate-200 dark:border-slate-800">
                <strong className="text-blue-500 block mb-1 text-lg">1. Quản lý dự án Agile</strong>
                <span className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Bảng Kanban kéo thả mượt mà, phân công công việc (Task) rõ ràng, hỗ trợ theo dõi tiến độ Sprint.</span>
            </li>
            <li className="p-5 rounded-2xl border transition-colors duration-300 bg-slate-50 dark:bg-[#151B2B] border-slate-200 dark:border-slate-800">
                <strong className="text-emerald-500 block mb-1 text-lg">2. Lưu trữ tài liệu tập trung</strong>
                <span className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Hệ thống tải và quản lý file đính kèm chuyên biệt, kết nối trực tiếp với AWS S3 Cloud Storage để lưu trữ an toàn các file báo cáo SRS, PRD.</span>
            </li>
            <li className="p-5 rounded-2xl border transition-colors duration-300 bg-slate-50 dark:bg-[#151B2B] border-slate-200 dark:border-slate-800">
                <strong className="text-purple-500 block mb-1 text-lg">3. Giám sát hệ thống (Monitor)</strong>
                <span className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Kết nối trực tiếp vào Docker Engine API để theo dõi Container (CPU, RAM) và stream Nginx Logs theo thời gian thực qua WebSockets.</span>
            </li>
        </ul>

        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Lộ trình triển khai (Roadmap)</h2>
        <div className="p-6 rounded-2xl border transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-slate-800">
            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">T1</div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900 dark:text-white">Tháng 1 (Sprint 1-2): Kiến trúc Nền móng</h4>
                        <p className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Khởi tạo repo Git. Thiết lập Node.js, cấu hình MongoDB Schemas. Cài đặt hệ thống CI/CD cơ bản với GitHub Actions.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">T2</div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900 dark:text-white">Tháng 2 (Sprint 3-4): Lõi Quản lý Công việc</h4>
                        <p className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Phát triển Frontend React. Xây dựng Kanban Board với Framer Motion. Tích hợp tính năng upload tài liệu.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">T3</div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900 dark:text-white">Tháng 3 (Sprint 5-6): Trái tim Giám sát</h4>
                        <p className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Lập trình module kết nối Docker Engine. Cấu hình Nginx Reverse Proxy chuẩn. Đổ dữ liệu log lên Dashboard sử dụng WebSockets.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">T4</div>
                    <div>
                        <h4 className="font-bold mb-1 text-slate-900 dark:text-white">Tháng 4 (Sprint 7-8): Thương mại hóa & Hoàn thiện</h4>
                        <p className="text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">Tích hợp luồng thanh toán MoMo, PayPal. Kiểm thử bảo mật toàn diện và viết báo cáo tổng kết.</p>
                    </div>
                </div>
            </div>
        </div>
    </article>
);