import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { DocSectionId } from '../constants/docsData';

// Import các Sections
import { IntroSection } from './sections/IntroSection';
import { GettingStartedSection } from './sections/GettingStartedSection';
import { KanbanSection } from './sections/KanbanSection';
import { MonitorSection } from './sections/MonitorSection';
import { BillingSection } from './sections/BillingSection';

interface DocsContentProps {
    activeSection: DocSectionId;
}

export const DocsContent: React.FC<DocsContentProps> = ({ activeSection }) => {
    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'intro': return <IntroSection />;
            case 'getting-started': return <GettingStartedSection />;
            case 'kanban': return <KanbanSection />;
            case 'monitor': return <MonitorSection />;
            case 'billing': return <BillingSection />;
            default: return null;
        }
    };

    return (
        <main className="flex-1 p-6 md:p-12 lg:p-20 md:pt-32 overflow-x-hidden min-h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeUp}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </main>
    );
};