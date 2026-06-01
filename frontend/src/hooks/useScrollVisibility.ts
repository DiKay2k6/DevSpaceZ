import { useState, useEffect } from 'react';

export const useScrollVisibility = (threshold: number = 50): boolean => {
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > threshold) {
                setIsVisible(false); // Cuộn xuống -> Ẩn
            } else {
                setIsVisible(true);  // Cuộn lên -> Hiện
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, threshold]);

    return isVisible;
};