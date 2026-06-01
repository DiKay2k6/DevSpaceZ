export interface DocMenuItem {
    id: string;
    label: string;
    icon: string;
}

export type DocSectionId = 'intro' | 'getting-started' | 'kanban' | 'monitor' | 'billing';

export const menuItems: DocMenuItem[] = [
    { id: 'intro', label: 'Giới thiệu chung', icon: '🚀' },
    { id: 'getting-started', label: 'Bắt đầu nhanh', icon: '🏁' },
    { id: 'kanban', label: 'Quản lý Agile/Kanban', icon: '📋' },
    { id: 'monitor', label: 'Giám sát hạ tầng (Docker)', icon: '🖥️' },
    { id: 'billing', label: 'Thanh toán & MoMo API', icon: '💳' },
];