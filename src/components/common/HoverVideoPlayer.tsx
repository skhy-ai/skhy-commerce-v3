import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface HoverVideoPlayerProps {
    videoId: string;
    title: string;
    className?: string;
}

/**
 * A reusable component that shows a YouTube video preview on hover (muted, autoplay)
 * and a fallback image with a play icon when not hovered.
 */
export const HoverVideoPlayer: React.FC<HoverVideoPlayerProps> = ({ videoId, title, className = "" }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`aspect-video bg-navy-800 rounded-2xl overflow-hidden border border-navy-700 shadow-2xl relative group cursor-pointer ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered ? (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3`}
                    className="w-full h-full"
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <div className="w-full h-full relative">
                    <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-sky-600/80 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
