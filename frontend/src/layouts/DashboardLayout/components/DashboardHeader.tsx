import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, User, LogOut, ChevronDown, LogIn, Home } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuthStore } from '@/entities/user/model/authStore';
import { NotificationsDropdown } from './NotificationsDropdown';

interface DashboardHeaderProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleCollapse }) => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const { user, isAuthenticated, logout } = useAuthStore();

    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : 'G';

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-300 backdrop-blur-md bg-white/80 dark:bg-[#111520]/80 border-b border-slate-200 dark:border-[#ffffff1a]">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={toggleCollapse}
                    className="p-2.5 rounded-xl transition-all bg-slate-50 dark:bg-[#ffffff0a] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#ffffff1a]"
                >
                    <Menu size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 pl-4">
                {!isAuthenticated && (
                    <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-800/50">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                        Demo Mode
                    </div>
                )}

                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full transition-all duration-300 border bg-slate-50/80 dark:bg-[#ffffff0a] border-slate-200 dark:border-[#ffffff1a] text-slate-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:border-blue-200 hover:shadow-sm"
                >
                    {theme === 'light' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    )}
                </button>

                <NotificationsDropdown />

                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl cursor-pointer transition-all border bg-white dark:bg-[#111520] border-slate-200 dark:border-[#ffffff1a] hover:border-blue-300 dark:hover:border-[#ffffff3a]"
                    >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden ${isAuthenticated && !user?.avatar_url ? 'bg-gradient-to-tr from-blue-600 to-purple-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                            {user?.avatar_url ? (
                                <img 
                                    src={user.avatar_url} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            // Fallback to text initials
                                            target.parentElement.classList.add('bg-gradient-to-tr', 'from-blue-600', 'to-purple-600');
                                            target.parentElement.innerText = getInitials(user?.full_name);
                                        }
                                    }}
                                />
                            ) : (
                                getInitials(user?.full_name)
                            )}
                        </div>

                        <div className="text-left hidden lg:block">
                            <p className="text-[13px] font-bold leading-none mb-1 text-slate-900 dark:text-white">
                                {isAuthenticated ? user?.full_name : 'Khách viếng thăm'}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-none">
                                {isAuthenticated ? (user?.specialization || user?.role) : 'Read-only Mode'}
                            </p>
                        </div>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
                                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-1">
                                    {isAuthenticated ? 'Đã đăng nhập' : 'Bạn chưa đăng nhập'}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {isAuthenticated ? user?.email : 'Vui lòng đăng nhập để lưu trữ'}
                                </p>
                            </div>

                            {isAuthenticated ? (
                                <>
                                    {/* KHỐI 1: CÁC NÚT ĐIỀU HƯỚNG */}
                                    <div className="p-2 space-y-1">
                                        <button onClick={() => {
                                            navigate('/dashboard/settings/account');
                                            setShowUserMenu(false);
                                        }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <User size={18} /> Hồ sơ cá nhân
                                        </button>
                                        <button onClick={() => {
                                            navigate('/');
                                            setShowUserMenu(false);
                                        }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                            <Home size={18} /> Quay lại trang chủ
                                        </button>
                                    </div>

                                    {/* KHỐI 2: NÚT ĐĂNG XUẤT CÓ ĐƯỜNG KẺ TRÊN */}
                                    <div className="border-t border-slate-100 dark:border-slate-800/60 p-2">
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <LogOut size={18} /> Đăng xuất
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="p-2">
                                    <button onClick={() => navigate('/auth')} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                                        <LogIn size={16} /> Đăng nhập ngay
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};