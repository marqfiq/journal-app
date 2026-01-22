import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Smile, Sticker as StickerIcon, Image as ImageIcon } from 'lucide-react';

interface EntryHeaderActionsProps {
    currentMood: number;
    onMoodClick: (event: React.MouseEvent<HTMLElement>) => void;
    onStickerClick: (event: React.MouseEvent<HTMLElement>) => void;
    onImageClick: () => void;
    disableImages?: boolean;
}

export default function EntryHeaderActions({
    currentMood,
    onMoodClick,
    onStickerClick,
    onImageClick,
    disableImages = false
}: EntryHeaderActionsProps) {
    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Set Mood">
                <IconButton onClick={onMoodClick} color={currentMood > 0 ? 'primary' : 'default'} size="small">
                    <Smile size={20} />
                </IconButton>
            </Tooltip>

            <Tooltip title="Add Sticker">
                <IconButton onClick={onStickerClick} size="small">
                    <StickerIcon size={20} />
                </IconButton>
            </Tooltip>

            <Tooltip title={disableImages ? "Max 3 images" : "Add Photos"}>
                <span>
                    <IconButton onClick={onImageClick} size="small" disabled={disableImages}>
                        <ImageIcon size={20} />
                    </IconButton>
                </span>
            </Tooltip>
        </Box>
    );
}
