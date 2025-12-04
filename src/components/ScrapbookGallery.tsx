import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import ScrapbookImage from './ScrapbookImage';

interface ScrapbookGalleryProps {
    images: string[];
    onImageClick?: (index: number) => void;
}

export default function ScrapbookGallery({ images, onImageClick }: ScrapbookGalleryProps) {
    // Track loaded state by URL so it persists even if indices change (e.g. deletion)
    const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
    const [visibleCount, setVisibleCount] = useState(0);
    const prevImagesRef = useRef<string[]>([]);

    const handleImageLoad = (url: string) => {
        setLoadedUrls(prev => {
            const newSet = new Set(prev);
            newSet.add(url);
            return newSet;
        });
    };

    // Handle updates to the image list (Navigation vs Append/Delete)
    useEffect(() => {
        const prevImages = prevImagesRef.current;
        const currentImages = images;

        // Check if this is a continuation (append or subset) or a completely new set
        const isAppend = currentImages.length >= prevImages.length && prevImages.every((url, i) => currentImages[i] === url);
        const isSubset = currentImages.length < prevImages.length && currentImages.every((url, i) => prevImages[i] === url);

        if (isAppend || isSubset) {
            // Keep existing visibility (clamped to new length)
            setVisibleCount(prev => Math.min(prev, currentImages.length));
        } else {
            // New set of images (Navigation) - Reset animation
            setVisibleCount(0);
            // We don't strictly need to clear loadedUrls as they are by URL, but we can if we want to save memory.
            // For now, keeping them is safer for cache hits.
        }

        prevImagesRef.current = currentImages;
    }, [images]);

    // Animation Loop
    useEffect(() => {
        const totalImages = images.length;

        // Check if ALL current images are loaded
        const allLoaded = images.every(url => loadedUrls.has(url));

        if (allLoaded) {
            if (visibleCount < totalImages) {
                const timer = setTimeout(() => {
                    setVisibleCount(prev => prev + 1);
                }, 150);
                return () => clearTimeout(timer);
            }
        }
    }, [visibleCount, loadedUrls, images]);

    if (!images || images.length === 0) return null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            {images.map((url, index) => (
                <Box
                    key={`${url}-${index}`}
                    sx={{
                        // Negative margin to overlap images slightly like a stack
                        ml: index > 0 ? -4 : 0,
                        position: 'relative',
                        zIndex: index
                    }}
                >
                    <ScrapbookImage
                        src={url}
                        index={index}
                        onClick={() => onImageClick?.(index)}
                        onLoad={() => handleImageLoad(url)}
                        shouldAnimate={index < visibleCount}
                    />
                </Box>
            ))}
        </Box>
    );
}
