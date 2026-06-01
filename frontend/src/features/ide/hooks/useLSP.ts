import { useEffect, useRef, useState } from 'react';
import { MonacoLanguageClient } from 'monaco-languageclient';
import { CloseAction, ErrorAction } from 'vscode-languageclient/browser.js';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';
import axiosClient from '@/shared/api/axiosClient';

interface UseLSPProps {
    language: string;
    workspaceId: string | null;
    enabled: boolean;
}

export const useLSP = ({ language, workspaceId, enabled }: UseLSPProps) => {
    const [isLspReady, setIsLspReady] = useState(false);
    const webSocketRef = useRef<WebSocket | null>(null);
    const languageClientRef = useRef<MonacoLanguageClient | null>(null);

    useEffect(() => {
        const isLspEnabled = import.meta.env.VITE_LSP_ENABLED !== '0';
        
        if (!isLspEnabled || !enabled || !workspaceId || !['python', 'java', 'typescript', 'javascript'].includes(language)) {
            return;
        }

        let isMounted = true;

        const startLSP = async () => {
            try {
                // 1. Gọi API Backend khởi động Docker Container cho LSP
                const res = await axiosClient.post('/lsp/start', { workspaceId, language });
                const { port, mock } = res.data.data;

                if (mock) {
                    console.warn(`[LSP] Backend trả về mock port ${port}. Tính năng LSP tạm thời chưa có thật do thiếu Docker image.`);
                    return; // Ngừng ở đây nếu là mock
                }

                // 2. Kết nối WebSocket tới proxy của backend
                // Giả định backend proxy ở cổng 5001 
                // Cần dùng ws:// hoặc wss:// tuỳ môi trường
                const wsUrl = `ws://localhost:5001/lsp/${port}`;
                const webSocket = new WebSocket(wsUrl);
                webSocketRef.current = webSocket;

                webSocket.onopen = () => {
                    if (!isMounted) return;
                    console.log(`[LSP] Đã kết nối WebSocket tới ${wsUrl}`);
                    
                    const socket = toSocket(webSocket);
                    const reader = new WebSocketMessageReader(socket);
                    const writer = new WebSocketMessageWriter(socket);

                    const languageClient = new MonacoLanguageClient({
                        name: `${language} Language Client`,
                        clientOptions: {
                            documentSelector: [language],
                            errorHandler: {
                                error: () => ({ action: ErrorAction.Continue }),
                                closed: () => ({ action: CloseAction.DoNotRestart })
                            }
                        },
                        messageTransports: {
                            reader,
                            writer
                        }
                    });

                    languageClient.start();
                    languageClientRef.current = languageClient;
                    setIsLspReady(true);
                };

            } catch (error) {
                console.error("[LSP] Lỗi khởi động LSP:", error);
            }
        };

        startLSP();

        return () => {
            isMounted = false;
            if (languageClientRef.current) {
                languageClientRef.current.dispose();
                languageClientRef.current = null;
            }
            if (webSocketRef.current) {
                webSocketRef.current.close();
                webSocketRef.current = null;
            }
            setIsLspReady(false);
        };
    }, [language, workspaceId, enabled]);

    return { isLspReady };
};
