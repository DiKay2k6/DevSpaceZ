import { Request, Response } from 'express';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export const dockerController = {
    getStats: async (req: Request, res: Response) => {
        try {
            // Kiểm tra docker ps (Lấy danh sách container đang chạy)
            const { stdout: psOut } = await execPromise('docker ps --format "{{json .}}"');
            const containers = psOut.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

            if (containers.length === 0) {
                return res.status(200).json({ status: 'success', data: [] });
            }

            // Kiểm tra docker stats (Lấy thông số RAM/CPU)
            const { stdout: statsOut } = await execPromise('docker stats --no-stream --format "{{json .}}"');
            const stats = statsOut.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));

            // Merge dữ liệu
            const mergedData = containers.map(c => {
                const stat = stats.find(s => s.Container === c.ID || s.Name === c.Names);
                return {
                    id: c.ID,
                    name: c.Names,
                    image: c.Image,
                    status: c.Status,
                    state: c.State,
                    cpu: stat ? stat.CPUPerc : '0.00%',
                    memUsage: stat ? stat.MemUsage : '0B / 0B',
                    memPerc: stat ? stat.MemPerc : '0.00%',
                    netIO: stat ? stat.NetIO : '0B / 0B'
                };
            });

            res.status(200).json({ status: 'success', data: mergedData });
        } catch (error: any) {
            // Nếu không có docker, trả về dữ liệu giả để giao diện không bị sập
            console.error("Docker API Error (Fallback to Mock):", error.message);
            const mockData = [
                { id: '1a2b3c', name: 'devspacez_frontend', image: 'node:18-alpine', status: 'Up 2 hours', state: 'running', cpu: '2.50%', memUsage: '120MiB / 2GiB', memPerc: '5.85%', netIO: '1MB / 500KB' },
                { id: '4d5e6f', name: 'devspacez_backend', image: 'node:18-alpine', status: 'Up 2 hours', state: 'running', cpu: '5.10%', memUsage: '250MiB / 2GiB', memPerc: '12.2%', netIO: '5MB / 2MB' },
                { id: '7g8h9i', name: 'devspacez_mongo', image: 'mongo:6.0', status: 'Up 5 days', state: 'running', cpu: '0.50%', memUsage: '500MiB / 4GiB', memPerc: '12.5%', netIO: '10MB / 10MB' }
            ];
            res.status(200).json({ status: 'success', data: mockData, isMock: true });
        }
    }
};
