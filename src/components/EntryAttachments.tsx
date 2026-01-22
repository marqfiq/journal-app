import React from 'react';
import { Box, Tooltip } from '@mui/material';
import ScrapbookGallery from './ScrapbookGallery';

interface EntryAttachmentsProps {
    sticker?: { id: string; url: string } | null;
    images?: string[];
    onStickerClick: (event: React.MouseEvent<HTMLElement>) => void;
    onImageClick: (index: number) => void;
}

export default function EntryAttachments({
    sticker,
    images,
    onStickerClick,
    onImageClick
}: EntryAttachmentsProps) {
    if (!sticker && (!images || images.length === 0)) {
        return null;
    }

    return (
        <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center', gap: 4, position: 'relative', mb: 2 }}>
            {sticker && (
                <Tooltip title="Change Sticker">
                    <Box
                        component="img"
                        src={sticker.url}
                        alt="sticker"
                        width={80}
                        onClick={onStickerClick}
                        sx={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                            zIndex: 10,
                            objectFit: 'contain',
                            height: 80
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
        </Box>
    );
}
