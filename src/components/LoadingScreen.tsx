import { motion } from 'framer-motion';
import { Book } from 'lucide-react';
import { useThemeSettings } from '../context/ThemeContext';

export default function LoadingScreen() {
    const { mode } = useThemeSettings();

    // Gentle noise texture using SVG data URI
    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            style={{
                backgroundColor: mode === 'dark' ? '#1a1a1a' : '#f5f5f0', // Warm dark or warm light (parchment-like)
            }}
        >
            {/* Background Texture & Zoom Animation */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: noiseTexture,
                    backgroundSize: '200px 200px',
                }}
                initial={{ scale: 1.03 }}
                animate={{ scale: 1.0 }}
                transition={{
                    duration: 8,
                    ease: "easeOut",
                }}
            />

            {/* Icon Container */}
            <motion.div
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    transition: { delay: 0.3, duration: 1.0 }
                }}
            >
                <motion.div
                    animate={{
                        opacity: [1, 0.7, 1],
                    }}
                    transition={{
                        delay: 2.5, // Start breathing after page turn
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Book Icon */}
                    <div className="relative">
                        <Book
                            size={64}
                            strokeWidth={1.5}
                            color={mode === 'dark' ? '#e5e5e5' : '#4a4a4a'}
                        />

                        {/* Page Turn Animation Overlay - Simplified concept */}
                        {/* Visualizing a "page turn" on a static icon is tricky without a custom SVG or complex CSS 3D transforms. 
                    Instead, let's effectively animate the "opening" of the book or a subtle rotation. 
                    Given standard Lucide icon, let's do a slow 3D rotate Y to simulate turning/settling.
                */}
                        <motion.div
                            className="absolute inset-0"
                            initial={{ rotateY: 30 }}
                            animate={{ rotateY: 0 }}
                            transition={{
                                duration: 1.8,
                                ease: "easeOut",
                                delay: 0.5
                            }}
                        />
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
