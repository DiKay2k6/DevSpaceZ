import React from 'react';
import { SupportHero } from '../features/support/components/SupportHero';
import { SupportChannels } from '../features/support/components/SupportChannels';
import { TicketForm } from '../features/support/components/TicketForm';

const Support: React.FC = () => {
    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 ease-in-out bg-slate-50 dark:bg-[#0B0F1A] text-slate-900 dark:text-white">

            {/* Background Glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0 transition-colors duration-300 bg-blue-100/50 dark:bg-blue-900/10" />

            <div className="w-full h-[80px] relative z-20"></div> {/* Spacer Navbar */}

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10">
                <SupportHero />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    <SupportChannels />
                    <TicketForm />
                </div>
            </main>
        </div>
    );
};

export default Support;