import React from 'react';
import { Box, Tooltip, Skeleton } from '@mui/material';
import ScrapbookGallery from './ScrapbookGallery';

interface EntryAttachmentsProps {
    sticker?: { id: string; url: string } | null;
    images?: string[];
    onStickerClick: (event: React.MouseEvent<HTMLElement>) => void;
    onImageClick: (index: number) => void;
    uploading?: boolean;
}

export default function EntryAttachments({
    sticker,
    images,
    onStickerClick,
    onImageClick,
    uploading = false
}: EntryAttachmentsProps) {
    if (!sticker && (!images || images.length === 0) && !uploading) {
        return null;
    }

    return (
        <Box sx={{ 
            minHeight: { xs: 60, sm: 80 }, 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 2, sm: 4 }, 
            position: 'relative', 
            mb: 2,
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { display: 'none' }
        }}>
            {sticker && (
                <Tooltip title="Change Sticker">
                    <Box
                        component="img"
                        src={sticker.url}
                        alt="sticker"
                        onClick={onStickerClick}
                        sx={{
                            width: { xs: 60, sm: 80 },
                            height: { xs: 60, sm: 80 },
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                            zIndex: 10,
                            objectFit: 'contain',
                            flexShrink: 0
                        }}
                    />
                </Tooltip>
            )}

            {images && images.length > 0 && (
                <ScrapbookGallery
                    images={images}
                    onImageClick={onImageClick}
                />
            )}

            {uploading && (
                <Box sx={{ 
                    width: { xs: 60, sm: 80 },
                    height: { xs: 60, sm: 80 },
                    position: 'relative',
                    flexShrink: 0,
                    ml: (images && images.length > 0) ? -4 : 0, // Stacked look
                    transform: 'rotate(-6deg)' // Matching scrapbook tilt
                }}>
                    <Skeleton
                        variant="rectangular"
                        width="100%"
                        height="100%"
                        sx={{
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            opacity: 0.15,
                            border: '3px solid white',
                            boxShadow: 3
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
