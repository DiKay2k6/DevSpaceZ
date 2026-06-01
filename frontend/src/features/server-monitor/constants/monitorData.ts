export interface SystemStat {
    label: string;
    value: string;
    icon: string;
    status: 'normal' | 'high' | 'critical';
}

export interface DockerContainer {
    id: string;
    name: string;
    image: string;
    status: 'Running' | 'Exited' | 'Stopped';
    port: string;
    cpu: string;
    mem: string;
}

export interface SystemLog {
    time: string;
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
}

export const systemStats: SystemStat[] = [
    { label: "CPU Usage", value: "14.2%", icon: "⚡", status: "normal" },
    { label: "Memory (RAM)", value: "2.8 / 8 GB", icon: "🧠", status: "normal" },
    { label: "Network I/O", value: "45 MB/s", icon: "🌐", status: "high" },
    { label: "Uptime", value: "12d 4h", icon: "⏱️", status: "normal" }
];

export const containers: DockerContainer[] = [
    { id: "c-1a2b", name: "devspace-frontend", image: "react-vite:latest", status: "Running", port: "3000", cpu: "1.2%", mem: "120MB" },
    { id: "c-3c4d", name: "devspace-backend", image: "node-express:v2", status: "Running", port: "5000", cpu: "4.5%", mem: "256MB" },
    { id: "c-5e6f", name: "devspace-mongo", image: "mongo:6.0", status: "Running", port: "27017", cpu: "2.1%", mem: "512MB" },
    { id: "c-7g8h", name: "devspace-redis", image: "redis:alpine", status: "Running", port: "6379", cpu: "0.5%", mem: "32MB" },
    { id: "c-9i0j", name: "devspace-nginx", image: "nginx:latest", status: "Exited", port: "80, 443", cpu: "0%", mem: "0MB" }
];

export const initialLogs: SystemLog[] = [
    { time: "15:20:01", type: "info", message: "[Nginx] Starting server on port 80..." },
    { time: "15:20:05", type: "success", message: "[Backend] Connected to MongoDB successfully." },
    { time: "15:21:12", type: "info", message: "[Nginx] 192.168.1.5 - GET /api/v1/workspaces 200 OK" },
    { time: "15:22:45", type: "info", message: "[Nginx] 192.168.1.10 - POST /api/v1/tasks 201 Created" },
];