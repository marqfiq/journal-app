import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Smile, Sticker as StickerIcon, Image as ImageIcon } from 'lucide-react';

interface EntryHeaderActionsProps {
    currentMood: number;
    onMoodClick: (event: React.MouseEvent<HTMLElement>) => void;
    onStickerClick: (event: React.MouseEvent<HTMLElement>) => void;
    onImageClick: () => void;
}

export default function EntryHeaderActions({
    currentMood,
    onMoodClick,
    onStickerClick,
    onImageClick
}: EntryHeaderActionsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={onMoodClick} color={currentMood > 0 ? 'primary' : 'default'} size="small">
                <Smile size={20} />
            </IconButton>

            <IconButton onClick={onStickerClick} size="small">
                <StickerIcon size={20} />
            </IconButton>

            <IconButton onClick={onImageClick} size="small">
                <ImageIcon size={20} />
            </IconButton>
        </Box>
    );
}
