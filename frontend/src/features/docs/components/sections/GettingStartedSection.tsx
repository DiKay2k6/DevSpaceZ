import React from 'react';

export const GettingStartedSection: React.FC = () => (
    <article className="max-w-4xl">
        <div className="text-blue-500 font-bold text-sm mb-4">Documentation / Bắt đầu nhanh</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Cài đặt Workspace</h1>
        <p className="text-lg leading-relaxed mb-8 transition-colors duration-300 text-slate-600 dark:text-slate-400">
            Hướng dẫn thiết lập môi trường làm việc cộng tác và cấu hình máy chủ Local để chạy DevSpacez.
        </p>

        <section className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">1. Khởi tạo Dự án bằng CLI</h2>
                <p className="mb-4 text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Sử dụng CLI của DevSpace để tạo dự án với template Agile có sẵn. Hệ thống sẽ tự sinh ra cấu trúc thư mục chuẩn.
                </p>
                <div className="p-4 rounded-xl font-mono text-sm overflow-x-auto transition-colors duration-300 bg-slate-100 dark:bg-[#05070A] border border-transparent dark:border-slate-800 text-slate-800 dark:text-blue-400">
                    $ devspace create-workspace "Do An Tot Nghiep" --template=agile
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">2. Phân quyền thành viên (RBAC)</h2>
                <p className="mb-4 text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Từ menu Workspace, chọn <strong>Members</strong> và nhập Email. DevSpacez hỗ trợ 3 vai trò phân quyền bảo mật cao:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <li className="p-4 rounded-xl border text-center transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                        <div className="font-bold text-blue-500">Admin</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Toàn quyền cấu hình System, Billing và quản lý users.</div>
                    </li>
                    <li className="p-4 rounded-xl border text-center transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                        <div className="font-bold text-blue-500">Developer</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Được phép kéo thả Task, Upload File, và Comment.</div>
                    </li>
                    <li className="p-4 rounded-xl border text-center transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                        <div className="font-bold text-blue-500">Viewer (Giảng viên)</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Chỉ đọc (Read-only), xem bảng Kanban và tải báo cáo.</div>
                    </li>
                </ul>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">3. Khởi chạy Local với Docker Compose</h2>
                <p className="mb-4 text-sm transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Đảm bảo bạn đã cài Docker Desktop. Chỉ với một dòng lệnh, toàn bộ Frontend, Backend, MongoDB và Redis sẽ được khởi chạy.
                </p>
                <div className="p-4 rounded-xl font-mono text-sm mb-2 transition-colors duration-300 bg-slate-100 dark:bg-[#05070A] border border-transparent dark:border-slate-800 text-slate-800 dark:text-slate-300">
                    <span className="text-slate-500"># Cấu hình biến môi trường</span><br />
                    $ cp .env.example .env<br /><br />
                    <span className="text-slate-500"># Khởi chạy toàn bộ cụm Container</span><br />
                    <span className="text-blue-500 dark:text-blue-400">$ docker-compose up -d --build</span>
                </div>
                <p className="text-xs text-slate-500">* Truy cập <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">http://localhost:3000</code> để vào màn hình Dashboard.</p>
            </div>
        </section>
    </article>
);