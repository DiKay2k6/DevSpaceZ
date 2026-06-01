import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebContainer } from '@webcontainer/api';
import '@xterm/xterm/css/xterm.css';

interface UseTerminalSessionProps {
    wc: WebContainer | null;
    projectLoaded: boolean;
    terminalRef: React.RefObject<HTMLDivElement>;
    theme: 'light' | 'dark';
}

export const useTerminalSession = ({ wc, projectLoaded, terminalRef, theme }: UseTerminalSessionProps) => {
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (!terminalRef.current || !projectLoaded || !wc) return;

        if (xtermRef.current) {
            xtermRef.current.dispose();
            xtermRef.current = null;
        }

        const terminal = new Terminal({
            cursorBlink: true,
            theme: {
                background: theme === 'dark' ? '#1e1e1e' : '#f8fafc',
                foreground: theme === 'dark' ? '#f8fafc' : '#1e1e1e',
                cursor: theme === 'dark' ? '#f8fafc' : '#1e1e1e',
            },
            fontFamily: '"Fira Code", monospace',
            fontSize: 13,
            lineHeight: 1.2,
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        terminal.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        let shellProcess: any = null;

        const startShell = async () => {
            terminal.writeln('Welcome to DevSpaceZ Cloud Terminal.');
            terminal.writeln('Khởi tạo môi trường WebContainer...\r\n');

            try {
                shellProcess = await wc.spawn('jsh', {
                    terminal: {
                        cols: terminal.cols,
                        rows: terminal.rows,
                    },
                });

                shellProcess.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            terminal.write(data);
                        },
                    })
                );

                const input = shellProcess.input.getWriter();
                terminal.onData((data) => {
                    input.write(data);
                });
            } catch (error) {
                terminal.writeln('\r\n\x1b[31m[LỖI] Không thể khởi tạo shell process\x1b[0m');
                console.error(error);
            }
        };

        startShell();

        const handleResize = () => {
            if (fitAddonRef.current && xtermRef.current && shellProcess) {
                fitAddonRef.current.fit();
                try {
                    shellProcess.resize({
                        cols: xtermRef.current.cols,
                        rows: xtermRef.current.rows,
                    });
                } catch (e) {
                    console.error("Lỗi resize jsh:", e);
                }
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (shellProcess) {
                try { shellProcess.kill(); } catch (e) {}
            }
            if (xtermRef.current) {
                xtermRef.current.dispose();
                xtermRef.current = null;
            }
        };
    }, [wc, projectLoaded, terminalRef, theme]);

    return { xtermRef, fitAddonRef };
};
