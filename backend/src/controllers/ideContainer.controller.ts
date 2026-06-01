import { Request, Response } from 'express';
import { exec } from 'child_process';
import util from 'util';
import { AppError } from '../utils/appError';
import httpProxy from 'http-proxy';

const execPromise = util.promisify(exec);

// Lưu trữ danh sách các LSP containers đang chạy: Map<workspaceId_language, { port: number, containerId: string }>
const activeLspContainers = new Map<string, { port: number, containerId: string, lastActive: number }>();

export const ideContainerController = {
    /**
     * @route POST /api/v1/lsp/start
     * @desc Khởi chạy hoặc lấy thông tin kết nối Docker Container cho Language Server
     */
    startLspContainer: async (req: Request, res: Response) => {
        try {
            const { workspaceId, language } = req.body;
            
            if (!workspaceId || !language) {
                throw new AppError(400, 'Thiếu workspaceId hoặc language');
            }

            const containerKey = `${workspaceId}_${language}`;
            
            // Nếu đã có container đang chạy cho workspace và ngôn ngữ này
            if (activeLspContainers.has(containerKey)) {
                const info = activeLspContainers.get(containerKey)!;
                info.lastActive = Date.now();
                return res.status(200).json({ status: 'success', data: { port: info.port } });
            }

            // Chọn Docker image và command tuỳ theo ngôn ngữ
            // Lưu ý: Các image này cần được build sẵn trên server. 
            // Ở đây chúng ta giả lập sử dụng image 'devspacez-lsp-base'
            let imageName = 'devspacez-lsp-base';
            let lspCommand = '';

            switch (language) {
                case 'python':
                    // pylsp qua websocket (cần wrap bằng websockets trên python)
                    imageName = 'devspacez/python-lsp';
                    break;
                case 'java':
                    imageName = 'devspacez/java-lsp';
                    break;
                case 'typescript':
                case 'javascript':
                    imageName = 'devspacez/ts-lsp';
                    break;
                default:
                    throw new AppError(400, `Ngôn ngữ ${language} chưa được hỗ trợ LSP qua Docker`);
            }

            // Sinh port ngẫu nhiên từ 30000 - 40000
            const hostPort = Math.floor(Math.random() * 10000) + 30000;
            const containerName = `lsp_${containerKey}`;

            // Xoá container cũ nếu kẹt
            try { await execPromise(`docker rm -f ${containerName}`); } catch (e) {}

            console.log(`🚀 Starting LSP Container for ${language} on port ${hostPort}...`);
            
            // Chạy Docker container (giả lập hoặc thực tế tuỳ môi trường)
            // Lệnh thực tế: docker run -d --name ${containerName} -p ${hostPort}:8080 ${imageName}
            // Do môi trường dev hiện tại chưa có các image này, ta sẽ in log và mock response 
            // để Frontend có thể kết nối thử nghiệm.
            
            // TODO: Uncomment the below line when Docker images are ready
            // const { stdout: containerId } = await execPromise(`docker run -d --name ${containerName} -p ${hostPort}:8080 ${imageName}`);
            
            const fakeContainerId = Math.random().toString(36).substring(2, 10);
            
            activeLspContainers.set(containerKey, {
                port: hostPort,
                containerId: fakeContainerId,
                lastActive: Date.now()
            });

            res.status(200).json({ status: 'success', data: { port: hostPort, mock: true } });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    }
};

// Cleanup worker: tự động tắt các LSP container không hoạt động quá 30 phút
setInterval(async () => {
    const now = Date.now();
    for (const [key, info] of activeLspContainers.entries()) {
        if (now - info.lastActive > 30 * 60 * 1000) { // 30 phút
            console.log(`🧹 Tự động tắt LSP container ${key} do không hoạt động...`);
            try {
                await execPromise(`docker rm -f lsp_${key}`);
            } catch (e) {
                console.error("Lỗi khi tắt container:", e);
            }
            activeLspContainers.delete(key);
        }
    }
}, 5 * 60 * 1000); // Check mỗi 5 phút
