import { useState, useEffect } from 'react';
import { initialLogs, SystemLog } from '../constants/monitorData';

export const useLiveLogs = () => {
    const [logs, setLogs] = useState<SystemLog[]>(initialLogs);

    useEffect(() => {
        const interval = setInterval(() => {
            const newLogs: SystemLog[] = [
                { time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: "info", message: "[Nginx] 192.168.1.12 - GET /ws/socket.io 101 Switching Protocols" },
                { time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: "error", message: "[Backend] Warn: High memory usage detected in worker #2" },
                { time: new Date().toLocaleTimeString('vi-VN', { hour12: false }), type: "info", message: "[Nginx] 192.168.1.8 - GET /api/v1/users/me 200 OK" }
            ];
            const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];

            setLogs(prev => {
                const updated = [...prev, randomLog];
                return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return logs;
};