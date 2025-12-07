import React, { useState, useRef } from 'react';
import { Box, IconButton, Popover, Paper, Typography, Dialog, DialogTitle, DialogContent, Stack, CircularProgress, Tooltip } from '@mui/material';
import { Smile, Sticker as StickerIcon, Image as ImageIcon, X, Upload, Plus } from 'lucide-react';
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

    const { stickers, loading: stickersLoading, addSticker, removeSticker, canManage } = useStickers();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSticker, setUploadingSticker] = useState(false);

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
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                                {stickers.map((sticker) => (
                                    <Box key={sticker.id}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                '&:hover .delete-btn': { opacity: 1 },
                                                width: '100%',
                                                paddingTop: '100%', // Square aspect ratio container
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={sticker.url}
                                                alt="sticker"
                                                onClick={() => handleStickerSelect(sticker.id)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain', // Ensure full image is visible
                                                    cursor: 'pointer',
                                                    '&:hover': { transform: 'scale(1.1)' },
                                                    transition: 'transform 0.2s'
                                                }}
                                            />
                                            {canManage && (
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
                                                        p: 0.5
                                                    }}
                                                >
                                                    <X size={12} />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Popover>

                {/* Image Dialog */}
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
