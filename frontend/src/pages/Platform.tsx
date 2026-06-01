import React from 'react';
import { PlatformHero } from '../features/platform/components/PlatformHero';
import { ArchitectureTiers } from '../features/platform/components/ArchitectureTiers';
import { TechStackGrid } from '../features/platform/components/TechStackGrid';

const Platform: React.FC = () => {
    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 ease-in-out bg-slate-50 dark:bg-[#111520] text-slate-900 dark:text-white">

            {/* Background Glow Effects (Chỉ sử dụng dark: classes, xóa bỏ toán tử 3 ngôi) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] rounded-full blur-3xl pointer-events-none z-0 
                bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-transparent 
                dark:from-blue-900/20 dark:via-[#111520] dark:to-transparent"
            />

            <div className="w-full h-[80px] relative z-20"></div> {/* Spacer cho Navbar */}

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10">
                <PlatformHero />
                <ArchitectureTiers />
                <TechStackGrid />
            </main>
        </div>
    );
};

export default Platform;