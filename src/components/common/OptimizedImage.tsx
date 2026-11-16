import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
    alt: string;
}

/**
 * OptimizedImage component that implements "Remote-First, Local-Fallback" logic.
 * 1. Attempts to load 'src' (usually remote CDN)
 * 2. If it fails, attempts to load 'fallbackSrc' (usually local path)
 * 3. If both fail, shows a generic image icon/placeholder.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className,
    fallbackSrc,
    ...props
}) => {
    const [currentSrc, setCurrentSrc] = useState<string | undefined>(src || fallbackSrc);
    const [attemptedFallback, setAttemptedFallback] = useState(!!(!src && fallbackSrc));
    const [isFullyFailed, setIsFullyFailed] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Sync state if src changes externally
    useEffect(() => {
        setCurrentSrc(src || fallbackSrc);
        setAttemptedFallback(!!(!src && fallbackSrc));
        setIsFullyFailed(false);
        setIsLoaded(false);
    }, [src, fallbackSrc]);

    const handleError = () => {
        if (!attemptedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
            console.log(`[OptimizedImage] Remote load failed, trying local fallback for: ${alt}`);
            setCurrentSrc(fallbackSrc);
            setAttemptedFallback(true);
        } else {
            console.warn(`[OptimizedImage] Both primary and fallback failed for: ${alt}`);
            setIsFullyFailed(true);
        }
    };

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoaded(true);
    };

    // Check if image is already cached on mount
    const imgRef = React.useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoaded(true);
        }
    }, [currentSrc]);

    if (isFullyFailed || !currentSrc) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 ${className}`}>
                <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 opacity-40 mx-auto mb-1" />
                    <span className="text-[10px] block opacity-40">Image Unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={handleError}
            onLoad={handleLoad}
            className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            {...props}
        />
    );
};
