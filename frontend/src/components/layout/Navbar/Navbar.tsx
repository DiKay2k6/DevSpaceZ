import { getAvatarUrl } from "@/shared/utils/avatar";
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScrollVisibility } from '@/hooks/useScrollVisibility';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { useAuthStore } from '@/entities/user/model/authStore';
// Import thêm User icon
import { LogOut, LayoutDashboard, ChevronDown, User } from 'lucide-react';
import myLogo from '@/assets/images/logo.png';

export const Navbar: React.FC = () => {
    const isVisible = useScrollVisibility(50);
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, logout, user } = useAuthStore();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name?: string) => name ? name.charAt(0).toUpperCase() : 'U';

    return (
        <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="w-full border-b transition-colors duration-300 backdrop-blur-xl bg-white/70 dark:bg-[#111520]/70 border-slate-200/50 dark:border-[#ffffff1a]">
                <nav className="w-full flex justify-between items-center py-4 px-6 md:px-12 mx-auto max-w-7xl">

                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3">
                            <img src={myLogo} alt="DevSpace Logo" className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                                devspace<span className="text-blue-500">z</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex space-x-8 text-[14px] font-medium transition-colors duration-300 text-slate-500 dark:text-gray-300">
                        <Link to="/platform" className="hover:text-blue-600 dark:hover:text-white transition">Platform</Link>
                        <Link to="/workflows" className="hover:text-blue-600 dark:hover:text-white transition">Workflows</Link>
                        <Link to="/monitor" className="hover:text-blue-600 dark:hover:text-white transition">Server Monitor</Link>
                        <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-white transition">Pricing</Link>
                        <Link to="/docs" className="hover:text-blue-600 dark:hover:text-white transition">Docs</Link>
                        <Link to="/support" className="hover:text-blue-600 dark:hover:text-white transition">Support</Link>
                    </div>

                    <div className="flex items-center space-x-5">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border bg-slate-50/80 dark:bg-[#ffffff0a] border-slate-200 dark:border-[#ffffff1a] text-slate-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:border-blue-200 hover:shadow-sm"
                        >
                            {theme === 'light' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            )}
                        </button>

                        {isAuthenticated && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 p-1 pr-3 rounded-full border transition-all duration-300 bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 hover:shadow-md"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden ${!user.avatar_url ? 'bg-gradient-to-tr from-blue-600 to-purple-600' : 'bg-slate-400 dark:bg-slate-600'}`}>
                                        {user.avatar_url ? (
                                            <img 
                                                src={user.avatar_url ? getAvatarUrl(user.avatar_url) : ""} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover" 
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    const target = e.currentTarget;
                                                    target.onerror = null;
                                                    target.style.display = 'none';
                                                    if (target.parentElement) {
                                                        target.parentElement.classList.add('bg-gradient-to-tr', 'from-blue-600', 'to-purple-600');
                                                        target.parentElement.innerText = user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U';
                                                    }
                                                }}
                                            />
                                        ) : (
                                            getInitials(user.full_name)
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {user.full_name.split(' ').pop()}
                                    </span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0f172a] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-100 dark:border-slate-800 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
                                            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-1">Đã đăng nhập</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                                        </div>

                                        <div className="p-2 space-y-1">
                                            {/* THÊM NÚT HỒ SƠ CÁ NHÂN */}
                                            <Link
                                                to="/dashboard/settings/account"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <User size={18} />
                                                Hồ sơ cá nhân
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <LayoutDashboard size={18} />
                                                Vào Workspace
                                            </Link>
                                        </div>

                                        <div className="border-t border-slate-100 dark:border-slate-800/60 p-2">
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <LogOut size={18} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/auth">
                                <button className="text-sm font-bold px-6 py-2.5 rounded-full transition-all duration-300 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-lg hover:-translate-y-0.5">
                                    Đăng nhập / Đăng ký
                                </button>
                            </Link>
                        )}
                    </div>
                </nav>
            </div>
        </div>
    );
};