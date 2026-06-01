import React from 'react';
import { useLiveLogs } from '../features/server-monitor/hooks/useLiveLogs';
import { MonitorHeader } from '../features/server-monitor/components/MonitorHeader';
import { SystemStats } from '../features/server-monitor/components/SystemStats';
import { DockerContainers } from '../features/server-monitor/components/DockerContainers';
import { LiveTerminal } from '../features/server-monitor/components/LiveTerminal';

const ServerMonitor: React.FC = () => {
    // Tự động fetch data (giả lập)
    const logs = useLiveLogs();

    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 ease-in-out bg-slate-50 dark:bg-[#111520] text-slate-900 dark:text-white">

            {/* Background Glows */}
            <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full blur-[150px] pointer-events-none z-0 transition-colors duration-300 bg-emerald-100/60 dark:bg-emerald-900/20" />
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none z-0 transition-colors duration-300 bg-blue-100/50 dark:bg-blue-900/20" />

            <div className="w-full h-[80px] relative z-20"></div> {/* Spacer Navbar */}

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 pb-24 relative z-10">
                <MonitorHeader />

                <SystemStats />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                    <DockerContainers />
                    <LiveTerminal logs={logs} />
                </div>
            </main>
        </div>
    );
};

export default ServerMonitor;