import { useState, useMemo, useEffect } from 'react';
import { Box, Typography, IconButton, Grid, Paper, useTheme, Popover, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, Flower } from 'lucide-react';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { useStickers } from '../hooks/useStickers';

interface CalendarViewProps {
    entries: JournalEntry[];
    onDateSelect: (date: Date) => void;
    initialDate?: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ entries, onDateSelect, initialDate }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(initialDate || new Date());
    const { stickers } = useStickers();
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

    // Update calendar view when initialDate changes (e.g. navigation back)
    useEffect(() => {
        if (initialDate) {
            setCurrentDate(initialDate);
        }
    }, [initialDate]);

    const handleMonthClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'month-year-popover' : undefined;

    const handleYearChange = (increment: number) => {
        setCurrentDate(new Date(currentDate.getFullYear() + increment, currentDate.getMonth()));
    };

    const handleMonthSelect = (monthIndex: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex));
        handleClose();
    };

    const { days, monthLabel } = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const daysArray = [];

        // Previous month padding
        for (let i = 0; i < startDay; i++) {
            daysArray.push(null);
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            daysArray.push(new Date(year, month, i));
        }

        return {
            days: daysArray,
            monthLabel: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        };
    }, [currentDate]);

    const getEntriesForDate = (date: Date) => {
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getDate() === date.getDate() &&
                entryDate.getMonth() === date.getMonth() &&
                entryDate.getFullYear() === date.getFullYear();
        });
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <Box sx={{ p: 0, width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <IconButton onClick={handlePrevMonth}>
                    <ChevronLeft />
                </IconButton>
                <Button
                    aria-describedby={id}
                    onClick={handleMonthClick}
                    sx={{
                        textTransform: 'none',
                        color: 'text.primary',
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {monthLabel}
                    </Typography>
                </Button>
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    slotProps={{
                        paper: {
                            sx: {
                                p: 2,
                                width: 300,
                                borderRadius: 4
                            }
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <IconButton onClick={() => handleYearChange(-1)} size="small">
                            <ChevronLeft size={20} />
                        </IconButton>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {currentDate.getFullYear()}
                        </Typography>
                        <IconButton onClick={() => handleYearChange(1)} size="small">
                            <ChevronRight size={20} />
                        </IconButton>
                    </Box>
                    <Grid container spacing={1}>
                        {Array.from({ length: 12 }).map((_, index) => (
                            <Grid size={4} key={index}>
                                <Button
                                    fullWidth
                                    onClick={() => handleMonthSelect(index)}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: currentDate.getMonth() === index ? 'primary.main' : 'transparent',
                                        color: currentDate.getMonth() === index ? 'primary.contrastText' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: currentDate.getMonth() === index ? 'primary.dark' : 'action.hover'
                                        }
                                    }}
                                >
                                    {new Date(2000, index).toLocaleDateString('en-US', { month: 'short' })}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Popover>
                <IconButton onClick={handleNextMonth}>
                    <ChevronRight />
                </IconButton>
            </Box>

            <Grid container spacing={0.5} sx={{ maxWidth: 'min(600px, calc((100vh - 450px) * 7 / 6))', mx: 'auto' }}>
                {DAYS.map(day => (
                    <Grid size={12 / 7} key={day} sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {day}
                        </Typography>
                    </Grid>
                ))}

                {days.map((date, index) => {
                    if (!date) {
                        return <Grid size={12 / 7} key={`empty-${index}`} />;
                    }

                    const dayEntries = getEntriesForDate(date);
                    const hasEntry = dayEntries.length > 0;
                    const isToday = new Date().toDateString() === date.toDateString();

                    // Find sticker if any entry has one
                    const stickerEntry = dayEntries.find(e => e.sticker_id);
                    const sticker = stickerEntry ? (
                        stickers.find(s => s.id === stickerEntry.sticker_id) ||
                        SYSTEM_STICKERS.find(s => s.id === stickerEntry.sticker_id) ||
                        (stickerEntry.sticker_id?.startsWith('http') ? { id: stickerEntry.sticker_id, url: stickerEntry.sticker_id, owner_id: 'unknown' } : null)
                    ) : null;

                    return (
                        <Grid size={12 / 7} key={date.toISOString()}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Box
                                    onClick={() => onDateSelect(date)}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        bgcolor: 'transparent',
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                >
                                    {/* Top Strip with Day Number */}
                                    <Box sx={{
                                        p: 0.25,
                                        display: 'flex',
                                        justifyContent: 'flex-start'
                                    }}>
                                        <Box sx={{
                                            width: 28,
                                            height: 28,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: isToday ? 'primary.main' : 'transparent',
                                            color: isToday ? 'primary.contrastText' : 'text.primary',
                                            fontWeight: isToday ? 600 : 400,
                                            fontSize: '0.9rem'
                                        }}>
                                            {date.getDate()}
                                        </Box>
                                    </Box>

                                    {/* Bottom Square for Sticker/Stamp */}
                                    <Box sx={{
                                        width: '100%',
                                        aspectRatio: '1/1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 0.25
                                    }}>
                                        {sticker ? (
                                            <Box
                                                component="img"
                                                src={sticker.url}
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
                                                }}
                                            />
                                        ) : hasEntry ? (
                                            <Flower
                                                size={32}
                                                color={theme.palette.primary.main}
                                                style={{ opacity: 0.6 }}
                                            />
                                        ) : null}
                                    </Box>
                                </Box>
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
