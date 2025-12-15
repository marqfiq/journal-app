import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment, Chip, Grid, Card, CardContent } from '@mui/material';
import { Search as SearchIcon, Calendar, MapPin } from 'lucide-react';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = ['Happy memories', 'Last week', 'Gratitude', 'Travel', 'Dreams'];

export default function Search() {
    const [query, setQuery] = useState('');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [results, setResults] = useState<JournalEntry[]>([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            const data = await JournalService.getEntries(user.uid);
            setEntries(data);
        }
        loadEntries();
    }, [user]);

    useEffect(() => {
        if (query.trim()) {
            const filtered = JournalService.searchEntries(entries, query);
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query, entries]);

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
    };

    const truncateText = (html: string, maxLength: number = 150) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', pt: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
                    Search Memories
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Find specific moments, feelings, or thoughts from your past.
                </Typography>
            </Box>

            <TextField
                fullWidth
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon size={24} color="#9ca3af" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        fontSize: '1.1rem',
                        boxShadow: (theme) => theme.palette.mode === 'light' ? '0px 4px 20px rgba(0,0,0,0.05)' : '0px 4px 20px rgba(0,0,0,0.2)',
                        '& fieldset': { border: 'none' },
                        py: 1
                    }
                }}
            />

            <AnimatePresence>
                {!query && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                            {SUGGESTIONS.map((suggestion) => (
                                <Chip
                                    key={suggestion}
                                    label={suggestion}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                                    }}
                                />
                            ))}
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            <Box sx={{ mt: 6 }}>
                {query && (
                    <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        {results.length} Result{results.length !== 1 ? 's' : ''}
                    </Typography>
                )}

                <Grid container spacing={3}>
                    {results.map((entry, index) => (
                        <Grid size={{ xs: 12 }} key={entry.id}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card
                                    sx={{
                                        cursor: 'pointer',
                                        borderRadius: 3,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0px 8px 24px rgba(0,0,0,0.06)'
                                        }
                                    }}
                                    onClick={() => navigate(`/journal/${entry.id}`)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Calendar size={14} />
                                                {new Date(entry.date).toLocaleDateString()}
                                            </Typography>
                                            {entry.mood > 0 && (
                                                <Chip
                                                    label={['', 'Happy', 'Sad', 'Excited', 'Calm', 'Anxious'][entry.mood]}
                                                    size="small"
                                                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(224, 176, 182, 0.2)', color: 'primary.main' }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            {truncateText(entry.text)}
                                        </Typography>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {entry.tags.map(tag => (
                                                    <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ borderColor: 'rgba(0,0,0,0.1)' }} />
                                                ))}
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {query && results.length === 0 && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                        No memories found matching "{query}"
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
