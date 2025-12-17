import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Paper, IconButton, useMediaQuery, useTheme, Divider, Chip } from '@mui/material';
import { Plus, Edit2, Trash2, X, Eye } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import JournalSidebarItem from '../components/JournalSidebarItem';
import DeleteDialog from '../components/DeleteDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useStickers } from '../hooks/useStickers';
import { SYSTEM_STICKERS } from '../constants/stickers';
import ImageLightbox from '../components/ImageLightbox';
import EntryHeader from '../components/EntryHeader';
import EntryAttachments from '../components/EntryAttachments';
import { StorageService } from '../services/storage';
import { MAX_IMAGES_PER_ENTRY } from '../constants/config';

export default function Journal() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    // Sticker Hook
    const { stickers, addSticker, removeSticker, reorderStickers, canManage } = useStickers();

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Resizable Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(350);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);

    // Image Upload State
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const [isReordering, setIsReordering] = useState(false);

    // --- LIFTED STATE FOR ENTRY HEADER ---
    const [moodAnchor, setMoodAnchor] = useState<null | HTMLElement>(null);
    const [stickerAnchor, setStickerAnchor] = useState<null | HTMLElement>(null);
    const [dateOpen, setDateOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);


    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            const data = await JournalService.getEntries(user.uid);
            setEntries(data);
            if (data.length > 0 && !isMobile && !selectedEntryId) {
                // If returning from view, restore selection
                if (location.state?.selectedEntryId) {
                    setSelectedEntryId(location.state.selectedEntryId);
                } else {
                    setSelectedEntryId(data[0].id);
                }
            } else if (location.state?.selectedEntryId) {
                // Even on mobile, or generally if state is passed, assume we might want to select it
                setSelectedEntryId(location.state.selectedEntryId);
            }
        }
        loadEntries();
    }, [user, isMobile, location.state]);

    const selectedEntry = entries.find(e => e.id === selectedEntryId);

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

    const handleUpdateEntry = async (updates: Partial<JournalEntry>) => {
        if (!selectedEntryId) return;

        setEntries(prevEntries => prevEntries.map(e =>
            e.id === selectedEntryId ? { ...e, ...updates } : e
        ));

        try {
            await JournalService.updateEntry(selectedEntryId, updates);
        } catch (error) {
            console.error("Failed to update entry", error);
        }
    };

    const handleDeleteImage = async (index: number) => {
        if (!selectedEntryId || !selectedEntry?.image_urls) return;
        const urlToDelete = selectedEntry.image_urls[index];
        const newImageUrls = selectedEntry.image_urls.filter((_, i) => i !== index);

        // Optimistic update
        setEntries(prevEntries => prevEntries.map(e =>
            e.id === selectedEntryId ? { ...e, image_urls: newImageUrls } : e
        ));

        if (newImageUrls.length === 0) {
            setLightboxOpen(false);
        } else if (index >= newImageUrls.length) {
            setLightboxIndex(newImageUrls.length - 1);
        }

        try {
            await StorageService.deleteImage(urlToDelete);
            await JournalService.updateEntry(selectedEntryId, { image_urls: newImageUrls });
        } catch (error) {
            console.error("Failed to delete image", error);
            // Revert logic could go here
        }
    };

    const handleImageClick = () => {
        imageInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files.length || !user || !selectedEntry) return;
        const currentImageCount = selectedEntry.image_urls?.length || 0;
        const newFiles = Array.from(event.target.files);

        if (currentImageCount + newFiles.length > MAX_IMAGES_PER_ENTRY) {
            alert(`You can only add up to ${MAX_IMAGES_PER_ENTRY} images per entry.`);
            return;
        }

        setUploading(true);
        const urls: string[] = [];

        try {
            for (const file of newFiles) {
                if (!file.type.startsWith('image/')) continue;
                const url = await StorageService.uploadImage(file, user.uid);
                urls.push(url);
            }

            if (urls.length > 0) {
                const newImageUrls = [...(selectedEntry.image_urls || []), ...urls];
                handleUpdateEntry({ image_urls: newImageUrls });
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
            event.target.value = ''; // Reset input
        }
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
                <Typography variant="h4" component="h1">
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
                    gap: isMobile ? 0 : 0,
                    mx: -2,
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
                        pl: 2,
                        ml: -2,
                        pt: 2,
                        mt: -2,
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
                    minWidth: 0
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
                                        '&::-webkit-scrollbar-track': { my: 2 },
                                        display: 'flex',
                                        flexDirection: 'column'
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

                                    {/* --- HEADER --- */}
                                    <EntryHeader
                                        entry={selectedEntry}
                                        onUpdate={handleUpdateEntry}
                                        onImageClick={handleImageClick}
                                        stickers={stickers}
                                        canManageStickers={canManage}
                                        onAddSticker={addSticker}
                                        onRemoveSticker={removeSticker}
                                        isReordering={isReordering}
                                        onReorderToggle={() => setIsReordering(!isReordering)}
                                        onStickerReorder={reorderStickers}

                                        // Controlled Props
                                        moodAnchor={moodAnchor}
                                        onMoodClick={(e) => setMoodAnchor(e.currentTarget)}
                                        onMoodClose={() => setMoodAnchor(null)}
                                        stickerAnchor={stickerAnchor}
                                        onStickerClick={(e) => setStickerAnchor(e.currentTarget)}
                                        onStickerClose={() => setStickerAnchor(null)}
                                        dateOpen={dateOpen}
                                        onDateOpen={() => setDateOpen(true)}
                                        onDateClose={() => setDateOpen(false)}
                                        timeOpen={timeOpen}
                                        onTimeOpen={() => setTimeOpen(true)}
                                        onTimeClose={() => setTimeOpen(false)}

                                        customActions={
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => navigate(`/journal/${selectedEntry.id}`, {
                                                        state: {
                                                            from: '/journal',
                                                            label: 'Journal',
                                                            context: { selectedEntryId: selectedEntry.id }
                                                        }
                                                    })}
                                                    color="primary"
                                                    title="View Full Page"
                                                    size="small"
                                                >
                                                    <Eye size={20} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => navigate(`/journal/${selectedEntry.id}`, {
                                                        state: {
                                                            isEditing: true,
                                                            from: '/journal',
                                                            label: 'Journal',
                                                            context: { selectedEntryId: selectedEntry.id }
                                                        }
                                                    })}
                                                    color="primary"
                                                    title="Edit Text"
                                                    size="small"
                                                >
                                                    <Edit2 size={20} />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteClick(selectedEntry.id)}
                                                    color="error"
                                                    title="Delete Entry"
                                                    size="small"
                                                >
                                                    <Trash2 size={20} />
                                                </IconButton>
                                            </Box>
                                        }
                                    />

                                    {/* --- ATTACHMENTS --- */}
                                    <EntryAttachments
                                        sticker={selectedSticker}
                                        images={selectedEntry?.image_urls}
                                        onStickerClick={(e) => setStickerAnchor(e.currentTarget)} // TRIGGER STICKER POPOVER
                                        onImageClick={(index) => {
                                            setLightboxIndex(index);
                                            setLightboxOpen(true);
                                        }}
                                    />

                                    <Divider sx={{ mb: 3 }} />

                                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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
                                    </Box>
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
                onDelete={handleDeleteImage}
            />

            <input
                type="file"
                ref={imageInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/*"
                onChange={handleFileUpload}
            />
        </Box>
    );
}
