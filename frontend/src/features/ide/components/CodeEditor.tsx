import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { useLSP } from '../hooks/useLSP';

interface CodeEditorProps {
    path?: string; // Add path prop for Monaco Model linking
    language?: string;
    theme?: 'vs-dark' | 'light';
    initialValue?: string;
    onChange?: (value: string) => void;
    onMarkersChange?: (markers: any[]) => void;
    yText?: Y.Text | null;
    awareness?: any; // awarenessProtocol.Awareness
    workspaceId?: string; // Tích hợp LSP
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
    path,
    language = 'javascript', 
    theme = 'vs-dark',
    initialValue,
    onChange,
    onMarkersChange,
    yText,
    awareness,
    workspaceId
}) => {
    const editorRef = useRef<any>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);

    // Kích hoạt LSP nếu có workspaceId
    useLSP({ language, workspaceId: workspaceId || null, enabled: !!workspaceId });

    // Setup Yjs Monaco Binding
    useEffect(() => {
        if (!editorRef.current || !yText) return;

        // Nếu đã có binding cũ, phải xóa nó đi trước khi gán cái mới
        if (bindingRef.current) {
            bindingRef.current.destroy();
        }

        bindingRef.current = new MonacoBinding(
            yText,
            editorRef.current.getModel(),
            new Set([editorRef.current]),
            awareness
        );

        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, [yText, awareness]);

    React.useEffect(() => {
        const handleFormat = () => {
            if (editorRef.current) {
                editorRef.current.getAction('editor.action.formatDocument').run();
            }
        };
        window.addEventListener('monaco-format', handleFormat);
        return () => window.removeEventListener('monaco-format', handleFormat);
    }, []);

    const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;
        
        // Kích hoạt binding thủ công nếu yText đã có sẵn lúc mount
        if (yText) {
            const model = editor.getModel();
            if (model) {
                bindingRef.current = new MonacoBinding(
                    yText,
                    model,
                    new Set([editor]),
                    awareness
                );
            }
        }
    };

    return (
        <div className="w-full h-full relative">
            <Editor
                height="100%"
                language={language}
                theme={theme}
                path={path ? `file:///${path}` : undefined}
                value={initialValue}
                onChange={(value) => {
                    if (onChange && value !== undefined) {
                        onChange(value);
                    }
                }}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    cursorSmoothCaretAnimation: "on",
                    formatOnPaste: true,
                }}
            />
        </div>
    );
};
