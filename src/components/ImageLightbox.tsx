import React, { useEffect, useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteDialog from './DeleteDialog';

interface ImageLightboxProps {
    open: boolean;
    onClose: () => void;
    images: string[];
    initialIndex?: number;
    onDelete?: (index: number) => void;
}

export default function ImageLightbox({ open, onClose, images, initialIndex = 0, onDelete }: ImageLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (open) {
            setCurrentIndex(initialIndex);
        }
    }, [open, initialIndex]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % images.length);
        if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        if (e.key === 'Escape') onClose();
    };

    useEffect(() => {
        if (open) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, images.length]);

    if (!open) return null;

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(5px)'
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        outline: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 2000, display: 'flex', gap: 2 }}>
                        {onDelete && (
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteDialogOpen(true);
                                }}
                                sx={{
                                    color: 'white',
                                    bgcolor: 'rgba(255,0,0,0.5)',
                                    '&:hover': { bgcolor: 'rgba(255,0,0,0.7)' },
                                }}
                            >
                                <Trash2 size={24} />
                            </IconButton>
                        )}
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                            }}
                        >
                            <X size={24} />
                        </IconButton>
                    </Box>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrev}
                                sx={{
                                    position: 'absolute',
                                    left: 20,
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                    zIndex: 2000
                                }}
                            >
                                <ChevronLeft size={32} />
                            </IconButton>

                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 20,
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                                    zIndex: 2000
                                }}
                            >
                                <ChevronRight size={32} />
                            </IconButton>
                        </>
                    )}

                    {/* Image */}
                    <AnimatePresence mode="wait">
                        {images[currentIndex] && (
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`View ${currentIndex + 1}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    borderRadius: 8,
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                                }}
                                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                            />
                        )}
                    </AnimatePresence>
                </Box>
            </Modal>
            <DeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={() => {
                    if (onDelete) onDelete(currentIndex);
                    setDeleteDialogOpen(false);
                }}
                title="Delete Image?"
                description="Are you sure you want to delete this image? This action cannot be undone."
            />
        </>
    );
}
