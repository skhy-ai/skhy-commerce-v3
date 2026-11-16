import React, { useState, useEffect } from 'react';

export interface Section {
  id: string;
  label: string;
}

interface SideNavProps {
  sections: Section[];
  onSectionClick?: (sectionId: string, index: number) => void;
}

export const SideNav: React.FC<SideNavProps> = ({ sections, onSectionClick }) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || '');
  const [isAtFooter, setIsAtFooter] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisibleId = activeId;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.intersectionRatio > maxRatio) {
              maxRatio = entry.intersectionRatio;
              mostVisibleId = entry.target.id;
            }
          }
        });

        if (maxRatio > 0) {
          setActiveId(mostVisibleId);
        }
      },
      {
        root: null,
        rootMargin: '-20% 0px -40% 0px', // Triggers when section is in the middle of viewport
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
      }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [sections, activeId]);

  useEffect(() => {
    const footerElement = document.querySelector('footer');
    if (!footerElement) return;

    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsAtFooter(entry.isIntersecting);
        });
      },
      {
        root: null,
        threshold: 0.05,
      }
    );

    footerObserver.observe(footerElement);
    return () => footerObserver.disconnect();
  }, []);

  const scrollToSection = (id: string, index: number) => {
    if (index === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (onSectionClick) {
      onSectionClick(id, index);
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3 items-end transition-all duration-500">
      {sections.map((section, index) => {
        const isTop = index === 0;
        const isActive = activeId === section.id;
        const isHidden = isAtFooter && !isTop;

        return (
          <div
            key={section.id}
            className={`
              transition-all duration-500 ease-in-out transform origin-right flex justify-end
              ${isHidden
                ? 'opacity-0 max-h-0 py-0 scale-95 pointer-events-none overflow-hidden border-none'
                : 'opacity-100 max-h-12 py-1 scale-100 pointer-events-auto'
              }
            `}
          >
            <button
              onClick={() => scrollToSection(section.id, index)}
              className="group relative flex items-center gap-4 focus:outline-none"
              aria-label={`Scroll to ${section.label}`}
            >
              {/* Label */}
              <span
                className={`
                  text-xs font-mono tracking-widest uppercase transition-all duration-300
                  ${isActive ? 'text-[#00f0ff] font-bold' : 'text-white/70 hover:text-white'}
                  ${isTop && isAtFooter ? 'text-[#00f0ff] font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}
                `}
              >
                {section.label}
              </span>
              
              {/* Indicator Dot/Line */}
              <div
                className={`
                  transition-all duration-300 rounded-full
                  ${(isActive || (isTop && isAtFooter))
                    ? 'w-8 h-1 bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.9)]'
                    : 'w-2 h-2 bg-white/30 group-hover:bg-white group-hover:w-4'
                  }
                `}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};
