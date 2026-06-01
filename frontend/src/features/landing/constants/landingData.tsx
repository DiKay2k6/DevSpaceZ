import React from 'react';

export interface FeatureItem {
    title: string;
    desc: string;
    gradientBox: string;
    darkHoverGlow: string;
    lightHoverGlow: string;
    lightHoverShadow: string;
    lightHoverBorder: string;
    spotlight: string;
    mockup: React.ReactNode;
}

export interface WorkflowStep {
    number: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
}

export interface TargetAudience {
    role: string;
    headline: string;
    pain: string;
    solution: string;
    tags: string[];
    icon: React.ReactNode;
}

export const getFeaturesData = (isLight: boolean): FeatureItem[] => [
    {
        title: "Agile Kanban Board",
        desc: "Quản lý luồng công việc mượt mà với giao diện kéo thả trực quan. Theo dõi tiến độ Sprint không độ trễ.",
        gradientBox: isLight ? "from-blue-500/5 to-indigo-500/5" : "from-blue-500/20 to-indigo-500/20",
        darkHoverGlow: "from-blue-500/15 to-indigo-500/15",
        lightHoverGlow: "from-blue-400/10 to-indigo-400/10",
        lightHoverShadow: "hover:shadow-blue-500/20",
        lightHoverBorder: "hover:border-blue-300/60",
        spotlight: isLight ? "via-blue-400/60" : "via-blue-400",
        mockup: (
            <div className="w-full h-full p-3 flex gap-2 overflow-hidden items-end justify-center">
                <div className={`w-1/3 rounded-t-lg p-2 space-y-2 ${isLight ? 'bg-white/60' : 'bg-slate-800/50'} h-[80%]`}>
                    <div className="w-6 h-1.5 bg-blue-400 rounded-full mb-3"></div>
                    <div className={`w-full h-6 rounded shadow-sm ${isLight ? 'bg-white' : 'bg-slate-700'}`}></div>
                    <div className={`w-full h-8 rounded shadow-sm transform transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-1 ${isLight ? 'bg-white' : 'bg-slate-700'}`}></div>
                </div>
                <div className={`w-1/3 rounded-t-lg p-2 space-y-2 ${isLight ? 'bg-white/60' : 'bg-slate-800/50'} h-[100%]`}>
                    <div className="w-6 h-1.5 bg-yellow-400 rounded-full mb-3 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
                    <div className={`w-full h-10 rounded shadow-md border-2 border-blue-400 transform transition-transform duration-500 group-hover:-translate-y-2 ${isLight ? 'bg-blue-50' : 'bg-slate-800'}`}></div>
                </div>
                <div className={`w-1/3 rounded-t-lg p-2 space-y-2 ${isLight ? 'bg-white/60' : 'bg-slate-800/50'} h-[60%]`}>
                    <div className="w-6 h-1.5 bg-green-400 rounded-full mb-3"></div>
                    <div className={`w-full h-6 rounded shadow-sm ${isLight ? 'bg-white' : 'bg-slate-700'}`}></div>
                </div>
            </div>
        )
    },
    {
        title: "Real-time Docker Monitor",
        desc: "Giám sát tài nguyên container, xem logs và nâng cấp hạ tầng Nginx ngay trên một dashboard duy nhất.",
        gradientBox: isLight ? "from-emerald-500/5 to-teal-500/5" : "from-emerald-500/20 to-teal-500/20",
        darkHoverGlow: "from-emerald-500/15 to-teal-500/15",
        lightHoverGlow: "from-emerald-400/10 to-teal-400/10",
        lightHoverShadow: "hover:shadow-emerald-500/20",
        lightHoverBorder: "hover:border-emerald-300/60",
        spotlight: isLight ? "via-emerald-400/60" : "via-emerald-400",
        mockup: (
            <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                <div className={`w-[90%] h-[85%] bg-[#0F172A] rounded-lg border shadow-xl overflow-hidden flex flex-col transform transition-all duration-500 group-hover:-translate-y-1 ${isLight ? 'border-slate-800 group-hover:shadow-emerald-500/30' : 'border-slate-700 group-hover:shadow-emerald-900/30 group-hover:border-slate-600'}`}>
                    <div className="h-4 bg-slate-800 flex items-center px-2 gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="p-2 text-[8px] font-mono leading-relaxed text-emerald-400">
                        <span className="text-emerald-300 opacity-70">docker stats</span><br />
                        <span className="text-slate-400">CONTAINER  CPU%</span><br />
                        <span className="text-slate-300">nginx_web  </span><span className="transition-colors duration-300 group-hover:text-emerald-300">1.2%</span><br />
                        <span className="text-slate-300">api_core   </span><span className="transition-colors duration-300 group-hover:text-yellow-300">4.8%</span><br />
                        <span className="animate-pulse text-emerald-300 group-hover:text-white">_</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Tích hợp Thanh toán MoMo",
        desc: "Nâng cấp gói tài nguyên máy chủ nhanh chóng với cổng thanh toán MoMo tự động duyệt giao dịch 24/7.",
        gradientBox: isLight ? "from-pink-500/5 to-rose-500/5" : "from-pink-500/20 to-rose-500/20",
        darkHoverGlow: "from-pink-500/15 to-rose-500/15",
        lightHoverGlow: "from-pink-400/10 to-rose-400/10",
        lightHoverShadow: "hover:shadow-pink-500/20",
        lightHoverBorder: "hover:border-pink-300/60",
        spotlight: isLight ? "via-pink-400/60" : "via-pink-400",
        mockup: (
            <div className="w-full h-full p-4 flex items-center justify-center relative">
                <div className="w-[85%] h-[65%] bg-gradient-to-br from-[#A50064] to-[#E6008B] rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between p-3 transform -rotate-3 group-hover:rotate-0 group-hover:scale-[1.05] group-hover:shadow-pink-600/30 transition-all duration-500 ease-out">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6 blur-lg group-hover:bg-white/20 transition-colors duration-500"></div>
                    <div className="text-white font-bold text-xs tracking-widest opacity-95">MoMo</div>
                    <div>
                        <div className="text-white/80 text-[8px] mb-0.5">Thanh toán tự động</div>
                        <div className="text-white font-mono text-sm tracking-widest drop-shadow-md">**** 8888</div>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Quản lý Tài liệu Tập trung",
        desc: "Không còn cảnh thất lạc file. Mọi tài liệu thiết kế, SRS, PRD đều được version control chặt chẽ.",
        gradientBox: isLight ? "from-violet-500/5 to-purple-500/5" : "from-violet-500/20 to-purple-500/20",
        darkHoverGlow: "from-violet-500/15 to-purple-500/15",
        lightHoverGlow: "from-violet-400/10 to-purple-400/10",
        lightHoverShadow: "hover:shadow-violet-500/20",
        lightHoverBorder: "hover:border-violet-300/60",
        spotlight: isLight ? "via-violet-400/60" : "via-violet-400",
        mockup: (
            <div className="w-full h-full p-4 flex items-center justify-center relative">
                <div className={`absolute w-[70%] h-[75%] rounded-lg border shadow-md transform rotate-6 ml-6 mt-4 transition-transform duration-500 group-hover:rotate-12 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}></div>
                <div className={`relative w-[75%] h-[80%] rounded-lg border shadow-lg flex flex-col p-3 gap-2 transform transition-transform duration-500 group-hover:-translate-y-2 group-hover:-rotate-2 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-600'}`}>
                    <div className={`w-8 h-8 rounded mb-1 flex items-center justify-center ${isLight ? 'bg-violet-100 text-violet-600' : 'bg-violet-500/20 text-violet-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <div className={`w-3/4 h-2 rounded-full ${isLight ? 'bg-slate-200' : 'bg-slate-600'}`}></div>
                    <div className={`w-full h-1 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}></div>
                    <div className={`w-5/6 h-1 rounded-full ${isLight ? 'bg-slate-100' : 'bg-slate-700'}`}></div>
                </div>
            </div>
        )
    }
];

export const workflowSteps: WorkflowStep[] = [
    {
        number: "1",
        title: "Lên kế hoạch & Quản lý",
        desc: "Khởi tạo Workspace, định nghĩa cấu trúc nhóm (OBS) và trực quan hóa phân công công việc qua bảng Kanban linh hoạt.",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
    },
    {
        number: "2",
        title: "Cộng tác & Tài liệu",
        desc: "Thảo luận thời gian thực trên từng Task. Tải lên và phiên bản hóa các tài liệu thiết kế (SRS, PRD) tập trung một chỗ.",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
    },
    {
        number: "3",
        title: "Triển khai & Giám sát",
        desc: "Kết nối an toàn với máy chủ Docker. Cung cấp cái nhìn trực tiếp về trạng thái Container và luồng logs từ Nginx.",
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
    }
];

export const targetAudiences: TargetAudience[] = [
    {
        role: "Sinh viên CNTT",
        headline: "Đưa đồ án của bạn về chung một chuẩn chuyên nghiệp.",
        pain: "Sử dụng quá nhiều công cụ rời rạc gây tốn kém. Trôi tin nhắn báo cáo đồ án trên Zalo/Messenger.",
        solution: "Một Workspace duy nhất: Lên task, viết Docs và nộp file báo cáo. Mọi thứ được lưu trữ trọn đời.",
        tags: ["Kanban Board", "Tài liệu tập trung", "Chuẩn Agile"],
        icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14v7"></path></svg>
    },
    {
        role: "DevOps Engineer",
        headline: "Giám sát hệ thống mà không cần chia sẻ quyền SSH.",
        pain: "Cấp quyền truy cập server cho toàn bộ thành viên team tiềm ẩn rủi ro bảo mật và sai sót cấu hình cực lớn.",
        solution: "Truy cập thông số Docker và Nginx log trực tiếp qua Web Dashboard an toàn, phân cấp quyền hạn rõ ràng.",
        tags: ["Docker API", "Nginx Streaming", "Bảo mật Server"],
        icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
    },
    {
        role: "Dự án Freelance",
        headline: "Minh bạch hóa luồng công việc và tài chính dự án.",
        pain: "Gặp khó khăn khi cập nhật tiến độ cho khách hàng. Quản lý quỹ chung để nâng cấp server phức tạp.",
        solution: "Hệ thống tự động xuất báo cáo tiến độ. Nâng cấp gói tài nguyên dễ dàng qua thanh toán MoMo minh bạch 24/7.",
        tags: ["Báo cáo tiến độ", "Thanh toán MoMo", "Webhook 24/7"],
        icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
    }
];