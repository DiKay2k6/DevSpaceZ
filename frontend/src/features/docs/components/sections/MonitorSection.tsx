import React from 'react';

export const MonitorSection: React.FC = () => (
    <article className="max-w-4xl">
        <div className="text-blue-500 font-bold text-sm mb-4">Documentation / Giám sát Hạ tầng</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Quản trị Docker & Nginx</h1>
        <p className="text-lg leading-relaxed mb-8 transition-colors duration-300 text-slate-600 dark:text-slate-400">
            Biến DevSpacez thành một trạm điều khiển trung tâm (Command Center) cho hạ tầng của bạn.
        </p>

        <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-l-4 border-l-emerald-500 transition-colors duration-300 bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">1. Giao tiếp qua Docker Engine API</h3>
                <p className="text-sm mb-4 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Node.js Backend của DevSpace giao tiếp thông qua <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-pink-600 dark:text-pink-400">/var/run/docker.sock</code> để liên tục kéo (pull) các thông số Stats (CPU Usage, Memory Limit) của toàn bộ Container trong hệ thống và vẽ biểu đồ lên UI.
                </p>
                <div className="px-4 py-2 rounded text-xs font-mono inline-block transition-colors duration-300 bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-300">
                    GET /containers/json?all=true
                </div>
            </div>

            <div className="p-6 rounded-2xl border border-l-4 border-l-purple-500 transition-colors duration-300 bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">2. Truyền tải Log với WebSockets (Socket.IO)</h3>
                <p className="text-sm mb-4 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Log truy cập từ Nginx (Access Logs / Error Logs) sẽ không bắt người dùng phải "F5" lại trang. Thay vào đó, Backend mở một kênh WebSocket chuyên biệt để đẩy (emit) từng dòng log mới thẳng xuống trình duyệt Client.
                </p>
                <div className="p-4 rounded-xl font-mono text-xs transition-colors duration-300 bg-slate-900 dark:bg-[#05070A] border border-transparent dark:border-slate-800 text-slate-300 dark:text-emerald-400">
                    <span className="text-blue-400">[Client]</span> Connected to wss://devspace.vlu.edu.vn/logs<br />
                    <span className="text-purple-400">[Server]</span> Nginx Log: 192.168.1.1 - GET /api/users 200 OK<br />
                    <span className="text-purple-400">[Server]</span> Nginx Log: 192.168.1.5 - POST /api/tasks 201 Created
                </div>
            </div>
        </div>
    </article>
);