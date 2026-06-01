/**
 * Utility to generate WebSocket URLs based on the current environment.
 * Ensures that WebSockets connect directly to the Render Backend on Production,
 * avoiding Vercel's serverless proxy which drops long-running connections.
 */
export const getWebSocketUrl = (path: string = '/yjs', port: string | null = null): string => {
    // Nếu có biến môi trường VITE_WEBSOCKET_URL (ví dụ khi host tự do), ưu tiên dùng nó
    if (import.meta.env.VITE_WEBSOCKET_URL) {
        return import.meta.env.VITE_WEBSOCKET_URL + (path === '/yjs' ? '' : path);
    }

    // Nếu có VITE_API_URL, lấy hostname từ đó và đổi protocol thành ws/wss
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl.startsWith('http')) {
        try {
            const url = new URL(apiUrl);
            const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            // Nếu có port truyền vào (như LSP), dùng port đó. Nếu không, giữ nguyên host
            const host = port ? `${url.hostname}:${port}` : url.host;
            return `${protocol}//${host}${path}`;
        } catch (e) {
            console.error('Invalid VITE_API_URL format:', e);
        }
    }

    // Fallback: Chạy Localhost hoặc dùng cùng host với Frontend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Nếu là Localhost và không có API_URL, fallback mặc định là cổng 5001 của Backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const localPort = port ? port : '5001';
        return `${protocol}//localhost:${localPort}${path}`;
    }

    // Fallback cuối cùng
    const host = port ? `${window.location.hostname}:${port}` : window.location.host;
    return `${protocol}//${host}${path}`;
};
