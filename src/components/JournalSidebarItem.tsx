
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Sticker } from 'lucide-react';

interface JournalSidebarItemProps {
    entry: JournalEntry;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
    sx?: any;
}

export default function JournalSidebarItem({ entry, isSelected, onClick, className, sx }: JournalSidebarItemProps) {
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const hasImages = entry.image_urls && entry.image_urls.length > 0;
    const hasSticker = !!entry.sticker_id;

    return (
        <motion.div whileHover={{ scale: isMobile ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
            <Paper
                elevation={0}
                onClick={onClick}
                className={className}
                sx={{
                    p: 2,
                    mb: 2,
                    cursor: 'pointer',
                    borderRadius: 3,
                    bgcolor: isSelected ? 'primary.main' : (className ? 'transparent' : 'background.paper'),
                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        bgcolor: isSelected ? 'primary.main' : 'action.hover',
                    },
                    ...sx
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8 }}>
                        {formatDate(entry.date)}
                    </Typography>

                    {/* Indicators (Right of Date) */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', opacity: 0.6 }}>
                        {/* Monochrome Mood Emoji */}
                        {(entry.mood || 0) > 0 && (
                            <Typography sx={{
                                fontSize: '1rem',
                                lineHeight: 1,
                                filter: 'grayscale(100%)', // Monochrome effect
                                opacity: 0.8
                            }}>
                                {['😢', '😕', '😐', '🙂', '😄'][(entry.mood!) - 1]}
                            </Typography>
                        )}

                        {hasSticker && (
                            <Sticker size={14} />
                        )}

                        {hasImages && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ImageIcon size={14} />
                                <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
                                    {entry.image_urls!.length}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                <Typography variant="body2" sx={{
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                    lineHeight: 1.4,
                    opacity: isSelected ? 0.9 : 0.7,
                    mt: 0.5
                }}>
                    {truncateText(entry.text)}
                </Typography>
            </Paper>
        </motion.div>
    );
}
