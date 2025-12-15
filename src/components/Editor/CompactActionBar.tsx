import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Popover, Paper, Typography, Dialog, DialogTitle, DialogContent, Stack, CircularProgress, Tooltip } from '@mui/material';
import { Smile, Sticker as StickerIcon, Image as ImageIcon, X, Upload, Plus, Move } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStickers } from '../../hooks/useStickers';
import DeleteDialog from '../DeleteDialog';

interface CompactActionBarProps {
    currentMood: number;
    onMoodChange: (mood: number) => void;
    onStickerSelect: (stickerId: string) => void;
    onImagesAdd: (urls: string[]) => void;
}

export default function CompactActionBar({ currentMood, onMoodChange, onStickerSelect, onImagesAdd }: CompactActionBarProps) {
    const [moodAnchor, setMoodAnchor] = useState<null | HTMLElement>(null);
    const [stickerAnchor, setStickerAnchor] = useState<null | HTMLElement>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const { stickers, loading: stickersLoading, addSticker, removeSticker, reorderStickers, canManage } = useStickers();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSticker, setUploadingSticker] = useState(false);

    // Reorder State
    const [isReordering, setIsReordering] = useState(false);
    const [localStickers, setLocalStickers] = useState(stickers);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const itemsRef = useRef<Map<string, HTMLDivElement>>(new Map());

    // Sync local stickers with context stickers when not reordering
    useEffect(() => {
        if (!isReordering) {
            setLocalStickers(stickers);
        }
    }, [stickers, isReordering]);

    const handleReorderToggle = () => {
        setIsReordering(!isReordering);
    };

    const handleDrag = (info: any, activeId: string) => {
        // Find which item we are hovering over
        const point = { x: info.point.x, y: info.point.y };

        let overId: string | null = null;

        // Check all items to see if we are over one
        itemsRef.current.forEach((element, id) => {
            if (id === activeId) return;

            const rect = element.getBoundingClientRect();
            if (
                point.x >= rect.left &&
                point.x <= rect.right &&
                point.y >= rect.top &&
                point.y <= rect.bottom
            ) {
                overId = id;
            }
        });

        if (overId && overId !== activeId) {
            const oldIndex = localStickers.findIndex(s => s.id === activeId);
            const newIndex = localStickers.findIndex(s => s.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newStickers = [...localStickers];
                const [moved] = newStickers.splice(oldIndex, 1);
                newStickers.splice(newIndex, 0, moved);
                setLocalStickers(newStickers);
            }
        }
    };

    const handleDragEnd = () => {
        reorderStickers(localStickers);
    };

    const handleStickerPointerDown = (e: React.PointerEvent) => {
        if (isReordering) return;

        longPressTimerRef.current = setTimeout(() => {
            setIsReordering(true);
        }, 500);
    };

    const handleStickerPointerUp = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };

    // Exit reorder mode when clicking outside stickers (on the container)
    const handleContainerClick = (e: React.MouseEvent) => {
        // Only exit if clicking the container background, not the stickers themselves
        // (Stickers stop propagation or we check target)
        if (isReordering && e.target === e.currentTarget) {
            setIsReordering(false);
        }
    };

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [stickerToDelete, setStickerToDelete] = useState<string | null>(null);

    // Mood Handlers
    const handleMoodClick = (event: React.MouseEvent<HTMLElement>) => {
        setMoodAnchor(event.currentTarget);
    };

    const handleMoodClose = () => {
        setMoodAnchor(null);
    };

    const handleMoodSelect = (mood: number) => {
        onMoodChange(mood);
        handleMoodClose();
    };

    // Sticker Handlers
    const handleStickerClick = (event: React.MouseEvent<HTMLElement>) => {
        setStickerAnchor(event.currentTarget);
    };

    const handleStickerClose = () => {
        setStickerAnchor(null);
    };

    const handleStickerSelect = (stickerId: string) => {
        onStickerSelect(stickerId);
        handleStickerClose();
    };

    const handleStickerUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleStickerFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Capture input to reset later
        const input = event.target;

        setUploadingSticker(true);
        try {
            await addSticker(file);
        } catch (error) {
            console.error("Failed to upload sticker", error);
        } finally {
            setUploadingSticker(false);
            // Reset input to allow selecting the same file again
            input.value = '';
        }
    };

    const handleStickerDeleteClick = (e: React.MouseEvent, stickerUrl: string) => {
        e.stopPropagation();
        setStickerToDelete(stickerUrl);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (stickerToDelete) {
            await removeSticker(stickerToDelete);
            setDeleteDialogOpen(false);
            setStickerToDelete(null);
        }
    };

    // Image Handlers
    const handleImageClick = () => {
        setImageDialogOpen(true);
    };

    const handleImageClose = () => {
        setImageDialogOpen(false);
    };

    // Mock Image Upload
    const handleImageUpload = () => {
        // In a real app, this would handle file upload to Firebase Storage
        // For now, we'll just mock it with a placeholder URL
        const mockUrl = `https://picsum.photos/seed/${Date.now()}/400/300`;
        onImagesAdd([mockUrl]);
        handleImageClose();
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 4,
                    zIndex: 1000,
                    bgcolor: 'background.paper'
                }}
            >
                <IconButton onClick={handleMoodClick} color={currentMood > 0 ? 'primary' : 'default'}>
                    <Smile />
                </IconButton>

                <IconButton onClick={handleStickerClick}>
                    <StickerIcon />
                </IconButton>

                <IconButton onClick={handleImageClick}>
                    <ImageIcon />
                </IconButton>

                {/* Mood Popover */}
                <Popover
                    open={Boolean(moodAnchor)}
                    anchorEl={moodAnchor}
                    onClose={handleMoodClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, textAlign: 'center' }}>How are you?</Typography>
                        <Stack direction="row" spacing={1}>
                            {[1, 2, 3, 4, 5].map((m) => (
                                <IconButton
                                    key={m}
                                    onClick={() => handleMoodSelect(m)}
                                    color={currentMood === m ? 'primary' : 'default'}
                                    sx={{ fontSize: '1.5rem' }}
                                >
                                    {['😢', '😕', '😐', '🙂', '😄'][m - 1]}
                                </IconButton>
                            ))}
                        </Stack>
                    </Box>
                </Popover>

                {/* Sticker Popover */}
                <Popover
                    open={Boolean(stickerAnchor)}
                    anchorEl={stickerAnchor}
                    onClose={handleStickerClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
                    slotProps={{
                        root: {
                            slotProps: {
                                backdrop: {
                                    invisible: true
                                }
                            }
                        }
                    }}
                    // Keep mounted to avoid re-rendering images
                    keepMounted
                >
                    <Box sx={{ p: 2, width: 500, maxHeight: 500, overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">Stickers</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title={isReordering ? "Done Reordering" : "Reorder Stickers"}>
                                    <IconButton
                                        size="small"
                                        onClick={handleReorderToggle}
                                        color={isReordering ? "primary" : "default"}
                                    >
                                        <Move size={16} />
                                    </IconButton>
                                </Tooltip>
                                {!canManage && (
                                    <Typography variant="caption" color="text.secondary">
                                        Log in to manage
                                    </Typography>
                                )}
                                <Tooltip title={canManage ? "Upload Sticker" : "Log in to add stickers"}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handleStickerUploadClick}
                                            disabled={!canManage || uploadingSticker}
                                        >
                                            {uploadingSticker ? <CircularProgress size={16} /> : <Plus size={16} />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleStickerFileChange}
                            />
                        </Box>

                        {stickersLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <Box
                                sx={{ p: 1 }}
                                onClick={handleContainerClick}
                            >
                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(5, 1fr)',
                                        gap: 1,
                                    }}
                                >
                                    {localStickers.map((sticker) => (
                                        <motion.div
                                            key={sticker.id}
                                            layout
                                            drag={isReordering}
                                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                            dragElastic={1}
                                            onDrag={(e, info) => handleDrag(info, sticker.id)}
                                            onDragEnd={handleDragEnd}
                                            whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
                                            animate={isReordering ? {
                                                rotate: [-1, 1, -1],
                                                transition: {
                                                    repeat: Infinity,
                                                    duration: 0.3
                                                }
                                            } : { rotate: 0 }}
                                            style={{ position: 'relative', touchAction: 'none' }}
                                            ref={(el) => {
                                                if (el) itemsRef.current.set(sticker.id, el);
                                                else itemsRef.current.delete(sticker.id);
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    '&:hover .delete-btn': { opacity: isReordering ? 0 : 1 },
                                                    width: '100%',
                                                    paddingTop: '100%', // Square aspect ratio container
                                                    overflow: 'hidden',
                                                    cursor: isReordering ? 'grab' : 'pointer',
                                                }}
                                                onPointerDown={handleStickerPointerDown}
                                                onPointerUp={handleStickerPointerUp}
                                                onPointerLeave={handleStickerPointerUp}
                                            >
                                                <Box
                                                    component="img"
                                                    src={sticker.url}
                                                    alt="sticker"
                                                    onClick={() => !isReordering && handleStickerSelect(sticker.id)}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        pointerEvents: 'none', // Let clicks pass to container for drag
                                                    }}
                                                />
                                                {canManage && !isReordering && (
                                                    <IconButton
                                                        className="delete-btn"
                                                        size="small"
                                                        onClick={(e) => handleStickerDeleteClick(e, sticker.url)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                            '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' },
                                                            width: 20,
                                                            height: 20,
                                                            p: 0.5,
                                                            pointerEvents: 'auto'
                                                        }}
                                                    >
                                                        <X size={12} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </motion.div>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Popover>
                <Dialog open={imageDialogOpen} onClose={handleImageClose} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Add Images
                        <IconButton onClick={handleImageClose} size="small"><X /></IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box
                            sx={{
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 4,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                            onClick={handleImageUpload}
                        >
                            <Upload size={48} color="#9e9e9e" />
                            <Typography color="text.secondary" sx={{ mt: 2 }}>
                                Click to upload or drag and drop
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                (Max 3 images)
                            </Typography>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Paper>

            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Sticker?"
                description="Are you sure you want to delete this sticker? This action cannot be undone."
            />
        </>
    );
}
