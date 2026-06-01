import { Server as WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';

export const initYjsSocket = (server: any) => {
    const wss = new WebSocketServer({ noServer: true });

    wss.on('connection', setupWSConnection);

    server.on('upgrade', (request: any, socket: any, head: any) => {
        if (request.url && request.url.startsWith('/yjs')) {
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit('connection', ws, request);
            });
        }
    });

    console.log('✅ Yjs WebSocket server is ready on /yjs');
};
