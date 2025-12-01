import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';

interface JournalSidebarItemProps {
    entry: JournalEntry;
    isSelected: boolean;
    onClick: () => void;
}

export default function JournalSidebarItem({ entry, isSelected, onClick }: JournalSidebarItemProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const truncateText = (html: string, maxLength: number = 60) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Paper
                elevation={0}
                onClick={onClick}
                sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    borderRadius: 3,
                    bgcolor: isSelected ? 'primary.main' : 'white',
                    color: isSelected ? 'white' : 'text.primary',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: isSelected ? 'primary.main' : 'rgba(224, 176, 182, 0.1)',
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                        {formatDate(entry.date)}
                    </Typography>
                    {entry.mood > 0 && (
                        <Chip
                            label={['', 'Happy', 'Sad', 'Excited', 'Calm', 'Anxious'][entry.mood]}
                            size="small"
                            sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(224, 176, 182, 0.2)',
                                color: isSelected ? 'white' : 'primary.main'
                            }}
                        />
                    )}
                </Box>
                <Typography variant="body2" sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    lineHeight: 1.4,
                    opacity: isSelected ? 0.9 : 0.7
                }}>
                    {truncateText(entry.text)}
                </Typography>
            </Paper>
        </motion.div>
    );
}
