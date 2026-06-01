import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '@shared/types/common'; // Lấy thẳng từ gốc dự án

interface ThemeContextType {
    theme: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Ưu tiên lấy theme từ localStorage, nếu không có thì mặc định là 'dark'
    const [theme, setTheme] = useState<ThemeMode>(() => {
        return (localStorage.getItem('theme') as ThemeMode) || 'dark';
    });

    // Khi theme thay đổi, chỉ thao tác duy nhất trên thẻ <html>
    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook để gọi theme ở bất cứ đâu
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};