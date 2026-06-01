import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, List, ListOrdered,
    Quote, Undo, Redo, Languages, Loader2
} from 'lucide-react';
import { documentApi } from '../api/document.api';
import toast from 'react-hot-toast';

interface EditorToolbarProps {
    editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [isTranslating, setIsTranslating] = React.useState(false);

    if (!editor) return null;

    const toggleButtonClass = (isActive: boolean) =>
        `p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10'}`;

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-white dark:bg-[#151A26] border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 rounded-t-xl">
            {/* History */}
            <div className="flex items-center gap-1 pr-2 border-r border-slate-200 dark:border-white/10">
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                    className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/10 rounded-lg"
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                    className="p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-white/10 rounded-lg"
                    title="Làm lại (Ctrl+Y)"
                >
                    <Redo size={16} />
                </button>
            </div>

            {/* Typography */}
            <div className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-white/10">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={toggleButtonClass(editor.isActive('heading', { level: 1 }))}
                    title="Tiêu đề 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={toggleButtonClass(editor.isActive('heading', { level: 2 }))}
                    title="Tiêu đề 2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={toggleButtonClass(editor.isActive('heading', { level: 3 }))}
                    title="Tiêu đề 3"
                >
                    <Heading3 size={18} />
                </button>
            </div>

            {/* Formatting */}
            <div className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-white/10">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={toggleButtonClass(editor.isActive('bold'))}
                    title="In đậm (Ctrl+B)"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={toggleButtonClass(editor.isActive('italic'))}
                    title="In nghiêng (Ctrl+I)"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={toggleButtonClass(editor.isActive('underline'))}
                    title="Gạch chân (Ctrl+U)"
                >
                    <UnderlineIcon size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={toggleButtonClass(editor.isActive('strike'))}
                    title="Gạch ngang"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-white/10">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={toggleButtonClass(editor.isActive({ textAlign: 'left' }))}
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={toggleButtonClass(editor.isActive({ textAlign: 'center' }))}
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={toggleButtonClass(editor.isActive({ textAlign: 'right' }))}
                >
                    <AlignRight size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={toggleButtonClass(editor.isActive({ textAlign: 'justify' }))}
                >
                    <AlignJustify size={16} />
                </button>
            </div>

            {/* Lists & Quote */}
            <div className="flex items-center gap-1 pl-2">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={toggleButtonClass(editor.isActive('bulletList'))}
                >
                    <List size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={toggleButtonClass(editor.isActive('orderedList'))}
                >
                    <ListOrdered size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={toggleButtonClass(editor.isActive('blockquote'))}
                >
                    <Quote size={16} />
                </button>
            </div>
            
            {/* Translate */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-white/10">
                {isTranslating ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Loader2 size={16} className="animate-spin" /> Đang dịch...
                    </div>
                ) : (
                    <>
                        <button
                            onClick={async () => {
                                try {
                                    setIsTranslating(true);
                                    const html = editor.getHTML();
                                    const res = await documentApi.translateContent(html, 'en');
                                    editor.commands.setContent(res.data, true);
                                    toast.success('Đã dịch sang Tiếng Anh');
                                } catch (e) {
                                    toast.error('Lỗi dịch thuật');
                                } finally {
                                    setIsTranslating(false);
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="Dịch toàn bộ trang sang Tiếng Anh"
                        >
                            <Languages size={16} /> 🇬🇧 EN
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    setIsTranslating(true);
                                    const html = editor.getHTML();
                                    const res = await documentApi.translateContent(html, 'vi');
                                    editor.commands.setContent(res.data, true);
                                    toast.success('Đã dịch sang Tiếng Việt');
                                } catch (e) {
                                    toast.error('Lỗi dịch thuật');
                                } finally {
                                    setIsTranslating(false);
                                }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Dịch toàn bộ trang sang Tiếng Việt"
                        >
                            <Languages size={16} /> 🇻🇳 VI
                        </button>
                    </>
                )}
            </div>
            
            {/* Color Picker could go here but let's keep it clean for now */}
        </div>
    );
};
