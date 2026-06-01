import React from 'react';

export interface TeamMember {
    name: string;
    role: string;
    color: string;
}

export interface ContactChannel {
    title: string;
    desc: string;
    icon: React.ReactNode;
    colorClass: string;
    link: string;
}

export const teamMembers: TeamMember[] = [
    { name: "Duy Khang", role: "Project Manager / DevOps", color: "bg-blue-500" },
    { name: "Nam Giang", role: "Backend Architect", color: "bg-emerald-500" },
    { name: "Minh Huy", role: "Business Analyst (BA)", color: "bg-purple-500" },
    { name: "Gia Khang", role: "UI/UX / Frontend", color: "bg-orange-500" }
];

export const contactChannels: ContactChannel[] = [
    {
        title: "Cộng đồng Discord",
        desc: "Phản hồi trong 5 phút",
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.1 18.058a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" />
            </svg>
        ),
        colorClass: "bg-indigo-500/10 text-indigo-500",
        link: "#"
    },
    {
        title: "Gửi Email trực tiếp",
        desc: "support@devspace.vlu.edu.vn",
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        ),
        colorClass: "bg-blue-500/10 text-blue-500",
        link: "mailto:support@devspace.vlu.edu.vn"
    }
];

export const supportTopics: string[] = [
    "Lỗi tài khoản / Phân quyền Workspace",
    "Lỗi kết nối Docker / Mất Nginx Logs",
    "Sự cố nạp MoMo / Nâng cấp gói Pro",
    "Góp ý tính năng / Báo cáo Bug khác"
];