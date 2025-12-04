import { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';

interface ScrapbookImageProps {
    src: string;
    index: number;
    onClick?: () => void;
    width?: number | string;
    height?: number | string;
    onLoad?: () => void;
    shouldAnimate?: boolean;
}

export default function ScrapbookImage({
    src,
    index,
    onClick,
    width = 100,
    height = 100,
    onLoad,
    shouldAnimate = false
}: ScrapbookImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Calculate rotation based on index (alternating tilt)
    const rotation = index % 2 === 0 ? -6 : 6;

    const handleLoad = () => {
        if (!isLoaded) {
            setIsLoaded(true);
            onLoad?.();
        }
    };

    return (
        <Box sx={{ position: 'relative', width, height }}>
            {/* Hidden image to trigger load event - use visibility hidden to ensure it loads */}
            <img
                src={src}
                alt="hidden-loader"
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                onLoad={handleLoad}
                onError={handleLoad} // Treat error as loaded to avoid blocking
                // Check if already loaded (cached)
                ref={(img) => {
                    if (img && img.complete && !isLoaded) {
                        handleLoad();
                    }
                }}
            />

            {/* Skeleton Loading State */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    transform: `rotate(${rotation}deg)`,
                    zIndex: index, // Same level, but image will be on top due to DOM order or z-index handling
                    opacity: shouldAnimate ? 0 : 1,
                    transition: 'opacity 0.3s ease-out',
                    pointerEvents: 'none'
                }}
            >
                <Skeleton
                    animation={false}
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    sx={{
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        opacity: 0.15
                    }}
                />
            </Box>

            {/* Animated Visible Image */}
            <motion.div
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                    scale: shouldAnimate ? 1 : 0,
                    opacity: shouldAnimate ? 1 : 0,
                    rotate: shouldAnimate ? rotation : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    // No delay here, the rhythm is controlled by the parent
                }}
                whileHover={{
                    scale: 1.1,
                    rotate: 0,
                    zIndex: 100,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: index // Stack order
                }}
                onClick={onClick}
            >
                <Box
                    component="img"
                    src={src}
                    alt={`scrapbook-${index}`}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 2,
                        border: '3px solid white',
                        boxShadow: 3,
                        cursor: onClick ? 'pointer' : 'default',
                    }}
                />
            </motion.div>
        </Box>
    );
}
