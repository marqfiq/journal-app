import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Paper, IconButton, useMediaQuery, useTheme, Divider, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, Calendar, MapPin, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import JournalSidebarItem from '../components/JournalSidebarItem';
import DeleteDialog from '../components/DeleteDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useStickers } from '../hooks/useStickers';
import { SYSTEM_STICKERS } from '../constants/stickers';
import ImageLightbox from '../components/ImageLightbox';
import ScrapbookGallery from '../components/ScrapbookGallery';

export default function Journal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Sticker Hook
    const { stickers } = useStickers();

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

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
    // Fallback to SYSTEM_STICKERS is handled by useStickers hook logic if needed, 
    // but here we just want to find it in the available stickers.
    // If it's a legacy system sticker ID that isn't in the user's list for some reason, 
    // we might want to fallback to SYSTEM_STICKERS import, but useStickers should cover it.
    // Actually, let's keep SYSTEM_STICKERS import as a fallback just in case.
    const selectedSticker = selectedEntry ? (
        stickers.find(s => s.id === selectedEntry.sticker_id) ||
        SYSTEM_STICKERS.find(s => s.id === selectedEntry.sticker_id) ||
        (selectedEntry.sticker_id?.startsWith('http') ? { id: selectedEntry.sticker_id, url: selectedEntry.sticker_id, owner_id: 'unknown' } : null)
    ) : null;

    const handleDeleteClick = (id: string) => {
        setEntryToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!entryToDelete) return;

        await JournalService.deleteEntry(entryToDelete);
        setEntries(entries.filter(e => e.id !== entryToDelete));
        if (selectedEntryId === entryToDelete) {
            setSelectedEntryId(null);
        }
        setDeleteDialogOpen(false);
        setEntryToDelete(null);
    };

    // Resizing Logic
    const startResizing = React.useCallback(() => {
        isResizing.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    }, []);

    const stopResizing = React.useCallback(() => {
        isResizing.current = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
    }, []);

    const resize = React.useCallback((mouseMoveEvent: MouseEvent | TouchEvent) => {
        if (isResizing.current && containerRef.current) {
            let clientX;
            if ('touches' in mouseMoveEvent) {
                clientX = mouseMoveEvent.touches[0].clientX;
            } else {
                clientX = mouseMoveEvent.clientX;
            }

            const containerLeft = containerRef.current.getBoundingClientRect().left;
            const relativeX = clientX - containerLeft;

            // Constrain width between 250px and 600px
            const newWidth = Math.max(250, Math.min(relativeX, 600));
            setSidebarWidth(newWidth);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('touchend', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
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

            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 0 : 0, // Gap handled by resizer
                    mx: -2, // Expand container to allow padding
                    my: -2,
                    p: 2
                }}
            >
                {/* Sidebar List */}
                <Box
                    ref={sidebarRef}
                    sx={{
                        width: isMobile ? '100%' : sidebarWidth,
                        height: '100%',
                        overflowY: 'auto',
                        pr: isMobile ? 0 : 2,
                        pl: 2, // Add left padding for hover effect
                        ml: -2, // Pull back to align
                        pt: 2, // Add top padding
                        mt: -2, // Pull back to align
                        display: (isMobile && selectedEntryId) ? 'none' : 'block',
                        flexShrink: 0,
                        '&::-webkit-scrollbar-track': { my: 2 }
                    }}
                >
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
                </Box>

                {/* Resizer Handle (Desktop Only) */}
                {!isMobile && (
                    <Box
                        onMouseDown={startResizing}
                        onTouchStart={startResizing}
                        sx={{
                            width: 8,
                            cursor: 'col-resize',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            '&:hover .handle': { bgcolor: 'primary.main' },
                            '&:active .handle': { bgcolor: 'primary.main', width: 4 }
                        }}
                    >
                        <Box
                            className="handle"
                            sx={{
                                width: 2,
                                height: '20%',
                                bgcolor: 'divider',
                                borderRadius: 1,
                                transition: 'all 0.2s'
                            }}
                        />
                    </Box>
                )}

                {/* Detail View */}
                <Box sx={{
                    flex: 1,
                    height: '100%',
                    display: (isMobile && !selectedEntryId) ? 'none' : 'block',
                    minWidth: 0 // Prevent flex overflow
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
                                        bgcolor: 'background.paper',
                                        overflowY: 'auto',
                                        position: 'relative',
                                        border: 1,
                                        borderColor: 'divider',
                                        '&::-webkit-scrollbar-track': { my: 2 }
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

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, mt: isMobile ? 4 : 0 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 0.5, fontWeight: 700, lineHeight: 1.2 }}>
                                                    {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                                </Typography>

                                                {/* Mood (Next to Date, Vertically Aligned) */}
                                                {(selectedEntry.mood || 0) > 0 && (
                                                    <Box sx={{ fontSize: '1.8rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                                        {['😢', '😕', '😐', '🙂', '😄'][(selectedEntry.mood!) - 1]}
                                                    </Box>
                                                )}
                                            </Box>

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
                                            <IconButton
                                                onClick={() => navigate(`/journal/${selectedEntry.id}`)}
                                                color="primary"
                                                title="View Entry"
                                            >
                                                <Eye size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => navigate(`/journal/${selectedEntry.id}`, { state: { isEditing: true } })}
                                                color="primary"
                                                title="Edit Entry"
                                            >
                                                <Edit2 size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDeleteClick(selectedEntry.id)}
                                                color="error"
                                                title="Delete Entry"
                                            >
                                                <Trash2 size={20} />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Row 2: Sticker and Scrapbook Images */}
                                    {(selectedSticker || (selectedEntry.image_urls && selectedEntry.image_urls.length > 0)) && (
                                        <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center', gap: 4, position: 'relative', mb: 2 }}>
                                            {selectedSticker && (
                                                <Box
                                                    component="img"
                                                    src={selectedSticker.url}
                                                    alt="sticker"
                                                    width={80}
                                                    sx={{
                                                        zIndex: 10,
                                                        objectFit: 'contain',
                                                        height: 80
                                                    }}
                                                />
                                            )}

                                            {/* Scrapbook Images */}
                                            {selectedEntry.image_urls && selectedEntry.image_urls.length > 0 && (
                                                <ScrapbookGallery
                                                    images={selectedEntry.image_urls}
                                                    onImageClick={(index) => {
                                                        setLightboxIndex(index);
                                                        setLightboxOpen(true);
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    )}

                                    <Divider sx={{ mb: 3 }} />

                                    <div
                                        className="ProseMirror"
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
                                bgcolor: 'background.paper',
                                borderRadius: 4,
                                border: 2,
                                borderColor: 'divider',
                                borderStyle: 'dashed'
                            }}>
                                <Typography>Select an entry to read</Typography>
                            </Box>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Memory?"
                description="Are you sure you want to delete this journal entry? This action cannot be undone."
            />

            <ImageLightbox
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={selectedEntry?.image_urls || []}
                initialIndex={lightboxIndex}
            />
        </Box>
    );
}
