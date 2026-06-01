import React from 'react';

export const KanbanSection: React.FC = () => (
    <article className="max-w-4xl">
        <div className="text-blue-500 font-bold text-sm mb-4">Documentation / Quản lý Agile</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white">Quy trình làm việc Agile</h1>
        <p className="text-lg leading-relaxed mb-8 transition-colors duration-300 text-slate-600 dark:text-slate-400">
            Bảng Kanban trên DevSpacez không chỉ để di chuyển trạng thái, nó là trung tâm giao tiếp của cả đội để duy trì tính liên tục của các Sprint.
        </p>

        <div className="space-y-8">
            <div className="p-6 rounded-2xl border transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                    Lưu trữ File thông minh (AWS S3)
                </h3>
                <p className="text-sm mb-3 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Thay vì gửi file qua Zalo rồi bị trôi mất, bạn có thể kéo thả file đính kèm trực tiếp vào Task. Hệ thống <strong className="text-slate-800 dark:text-slate-200">không lưu file nhị phân trực tiếp vào MongoDB</strong> để tránh quá tải. File thực tế được đẩy lên dịch vụ AWS S3 Cloud Storage, đảm bảo truy xuất tốc độ cao thông qua URL.
                </p>
                <div className="px-3 py-2 rounded-lg text-xs font-mono inline-block transition-colors duration-300 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    ⚠ Giới hạn tải lên: Tối đa 25MB / File.
                </div>
            </div>

            <div className="p-6 rounded-2xl border transition-colors duration-300 bg-white dark:bg-white/5 border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Soạn thảo Markdown & Code Block</h3>
                <p className="text-sm mb-4 transition-colors duration-300 text-slate-600 dark:text-slate-400">
                    Phần mô tả và bình luận Task hỗ trợ chuẩn Markdown chuyên sâu. Rất phù hợp để trao đổi về lỗi Code hoặc API Payload.
                </p>
                <div className="p-4 rounded-xl font-mono text-xs transition-colors duration-300 bg-slate-100 dark:bg-[#05070A] border border-transparent dark:border-slate-800 text-slate-800 dark:text-slate-300">
                    <span className="text-slate-500"># Bạn có thể viết như sau trong phần Comment:</span><br /><br />
                    **Lỗi phát hiện:** API trả về 502 khi gọi route `/auth/login`.<br /><br />
                    ```json<br />
                    &#123;<br />
                    &nbsp;&nbsp;"error": "Bad Gateway",<br />
                    &nbsp;&nbsp;"code": 502<br />
                    &#125;<br />
                    ```<br />
                    <span className="text-blue-500">@NamGiang</span> kiểm tra lại Nginx Proxy nhé!
                </div>
            </div>
        </div>
    </article>
);