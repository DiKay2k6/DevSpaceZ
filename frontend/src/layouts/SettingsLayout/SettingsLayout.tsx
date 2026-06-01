import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
    User, Shield, Bell, CreditCard,
    ArrowLeft, Menu, X, ChevronDown,
    LayoutDashboard, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useTheme } from '@/shared/contexts/ThemeContext';

// ─── Constants (defined outside to avoid re-creation) ────────────────────────
const NAV_GROUPS = [
    {
        label: 'Tài khoản',
        items: [
            { id: 'account',  to: '/dashboard/settings/account',  Icon: User,       text: 'Hồ sơ cá nhân', enabled: true  },
            { id: 'security', to: '/dashboard/settings/security', Icon: Shield,     text: 'Bảo mật',       enabled: true  },
        ],
    },
    {
        label: 'Nâng cao',
        items: [
            { id: 'notifications', to: '#', Icon: Bell,       text: 'Thông báo', enabled: false },
            { id: 'billing',       to: '#', Icon: CreditCard, text: 'Gói cước',  enabled: false },
        ],
    },
] as const;

// ─── ThemeButton — same exact style as DashboardHeader ───────────────────────
const ThemeButton = memo(({ theme, onToggle }: { theme: string; onToggle: () => void }) => (
    <button
        onClick={onToggle}
        className="p-2.5 rounded-full border transition-all duration-200 bg-slate-50/80 dark:bg-[#ffffff0a] border-slate-200 dark:border-[#ffffff1a] text-slate-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:border-blue-200 hover:shadow-sm"
    >
        {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        )}
    </button>
));
ThemeButton.displayName = 'ThemeButton';

// ─── SettingsLayout ───────────────────────────────────────────────────────────
export const SettingsLayout: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useTheme();

    const [mobileOpen,   setMobileOpen]   = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const closeOnOutside = useCallback((e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
            setUserMenuOpen(false);
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', closeOnOutside);
        return () => document.removeEventListener('mousedown', closeOnOutside);
    }, [closeOnOutside]);

    const handleLogout = useCallback(async () => {
        await logout();
        navigate('/auth');
    }, [logout, navigate]);

    const initials  = user?.full_name?.charAt(0).toUpperCase() ?? 'U';
    const avatarSrc = user?.avatar_url ? user.avatar_url : null;
    const roleLabel = user?.specialization ?? user?.role ?? '';

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white transition-colors duration-300">

            {/* ══════════════════════ HEADER ══════════════════════════════════ */}
            <header className="sticky top-0 z-40 h-20 flex items-center justify-between px-8 backdrop-blur-md bg-white/80 dark:bg-[#111520]/80 border-b border-slate-200 dark:border-white/[0.05] transition-colors">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#ffffff0f] transition-all"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Quay lại Dashboard</span>
                </button>

                <div className="flex items-center gap-3">
                    <ThemeButton theme={theme} onToggle={toggleTheme} />

                    {/* User dropdown pill */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setUserMenuOpen(v => !v)}
                            className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-2xl border bg-white dark:bg-[#111520] border-slate-200 dark:border-[#ffffff1a] hover:border-blue-300 dark:hover:border-[#ffffff3a] transition-all"
                        >
                            <div className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner ${avatarSrc ? '' : 'bg-gradient-to-br from-blue-500 to-violet-600'}`}>
                                {avatarSrc ? <img src={avatarSrc} alt="av" className="w-full h-full object-cover" /> : initials}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white">{user?.full_name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{roleLabel}</p>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border bg-white dark:bg-[#0f172a] border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mb-1">Đã đăng nhập</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={() => { navigate('/dashboard'); setUserMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <LayoutDashboard size={16} /> Vào Dashboard
                                    </button>
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800/60 p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="md:hidden p-2.5 rounded-xl border border-slate-200 dark:border-[#ffffff1a] bg-white dark:bg-[#ffffff0a] text-slate-500 dark:text-slate-400"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* ══════════════════════ BODY ════════════════════════════════════ */}
            <div className="flex flex-1 w-full">

                {/* Mobile overlay */}
                {mobileOpen && (
                    <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
                )}

                {/* ════ SIDEBAR ════════════════════════════════════════════════ */}
                {/*
                    Desktop: sticky left column, transparent bg, no border
                    Mobile: fixed drawer sliding in from left
                */}
                <aside className={`
                    fixed md:sticky top-20 md:top-0 left-0 z-30 md:z-auto
                    h-[calc(100vh-5rem)] md:h-[calc(100vh-5rem)]
                    w-[280px] shrink-0
                    flex flex-col
                    bg-white dark:bg-[#111520]
                    border-r border-slate-200 dark:border-white/[0.05]
                    transition-transform duration-300 ease-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}>
                    <div className="flex-1 overflow-y-auto px-4 py-8">

                        {/* Settings heading */}
                        <div className="px-2 mb-6">
                            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Cài đặt</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quản lý tài khoản</p>
                        </div>

                        {/* Nav groups */}
                        <nav className="space-y-5">
                            {NAV_GROUPS.map(group => (
                                <div key={group.label}>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 mb-2">
                                        {group.label}
                                    </p>
                                    <div className="space-y-0.5">
                                        {group.items.map(item =>
                                            item.enabled ? (
                                                <NavLink
                                                    key={item.id}
                                                    to={item.to}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={({ isActive }) =>
                                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                            isActive
                                                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                                        }`
                                                    }
                                                >
                                                    <item.Icon size={16} className="flex-shrink-0" />
                                                    {item.text}
                                                </NavLink>
                                            ) : (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-not-allowed opacity-40"
                                                >
                                                    <item.Icon size={16} className="flex-shrink-0 text-slate-400 dark:text-slate-600" />
                                                    <span className="text-sm font-semibold text-slate-400 dark:text-slate-600 flex-1">{item.text}</span>
                                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-300/80 dark:bg-white/5 text-slate-400 dark:text-slate-500">Soon</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* ════ MAIN CONTENT ══════════════════════════════════════════ */}
                <main className="flex-1 min-w-0 overflow-y-auto">
                    <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-12 py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsLayout;
