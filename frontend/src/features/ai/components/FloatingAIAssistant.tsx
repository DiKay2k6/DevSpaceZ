import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { aiApi } from '../api/ai.api';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const FloatingAIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (messages.length === 0) {
                setMessages([
                    {
                        role: 'assistant',
                        content: 'Xin chào! Tôi là **DevSpaceZ Copilot**. Tôi có thể giúp gì cho bạn hôm nay? (Giải thích code, lên kế hoạch dự án, v.v...)'
                    }
                ]);
            }
        }
    }, [isOpen, messages.length]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await aiApi.chat(userMsg);
            const reply = res.data.data.reply;
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Xin lỗi, đã có lỗi xảy ra khi kết nối với máy chủ AI. Vui lòng thử lại sau.' }]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-[#111520] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between px-4 text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot size={22} />
                            <div>
                                <h3 className="font-bold text-sm">DevSpaceZ Copilot</h3>
                                <p className="text-[10px] text-blue-100 opacity-90 flex items-center gap-1">
                                    <Sparkles size={10} /> Trợ lý AI thông minh
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0B0F19] custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-sm' 
                                    : 'bg-white dark:bg-[#1a2133] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-bl-sm markdown-body'
                                }`}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown 
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                                                code: ({node, inline, ...props}: any) => 
                                                    inline 
                                                    ? <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-xs text-pink-500" {...props} />
                                                    : <pre className="bg-slate-800 text-slate-100 p-2 rounded-lg text-xs overflow-x-auto my-2"><code {...props} /></pre>
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1a2133] border border-slate-200 dark:border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                    <span className="text-xs text-slate-500">AI đang suy nghĩ...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-[#111520] border-t border-slate-200 dark:border-white/10 shrink-0">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Hỏi tôi bất cứ điều gì..."
                                disabled={isLoading}
                                className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-blue-500/30 rounded-xl pl-4 pr-12 py-3 text-sm outline-none text-slate-800 dark:text-white transition-all disabled:opacity-50"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${
                    isOpen ? 'bg-slate-700 dark:bg-slate-600' : 'bg-gradient-to-tr from-blue-600 to-purple-600 hover:shadow-blue-500/30'
                }`}
            >
                {isOpen ? <X size={26} /> : <Sparkles size={26} />}
            </button>
        </div>
    );
};
