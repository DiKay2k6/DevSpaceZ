import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { WebContainer } from '@webcontainer/api';

interface TerminalComponentProps {
    webcontainerInstance: WebContainer | null;
    theme?: string;
    welcomeMessage?: string;
}

export const TerminalComponent: React.FC<TerminalComponentProps> = ({ webcontainerInstance, theme = 'dark', welcomeMessage }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Khởi tạo xterm.js
        const term = new Terminal({
            theme: {
                background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                foreground: theme === 'dark' ? '#d4d4d4' : '#333333',
                cursor: theme === 'dark' ? '#ffffff' : '#000000',
                selectionBackground: theme === 'dark' ? '#ffffff40' : '#00000040',
            },
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: 13,
            cursorBlink: true,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        const resizeObserver = new ResizeObserver(() => {
            fitAddon.fit();
        });
        resizeObserver.observe(terminalRef.current);

        term.writeln('Welcome to DevSpaceZ Cloud Terminal.');
        term.writeln('Khởi tạo môi trường WebContainer...');

        return () => {
            resizeObserver.disconnect();
            term.dispose();
        };
    }, []); // Chỉ chạy 1 lần lúc mount để DOM ref

    // Cập nhật Theme động khi props theme thay đổi
    useEffect(() => {
        if (xtermRef.current) {
            xtermRef.current.options.theme = {
                background: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                foreground: theme === 'dark' ? '#d4d4d4' : '#333333',
                cursor: theme === 'dark' ? '#ffffff' : '#000000',
                selectionBackground: theme === 'dark' ? '#ffffff40' : '#00000040',
            };
        }
    }, [theme]);

    useEffect(() => {
        if (!webcontainerInstance || !xtermRef.current) return;

        let shellProcess: any;
        const term = xtermRef.current;

        const startShell = async () => {
            // Spawn a jsh process (Terminal của WebContainer)
            shellProcess = await webcontainerInstance.spawn('jsh', {
                terminal: {
                    cols: term.cols,
                    rows: term.rows,
                },
            });

            // Ghi dữ liệu từ jsh ra xterm
            shellProcess.output.pipeTo(new WritableStream({
                write(data) {
                    term.write(data);
                }
            }));

            // Đưa phím gõ từ xterm vào jsh
            const input = shellProcess.input.getWriter();
            const dataDisposable = term.onData((data) => {
                input.write(data);
            });
            
            // Xử lý khi Terminal bị resize (vd: người dùng kéo cửa sổ)
            const resizeDisposable = term.onResize((size) => {
                shellProcess.resize({
                    cols: size.cols,
                    rows: size.rows
                });
            });
            
            if (welcomeMessage) {
                setTimeout(() => {
                    term.writeln(`\x1b[1;33m${welcomeMessage}\x1b[0m`);
                }, 1000);
            }

            // Lưu disposable để cleanup
            (shellProcess as any)._disposables = [dataDisposable, resizeDisposable];
        };

        startShell();

        return () => {
            if (shellProcess) {
                if (shellProcess._disposables) {
                    shellProcess._disposables.forEach((d: any) => d.dispose());
                }
                shellProcess.kill();
            }
        };
    }, [webcontainerInstance]);

    return (
        <div ref={terminalRef} className={`w-full h-full p-2 overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}`} />
    );
};
