import { useState } from 'react';
import { Box, Typography, Paper, IconButton, Chip, Divider } from '@mui/material';
import { Edit2, MapPin } from 'lucide-react';
import { JournalEntry } from '../types';
import { SYSTEM_STICKERS } from '../constants/stickers';
import ImageLightbox from './ImageLightbox';
import { useStickers } from '../hooks/useStickers';
import ScrapbookGallery from './ScrapbookGallery';

interface ReadViewProps {
    entry: Partial<JournalEntry>;
    onEdit: () => void;
}

export default function ReadView({ entry, onEdit }: ReadViewProps) {
    const { stickers } = useStickers();
    // Try to find in dynamic list first (includes custom + system), fallback to static system list if needed
    // Try to find in dynamic list first, then system list, then fallback to using ID as URL if it looks like one (orphaned custom sticker)
    const selectedSticker = stickers.find(s => s.id === entry.sticker_id) ||
        SYSTEM_STICKERS.find(s => s.id === entry.sticker_id) ||
        (entry.sticker_id?.startsWith('http') ? { id: entry.sticker_id, url: entry.sticker_id, owner_id: 'unknown' } : null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                border: 1,
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 400
            }}
        >
            {/* Header */}
            <Box sx={{ p: 4, pb: 2 }}>
                {/* Row 1: Date, Mood, and Edit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" sx={{ fontFamily: 'Playfair Display', mb: 0.5, fontWeight: 700, lineHeight: 1.2 }}>
                                    {new Date(entry.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </Typography>

                                {/* Mood (Next to Date, Vertically Aligned) */}
                                {(entry.mood || 0) > 0 && (
                                    <Box sx={{ fontSize: '1.8rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                                        {['😢', '😕', '😐', '🙂', '😄'][(entry.mood!) - 1]}
                                    </Box>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                                <Typography variant="caption" sx={{ fontSize: '0.9rem' }}>
                                    {new Date(entry.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                                {entry.location && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MapPin size={14} />
                                        <Typography variant="caption">
                                            {entry.location.address.split(',')[0]}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <IconButton onClick={onEdit} color="primary" sx={{ bgcolor: 'action.hover' }}>
                        <Edit2 size={20} />
                    </IconButton>
                </Box>

                {/* Row 2: Sticker and Scrapbook Images */}
                {(selectedSticker || (entry.image_urls && entry.image_urls.length > 0)) && (
                    <Box sx={{ minHeight: 80, display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
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
                        {entry.image_urls && entry.image_urls.length > 0 && (
                            <ScrapbookGallery
                                images={entry.image_urls}
                                onImageClick={(index) => {
                                    setLightboxIndex(index);
                                    setLightboxOpen(true);
                                }}
                            />
                        )}
                    </Box>
                )}
            </Box>

            <Divider sx={{ mb: 3, mx: 4 }} />

            {/* Content */}
            <Box sx={{ px: 4, pb: 4, position: 'relative', zIndex: 1 }}>
                <div
                    className="ProseMirror"
                    dangerouslySetInnerHTML={{ __html: entry.text || '' }}
                />



                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <Box sx={{ mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {entry.tags.map(tag => (
                            <Chip key={tag} label={`#${tag}`} variant="outlined" size="small" />
                        ))}
                    </Box>
                )}
            </Box>
            <ImageLightbox
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={entry.image_urls || []}
                initialIndex={lightboxIndex}
            />
        </Paper>
    );
}
