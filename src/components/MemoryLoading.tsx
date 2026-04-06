import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

export default function MemoryLoading() {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                gap: 4,
                p: 3,
                textAlign: 'center'
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [0.95, 1.05, 0.95],
                }}
                transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '35% 65% 70% 30% / 30% 30% 70% 70%', // Organic blob shape
                        bgcolor: 'primary.main',
                        boxShadow: `0 0 40px ${theme.palette.primary.main}4D`,
                        filter: 'blur(2px)'
                    }}
                />
            </motion.div>

            <Box>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontWeight: 600, 
                            letterSpacing: -0.5,
                            mb: 1,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Remembering your memories...
                    </Typography>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6, fontStyle: 'italic' }}>
                        Just a moment while we gather your thoughts
                    </Typography>
                </motion.div>
            </Box>
        </Box>
    );
}
