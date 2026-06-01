import React from 'react';
import { motion, Variants } from 'framer-motion';
import { featureDeepDives } from '../constants/workflowsData';

export const FeatureDeepDive: React.FC = () => {
    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
    };

    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 15 } }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {featureDeepDives.map((feature, idx) => (
                <motion.div key={idx} variants={cardVariant} className="p-8 rounded-3xl border cursor-default transition-colors duration-300 bg-white dark:bg-[#1E293B]/40 border-slate-200 dark:border-slate-800">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${feature.colorTheme}-50 dark:bg-${feature.colorTheme}-500/10 text-${feature.colorTheme}-600 dark:text-${feature.colorTheme}-500`}>
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                    <p className="text-sm leading-relaxed mb-4 transition-colors duration-300 text-slate-500 dark:text-slate-400">
                        {feature.desc}
                    </p>
                    <div className={`p-3 rounded-lg text-xs font-mono border border-l-4 transition-colors duration-300 border-l-${feature.colorTheme}-500 bg-slate-50 dark:bg-[#111520] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300`}>
                        {feature.example}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};