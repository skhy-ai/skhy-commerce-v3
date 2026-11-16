import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface UsePitchDeckNavigationProps {
    totalSlides: number;
    trackSlideView: (slideNumber: number, duration: number) => void;
}

export const usePitchDeckNavigation = ({ totalSlides, trackSlideView }: UsePitchDeckNavigationProps) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(1);
    const slideStartTime = useRef<number>(Date.now());

    // Swipe handling
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const changeSlide = (direction: number) => {
        const duration = Math.round((Date.now() - slideStartTime.current) / 1000);
        trackSlideView(currentSlide, duration);

        let newIndex = currentSlide + direction;
        if (newIndex > totalSlides) newIndex = 1;
        if (newIndex < 1) newIndex = totalSlides;

        setCurrentSlide(newIndex);
        slideStartTime.current = Date.now();

        // Reset scroll position for mobile
        window.scrollTo(0, 0);
    };

    const jumpToSlide = (slideIndex: number) => {
        if (slideIndex < 1 || slideIndex > totalSlides) return;
        const duration = Math.round((Date.now() - slideStartTime.current) / 1000);
        trackSlideView(currentSlide, duration);
        setCurrentSlide(slideIndex);
        slideStartTime.current = Date.now();
        window.scrollTo(0, 0);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                changeSlide(1);
            } else if (e.key === 'ArrowLeft') {
                changeSlide(-1);
            } else if (e.key === 'Escape') {
                navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide]);

    // Swipe handlers
    const onTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;

        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            changeSlide(1);
        } else if (isRightSwipe) {
            changeSlide(-1);
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    return {
        currentSlide,
        changeSlide,
        jumpToSlide,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
