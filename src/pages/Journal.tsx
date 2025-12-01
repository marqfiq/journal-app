import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Paper, IconButton, useMediaQuery, useTheme, Divider, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, Calendar, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import JournalSidebarItem from '../components/JournalSidebarItem';
import { motion, AnimatePresence } from 'framer-motion';

export default function Journal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            const data = await JournalService.getEntries(user.uid);
            setEntries(data);
            if (data.length > 0 && !isMobile && !selectedEntryId) {
                setSelectedEntryId(data[0].id);
            }
        }
        loadEntries();
    }, [user, isMobile]);

    const selectedEntry = entries.find(e => e.id === selectedEntryId);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this memory?')) {
            await JournalService.deleteEntry(id);
            setEntries(entries.filter(e => e.id !== id));
            if (selectedEntryId === id) {
                setSelectedEntryId(null);
            }
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                    My Journal
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => navigate('/journal/new')}
                    sx={{ borderRadius: 3, px: 3 }}
                >
                    New Entry
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {/* Sidebar List */}
                <Grid size={{ xs: 12, md: 4 }} sx={{
                    height: '100%',
                    overflowY: 'auto',
                    pr: { md: 2 },
                    display: (isMobile && selectedEntryId) ? 'none' : 'block'
                }}>
                    {entries.map((entry) => (
                        <JournalSidebarItem
                            key={entry.id}
                            entry={entry}
                            isSelected={selectedEntryId === entry.id}
                            onClick={() => setSelectedEntryId(entry.id)}
                        />
                    ))}
                    {entries.length === 0 && (
                        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
                            No entries yet. Start writing!
                        </Typography>
                    )}
                </Grid>

                {/* Detail View */}
                <Grid size={{ xs: 12, md: 8 }} sx={{
                    height: '100%',
                    display: (isMobile && !selectedEntryId) ? 'none' : 'block'
                }}>
                    <AnimatePresence mode="wait">
                        {selectedEntry ? (
                            <motion.div
                                key={selectedEntry.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                style={{ height: '100%' }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 4,
                                        height: '100%',
                                        borderRadius: 4,
                                        bgcolor: 'white',
                                        overflowY: 'auto',
                                        position: 'relative'
                                    }}
                                >
                                    {isMobile && (
                                        <IconButton
                                            onClick={() => setSelectedEntryId(null)}
                                            sx={{ position: 'absolute', top: 16, left: 16 }}
                                        >
                                            <X />
                                        </IconButton>
                                    )}

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, mt: isMobile ? 4 : 0 }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', mb: 1 }}>
                                                {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Calendar size={16} />
                                                    <Typography variant="caption">
                                                        {new Date(selectedEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Typography>
                                                </Box>
                                                {selectedEntry.location && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <MapPin size={16} />
                                                        <Typography variant="caption">
                                                            {selectedEntry.location.address.split(',')[0]}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton onClick={() => navigate(`/journal/${selectedEntry.id}`)} color="primary">
                                                <Edit2 size={20} />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(selectedEntry.id)} color="error">
                                                <Trash2 size={20} />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ mb: 3 }} />

                                    <div
                                        className="prose prose-pink max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedEntry.text }}
                                    />

                                    {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                        <Box sx={{ mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            {selectedEntry.tags.map(tag => (
                                                <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" />
                                            ))}
                                        </Box>
                                    )}
                                </Paper>
                            </motion.div>
                        ) : (
                            <Box sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'text.secondary',
                                bgcolor: 'rgba(255,255,255,0.5)',
                                borderRadius: 4,
                                border: '2px dashed rgba(0,0,0,0.05)'
                            }}>
                                <Typography>Select an entry to read</Typography>
                            </Box>
                        )}
                    </AnimatePresence>
                </Grid>
            </Grid>
        </Box>
    );
}
