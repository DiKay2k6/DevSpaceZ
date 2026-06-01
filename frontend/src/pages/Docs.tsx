import React, { useState } from 'react';
import { DocSectionId } from '../features/docs/constants/docsData';
import { DocsSidebar } from '../features/docs/components/DocsSidebar';
import { DocsContent } from '../features/docs/components/DocsContent';

const Docs: React.FC = () => {
    const [activeSection, setActiveSection] = useState<DocSectionId>('getting-started');

    return (
        <div className="min-h-screen font-sans transition-colors duration-300 bg-white dark:bg-[#0B0F1A] text-slate-900 dark:text-white">
            <div className="max-w-8xl mx-auto flex flex-col md:flex-row relative">

                {/* 1. Sidebar Menu */}
                <DocsSidebar
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />

                {/* 2. Main Content Area */}
                <DocsContent
                    activeSection={activeSection}
                />

            </div>
        </div>
    );
};

export default Docs;