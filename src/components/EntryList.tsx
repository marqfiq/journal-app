import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, TextField, InputAdornment, Skeleton, Grid } from '@mui/material';
import { Search, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function EntryList() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            try {
                const data = await JournalService.getEntries(user.uid);
                setEntries(data);
                setFilteredEntries(data);
            } catch (error) {
                console.error("Failed to load entries", error);
            } finally {
                setLoading(false);
            }
        }
        loadEntries();
    }, [user]);

    useEffect(() => {
        const results = JournalService.searchEntries(entries, searchQuery);
        setFilteredEntries(results);
    }, [searchQuery, entries]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateText = (html: string, maxLength: number = 150) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
                ))}
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    placeholder="Search your memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={20} color="#9ca3af" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.03)'
                    }}
                />
            </Box>

            {filteredEntries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <Typography variant="h6">No entries found</Typography>
                    <Typography variant="body2">Start writing to create your first memory.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredEntries.map((entry, index) => (
                        <Grid size={{ xs: 12 }} key={entry.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0px 8px 24px rgba(0,0,0,0.06)'
                                        }
                                    }}
                                    onClick={() => navigate(`/journal/${entry.id}`)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                                <CalendarIcon size={16} />
                                                <Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
                                                    {formatDate(entry.date)}
                                                </Typography>
                                            </Box>
                                            {entry.mood > 0 && (
                                                <Chip
                                                    label={['Neutral', 'Happy', 'Sad', 'Excited', 'Calm', 'Anxious'][entry.mood] || 'Mood'}
                                                    size="small"
                                                    sx={{ bgcolor: 'action.hover', color: 'primary.main', fontWeight: 600 }}
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: 'text.primary' }}>
                                            {truncateText(entry.text)}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {entry.tags?.map(tag => (
                                                <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ borderColor: 'divider' }} />
                                            ))}
                                            {entry.location && (
                                                <Chip
                                                    icon={<MapPin size={14} />}
                                                    label={entry.location.address.split(',')[0]}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ borderColor: 'divider' }}
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
