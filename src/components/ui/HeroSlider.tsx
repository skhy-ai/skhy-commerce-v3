import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type SlideMedia = {
  type: 'youtube' | 'image';
  url: string;
  alt?: string;
};

interface HeroSliderProps {
  slides: SlideMedia[];
  autoPlayInterval?: number;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ slides, autoPlayInterval = 8000 }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If it's a youtube video, pause autoplay so they can watch it.
    // (Or we can pause only when playing, but YouTube iframe doesn't give us events easily unless we use the YouTube API.
    // For simplicity, we just pause autoplay whenever a video slide is active).
    if (slides[currentIdx]?.type === 'youtube' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, isPaused, slides, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  return (
    <section 
      className="relative w-full h-[40vh] md:h-[80vh] overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
        >
          {slide.type === 'youtube' ? (
            idx === currentIdx ? (
              <>
                <iframe
                  src={`${slide.url}${slide.url.includes('?') ? '&' : '?'}autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&enablejsapi=1`}
                  title={slide.alt || "Skhy AI Video"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="w-full h-full"
                  loading="lazy"
                  style={{ pointerEvents: 'none' }}
                />
                <div className="absolute inset-0 bg-black/40" />
              </>
            ) : null
          ) : (
            <>
              <img
                src={slide.url}
                alt={slide.alt || "Skhy AI"}
                loading={idx === currentIdx ? "eager" : "lazy"}
                className="w-full h-full object-contain p-4 md:p-8 opacity-90 scale-100 hover:scale-105 transition-transform duration-[10000ms]"
              />
              <div className="absolute inset-0 bg-black/40" />
            </>
          )}
        </div>
      ))}

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/10"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          <button
            onClick={() => setCurrentIdx(prev => (prev + 1) % slides.length)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/50 hover:text-white transition-all backdrop-blur-md border border-white/10"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-30 flex-wrap gap-2 px-6">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIdx ? 'bg-[#00f0ff] w-8 shadow-[0_0_10px_rgba(0,240,255,0.8)]' : 'bg-white/30 w-2 hover:bg-white/60'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
