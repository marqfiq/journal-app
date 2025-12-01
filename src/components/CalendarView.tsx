import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Grid, Paper, Tooltip, Badge } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';

interface CalendarViewProps {
    entries: JournalEntry[];
    onDateSelect: (date: Date) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ entries, onDateSelect }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

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
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                <IconButton onClick={handlePrevMonth}>
                    <ChevronLeft />
                </IconButton>
                <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', fontWeight: 600 }}>
                    {monthLabel}
                </Typography>
                <IconButton onClick={handleNextMonth}>
                    <ChevronRight />
                </IconButton>
            </Box>

            <Grid container spacing={1}>
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

                    return (
                        <Grid size={12 / 7} key={date.toISOString()}>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Box
                                    onClick={() => onDateSelect(date)}
                                    sx={{
                                        height: 40,
                                        width: 40,
                                        mx: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        bgcolor: isToday ? 'primary.main' : (hasEntry ? 'rgba(224, 176, 182, 0.2)' : 'transparent'),
                                        color: isToday ? 'white' : (hasEntry ? 'primary.main' : 'text.primary'),
                                        fontWeight: (isToday || hasEntry) ? 600 : 400,
                                        border: isToday ? 'none' : '1px solid transparent',
                                        '&:hover': {
                                            bgcolor: isToday ? 'primary.dark' : 'rgba(0,0,0,0.05)'
                                        }
                                    }}
                                >
                                    {date.getDate()}
                                </Box>
                                {hasEntry && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5, gap: 0.5 }}>
                                        {dayEntries.slice(0, 3).map((_, i) => (
                                            <Box key={i} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                        ))}
                                    </Box>
                                )}
                            </motion.div>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
}
