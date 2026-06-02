import { LayoutDashboard, Kanban, Server, FileText, Settings, Users, Activity, UserCircle, Code2, MessageSquare, LucideIcon } from 'lucide-react';

export interface NavItemType {
    id: string;
    icon: LucideIcon;
    label: string;
    path: string;
}

// Bổ sung thêm Team và Analytics để Sidebar trông "Pro" và đầy đủ hệ sinh thái hơn
export const mainNavItems: NavItemType[] = [
    { id: 'overview', icon: LayoutDashboard, label: "Tổng quan", path: "/dashboard" },
    { id: 'chat', icon: MessageSquare, label: "Tin nhắn", path: "/dashboard/chat" },
    { id: 'monitor', icon: Server, label: "Docker Monitor", path: "/dashboard/monitor" },
    { id: 'team', icon: Users, label: "Team", path: "/dashboard/team" },
    { id: 'docs', icon: FileText, label: "Document", path: "/dashboard/docs" },
    { id: 'ide', icon: Code2, label: "Cloud IDE", path: "/ide" },
    { id: 'analytics', icon: Activity, label: "Thống kê", path: "/dashboard/analytics" }
];

export const bottomNavItems: NavItemType[] = [
    { id: 'settings', icon: Settings, label: "Cài đặt", path: "/dashboard/settings" }
];