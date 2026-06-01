import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useAuthStore } from '@/entities/user/model/authStore';
import { EditorToolbar } from './EditorToolbar';

interface EditorProps {
    docId: string;
    initialTitle: string;
    initialContent?: string;
    onTitleChange: (title: string) => void;
    viewMode?: 'edit' | 'preview';
    headerActions?: React.ReactNode;
}

const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D'];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

export const CollaborativeEditor: React.FC<EditorProps> = ({ docId, initialTitle, initialContent, onTitleChange, viewMode = 'edit', headerActions }) => {
    const { user } = useAuthStore();
    const [status, setStatus] = useState('connecting');
    const [isSynced, setIsSynced] = useState(false);
    const hasSeededRef = React.useRef(false);

    // Setup Yjs doc and provider
    const { ydoc, provider } = useMemo(() => {
        const ydoc = new Y.Doc();
        // Cấu hình WebSocket URL (Chạy chung port với API server hoặc khác nếu setup rời)
        const wsUrl = import.meta.env.VITE_WS_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/yjs';
        
        const provider = new WebsocketProvider(wsUrl, docId, ydoc, {
            connect: false // Tự connect sau
        });

        return { ydoc, provider };
    }, [docId]);

    useEffect(() => {
        provider.on('status', (event: any) => {
            setStatus(event.status);
        });
        
        provider.on('sync', (synced: boolean) => {
            setIsSynced(synced);
        });

        provider.connect();

        return () => {
            provider.disconnect();
            ydoc.destroy();
        };
    }, [provider, ydoc]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false, // History do Yjs quản lý
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            TextStyle,
            Color,
            Image,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 dark:border-slate-600 px-4 py-2 font-bold bg-slate-100 dark:bg-slate-800',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-slate-300 dark:border-slate-600 px-4 py-2',
                },
            }),
            Collaboration.configure({
                document: ydoc,
            }),
            CollaborationCursor.configure({
                provider: provider,
                user: {
                    name: user?.full_name || 'Anonymous',
                    color: getRandomColor(),
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none dark:prose-invert max-w-none w-full h-full min-h-[500px] p-4',
            },
        }
    });

    // Bơm nội dung từ Database vào Editor nếu Server Yjs đang trống
    useEffect(() => {
        if (editor && status === 'connected' && isSynced && initialContent && !hasSeededRef.current) {
            hasSeededRef.current = true; // Mark as seeded immediately to prevent duplicate runs
            
            // Delay slightly to ensure Yjs has completely settled the document state
            setTimeout(() => {
                if (editor.isEmpty || editor.getText().trim() === '') {
                    editor.commands.setContent(initialContent, true);
                }
            }, 100);
        }
    }, [editor, status, isSynced, initialContent]);

    // Yjs không quản lý Title trong Editor mặc định này (có thể làm thêm cấu trúc Map).
    // Tạm thời Title sẽ đồng bộ cơ bản qua API khi Lưu, hoặc bạn có thể dùng Y.Map để sync Title!
    
    // Ở đây ta dùng Y.Map để sync Title realtime
    useEffect(() => {
        const ymap = ydoc.getMap('metadata');
        
        const updateTitle = () => {
            const remoteTitle = ymap.get('title') as string;
            if (remoteTitle !== undefined && remoteTitle !== initialTitle) {
                onTitleChange(remoteTitle);
            }
        };

        ymap.observe(updateTitle);

        return () => {
            ymap.unobserve(updateTitle);
        };
    }, [ydoc, initialTitle, onTitleChange]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(viewMode === 'edit');
        }
    }, [editor, viewMode]);

    const handleTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        onTitleChange(newTitle);
        ydoc.getMap('metadata').set('title', newTitle);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#111520] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <input 
                    type="text"
                    value={initialTitle}
                    onChange={handleTitleInput}
                    className="text-xl md:text-2xl font-bold bg-transparent outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 truncate min-w-0 pr-4"
                    placeholder="Tiêu đề tài liệu..."
                />
                
                <div className="flex items-center gap-2 shrink-0">
                    {headerActions}
                </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto custom-scrollbar relative ${viewMode === 'preview' ? 'bg-slate-200 dark:bg-slate-900 p-8' : 'bg-slate-50/50 dark:bg-[#0B0F19]'}`}>
                {viewMode === 'edit' && editor && <EditorToolbar editor={editor} />}
                
                <div className={`mx-auto bg-white dark:bg-[#111520] transition-all duration-300 ${
                    viewMode === 'preview'
                        ? 'w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl rounded-sm'
                        : 'max-w-4xl min-h-full shadow-sm mt-4 mb-32 border border-slate-200 dark:border-white/5 rounded-xl'
                }`}>
                    <EditorContent editor={editor} className="h-full" />
                </div>
            </div>
        </div>
    );
};
