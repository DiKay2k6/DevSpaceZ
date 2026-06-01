import React, { useState } from 'react';
import { PricingHero } from '../features/pricing/components/PricingHero';
import { PricingCards } from '../features/pricing/components/PricingCards';

const Pricing: React.FC = () => {
    // Trạng thái theo dõi gói cước (Tháng/Năm)
    const [isYearly, setIsYearly] = useState<boolean>(false);

    return (
        <div className="min-h-screen font-sans relative transition-colors duration-300 bg-slate-50 dark:bg-[#111520] text-slate-900 dark:text-white">

            <div className="w-full h-[80px] relative z-20"></div>

            <main className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-32 relative z-10">
                <PricingHero isYearly={isYearly} setIsYearly={setIsYearly} />
                <PricingCards isYearly={isYearly} />
            </main>
        </div>
    );
};

export default Pricing;