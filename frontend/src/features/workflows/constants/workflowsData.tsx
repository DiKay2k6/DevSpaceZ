import React from 'react';

export interface KanbanTask {
    id: string;
    title: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    user: string;
    desc: string;
}

export interface KanbanColumn {
    title: string;
    count: number;
    tasks: KanbanTask[];
}

export interface LifecycleStep {
    step: string;
    title: string;
    desc: string;
    icon: React.ReactNode;
}

export interface FeatureDeepDive {
    title: string;
    desc: string;
    example: React.ReactNode;
    colorTheme: 'blue' | 'emerald' | 'purple';
    icon: React.ReactNode;
}

export const kanbanData: KanbanColumn[] = [
    {
        title: "To Do", count: 3,
        tasks: [
            { id: "DEV-101", title: "Thiết kế UI Dashboard", priority: "High", user: "Gia Khang", desc: "Sử dụng Tailwind v4 và Glassmorphism" },
            { id: "DEV-102", title: "Viết SRS bản 3.0", priority: "Medium", user: "Minh Huy", desc: "Cập nhật Use Case thanh toán MoMo" }
        ]
    },
    {
        title: "In Progress", count: 1,
        tasks: [
            { id: "DEV-103", title: "Cấu hình Nginx Proxy", priority: "Critical", user: "Duy Khang", desc: "Trỏ domain devspace.vlu.edu.vn về port 3000" }
        ]
    },
    {
        title: "Done", count: 12,
        tasks: [
            { id: "DEV-99", title: "Setup MongoDB Schema", priority: "Low", user: "Nam Giang", desc: "Tạo schema cho User, Task, Workspace" }
        ]
    }
];

export const lifecycleSteps: LifecycleStep[] = [
    { step: "1", title: "Khởi tạo (Planning)", desc: "Trưởng nhóm tạo Task 'API Đăng nhập', gắn mác 'High Priority' và gán cho Backend Dev.", icon: "📝" },
    { step: "2", title: "Cung cấp tài liệu", desc: "BA đính kèm file đặc tả 'SRS_Auth.pdf' thẳng vào Task để Dev đọc mà không cần tìm link Drive.", icon: "📎" },
    { step: "3", title: "Thực thi (Doing)", desc: "Dev kéo Task sang cột 'In Progress'. Cả team lập tức thấy trạng thái cập nhật theo thời gian thực.", icon: "⚙️" },
    { step: "4", title: "Review & Hoàn tất", desc: "Dev gắn link Pull Request, tag @TruongNhom vào review. Code ok -> Kéo sang cột 'Done'.", icon: "✅" }
];

export const featureDeepDives: FeatureDeepDive[] = [
    {
        title: "Mô tả bằng Markdown",
        desc: "Hỗ trợ chuẩn Markdown chuyên sâu cho dân IT. Cho phép chèn Code Snippet (`const a = 1;`), định dạng bảng biểu và list công việc (Checklist).",
        example: <>Ví dụ: Thay vì viết text thường, bạn có thể định dạng nhanh: <br /> **Bug Fix:** API trả về 502.</>,
        colorTheme: "blue",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.528z"></path></svg>
    },
    {
        title: "Đính kèm Tài liệu chuẩn",
        desc: "Lưu trữ tập trung mọi hình ảnh UI, file Word (SRS, PRD). Dữ liệu được đẩy lên Cloud Storage đảm bảo không bao giờ bị mất mác.",
        example: "Ví dụ: Gửi thẳng file \"Đặc tả Yêu cầu.docx\" vào Task \"Phân tích DB\" để người làm mở ra xem tức thì.",
        colorTheme: "emerald",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    },
    {
        title: "Trao đổi & Theo dõi (Real-time)",
        desc: "Bình luận, @Mention người dùng khác trực tiếp dưới mỗi thẻ công việc. Mọi thay đổi về trạng thái Task đều được đẩy thông báo ngay lập tức.",
        example: "Ví dụ: Bạn gõ \"@GiaKhang fix gấp UI nút Đăng nhập nhé\". Khang sẽ lập tức nhận được thông báo Ping trên màn hình.",
        colorTheme: "purple",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
    }
];