import { useState, useEffect } from 'react';

export const useResponsiveScale = (targetWidth: number = 1920, targetHeight: number = 1080) => {
    const [scale, setScale] = useState(1);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isConstrained, setIsConstrained] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Always treat as desktop "slide" to maintain layout presentation regardless of window thinness (IDE panels)
            const mobile = false;
            setIsMobile(mobile);

            // Reserve space for controls (reduced from 200px to 40px for better laptop coverage)
            const availableHeight = windowHeight - 40;

            const scaleX = windowWidth / targetWidth;
            const scaleY = availableHeight / targetHeight;

            // Choose the smaller scale to fit contained, with a slight margin
            const newScale = Math.min(scaleX, scaleY) * 0.95;
            setScale(newScale);

            // Detect constrained resolution (e.g. very small laptops or landscape tablets)
            // Support 1366x768 (Scale ~0.71, Height 768). 
            // We only switch to scroll mode if it's REALLY small.
            // Wait, for desktop/laptop, users prefer scaled slides even if small.
            const constrained = false; 
            setIsConstrained(constrained);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, [targetWidth, targetHeight]);

    return { scale, isMobile, isConstrained };
};
