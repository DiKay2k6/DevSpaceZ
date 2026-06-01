import React from 'react';
import { menuItems, DocSectionId } from '../constants/docsData';

interface DocsSidebarProps {
    activeSection: DocSectionId;
    setActiveSection: (id: DocSectionId) => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({ activeSection, setActiveSection }) => {
    return (
        <aside className="w-full md:w-64 lg:w-72 md:h-screen md:sticky md:top-0 border-r transition-colors duration-300 z-30 border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0B0F1A]">
            <div className="p-6 md:pt-28 h-full flex flex-col">
                <div className="mb-8">
                    <div className="relative flex items-center p-2 rounded-xl border transition-colors duration-300 bg-white dark:bg-[#151B2B] border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <svg className="w-4 h-4 text-slate-500 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" placeholder="Tìm tài liệu..." className="bg-transparent border-none text-xs w-full focus:ring-0 px-2 outline-none dark:text-white" />
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Hướng dẫn & Tài liệu</p>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id as DocSectionId)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id
                                    ? 'bg-white dark:bg-blue-500/10 text-blue-600 dark:text-blue-500 shadow-sm dark:shadow-none border border-slate-200 dark:border-blue-500/20'
                                    : 'text-slate-500 hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
};