export interface ArchitectureTier {
    step: string;
    title: string;
    tech: string;
    desc: string;
}

export const architectureTiers: ArchitectureTier[] = [
    {
        step: "01",
        title: "Client Application",
        tech: "React SPA & Tailwind v4",
        desc: "Giao diện người dùng tương tác cao, thiết kế Dark Mode/Glassmorphism hiện đại."
    },
    {
        step: "02",
        title: "Reverse Proxy & Load Balancer",
        tech: "Nginx API Gateway",
        desc: "Cửa ngõ nhận request, xử lý chứng chỉ SSL/TLS và điều hướng traffic."
    },
    {
        step: "03",
        title: "Backend Services",
        tech: "Node.js (Express)",
        desc: "Xử lý logic nghiệp vụ, quản lý Workspace, Task, Webhook thanh toán."
    },
    {
        step: "04",
        title: "Data Layer",
        tech: "MongoDB & Redis",
        desc: "MongoDB lưu trữ dữ liệu phi cấu trúc. Redis caching phiên và dữ liệu realtime."
    },
    {
        step: "05",
        title: "Infrastructure Layer",
        tech: "Docker Engine API",
        desc: "Giao tiếp với Unix Socket của Docker để trích xuất dữ liệu container chân thực."
    }
];