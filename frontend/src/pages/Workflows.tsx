import React from 'react';
import { WorkflowHero } from '../features/workflows/components/WorkflowHero';
import { WorkflowLifecycle } from '../features/workflows/components/WorkflowLifecycle';
import { KanbanPreview } from '../features/workflows/components/KanbanPreview';
import { FeatureDeepDive } from '../features/workflows/components/FeatureDeepDive';

const Workflows: React.FC = () => {
    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 ease-in-out bg-slate-50 dark:bg-[#111520] text-slate-900 dark:text-white">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none z-0 bg-blue-100/50 dark:bg-blue-900/10" />

            <div className="w-full h-[80px] relative z-20"></div> {/* Spacer Navbar */}

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 relative z-10">
                <WorkflowHero />
                <WorkflowLifecycle />
                <KanbanPreview />
                <FeatureDeepDive />
            </main>
        </div>
    );
};

export default Workflows;