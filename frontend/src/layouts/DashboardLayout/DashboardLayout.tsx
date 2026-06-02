import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { FloatingAIAssistant } from '@/features/ai/components/FloatingAIAssistant';

export const DashboardLayout: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const isExpanded = !isCollapsed || isHovered;

    return (
        <div className="flex h-screen overflow-hidden transition-colors duration-300 font-sans bg-[#F1F5F9] dark:bg-[#0B0F19] text-slate-900 dark:text-white">

            {/* Sidebar */}
            <DashboardSidebar
                isExpanded={isExpanded}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

                {/* Header */}
                <DashboardHeader
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-[#0B0F19] transition-colors duration-300 p-8 relative">
                    {/* Render Content */}
                    <Outlet />
                </main>

                {/* AI Assistant */}
                <FloatingAIAssistant />
            </div>
        </div>
    );
};

export default DashboardLayout;