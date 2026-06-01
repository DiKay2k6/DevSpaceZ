import { Server as HttpServer } from 'http';
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer({
    ws: true,
    ignorePath: true, // Không nối path cũ vào target
});

// Bắt lỗi proxy tránh làm crash server
proxy.on('error', (err, req, res) => {
    console.error('LSP Proxy Error:', err.message);
    if (res && (res as any).writeHead) {
        (res as any).writeHead(502);
        (res as any).end('LSP Gateway Error');
    }
});

export const initLspSocket = (server: HttpServer) => {
    server.on('upgrade', (req, socket, head) => {
        if (!req.url) return;

        // Route: ws://localhost:5000/lsp/:port
        // Proxy trực tiếp traffic sang cổng của Docker Container đang chạy
        if (req.url.startsWith('/lsp/')) {
            const parts = req.url.split('/');
            const targetPort = parts[2]; // Lấy port từ url

            if (!targetPort || isNaN(Number(targetPort))) {
                socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
                socket.destroy();
                return;
            }

            const targetUrl = `ws://127.0.0.1:${targetPort}`;
            
            console.log(`🔌 Bắt đầu Proxy LSP WebSocket từ ${req.url} -> ${targetUrl}`);
            
            // Forward upgrade event
            proxy.ws(req, socket, head, {
                target: targetUrl
            });
        }
    });
};
