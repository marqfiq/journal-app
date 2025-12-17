import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, Button, Popover, IconButton, Stack, Tooltip, CircularProgress } from '@mui/material';
import { DatePicker, MobileTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Calendar, Clock, Move, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DND KIT IMPORTS ---
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DragOverlayProps,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import EntryHeaderActions from './EntryHeaderActions';
import { JournalEntry } from '../types';

// --- COMPONENTS ---

const DateButton = ({ value, onClick, anchorRef }: any) => (
    <Box
        ref={anchorRef}
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: 1,
            color: 'text.primary',
            '&:hover': { opacity: 0.7, textDecoration: 'underline' }
        }}
    >
        <Box sx={{ color: 'text.secondary', display: 'flex' }}><Calendar size={20} /></Box>
        <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1 }}>
            {value}
        </Typography>
    </Box>
);

// --- SORTABLE ITEM ---
const SortableStickerItem = ({ sticker, isReordering, onSelect, onRemove, canManage }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sticker.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        width: '20%',
        padding: '6px',
        boxSizing: 'border-box' as const,
        position: 'relative' as const,
        opacity: isDragging ? 0.2 : 1,
        zIndex: isDragging ? 0 : 1,
        touchAction: isReordering ? 'none' : 'pan-y'
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!isReordering && !isDragging) {
            onSelect(sticker.id);
        }
    };

    return (
        // Added data-sticker-item attribute for robust click detection
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} data-sticker-item>
            <motion.div
                animate={isReordering && !isDragging ? {
                    rotate: [-1.5, 1.5, -1.5],
                    transition: { repeat: Infinity, duration: 0.3, ease: "linear" }
                } : { rotate: 0 }}

                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={handleClick}

                style={{ position: 'relative', width: '100%', aspectRatio: '1/1', cursor: isReordering ? 'grab' : 'pointer' }}
            >
                <Box
                    component="img"
                    src={sticker.url}
                    alt="sticker"
                    draggable={false}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        filter: isReordering ? 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' : 'none'
                    }}
                />

                <AnimatePresence>
                    {(!isReordering && isHovered && canManage) && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{
                                position: 'absolute',
                                top: -5,
                                right: -5,
                                background: 'white',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                padding: 4,
                                display: 'flex',
                                zIndex: 10
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(sticker.url);
                            }}
                        >
                            <X size={12} color="#ef4444" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- DRAG OVERLAY ITEM ---
const StickerOverlayItem = ({ sticker }: any) => {
    return (
        <Box sx={{ width: '100%', height: '100%', cursor: 'grabbing' }}>
            <motion.div
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Box
                    component="img"
                    src={sticker.url}
                    alt="sticker"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0px 15px 30px rgba(0,0,0,0.3))',
                        transform: 'scale(1.15)'
                    }}
                />
            </motion.div>
        </Box>
    );
};


const TimeButton = ({ value, onClick }: any) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: 0.5,
            color: 'text.primary',
            mt: 1,
            '&:hover': { opacity: 0.7, textDecoration: 'underline' }
        }}
    >
        <Box sx={{ color: 'text.secondary', display: 'flex' }}><Clock size={14} /></Box>
        <Typography variant="caption" sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1 }}>
            {value}
        </Typography>
    </Box>
);

interface EntryHeaderProps {
    entry: Partial<JournalEntry>;
    onUpdate: (updates: Partial<JournalEntry>) => void;
    onImageClick: () => void;
    stickers: any[];
    canManageStickers: boolean;
    onAddSticker: (file: File) => Promise<void>;
    onRemoveSticker: (url: string) => Promise<void>;
    isReordering: boolean;
    onReorderToggle: () => void;
    moodAnchor: HTMLElement | null;
    onMoodClick: (event: React.MouseEvent<HTMLElement>) => void;
    onMoodClose: () => void;
    stickerAnchor: HTMLElement | null;
    onStickerClick: (event: React.MouseEvent<HTMLElement>) => void;
    onStickerClose: () => void;
    dateOpen: boolean;
    onDateOpen: () => void;
    onDateClose: () => void;
    timeOpen: boolean;
    onTimeOpen: () => void;
    onTimeClose: () => void;
    customActions?: React.ReactNode;
    onStickerReorder?: (newOrder: any[]) => void;
}

export default function EntryHeader({
    entry,
    onUpdate,
    onImageClick,
    stickers,
    canManageStickers,
    onAddSticker,
    onRemoveSticker,
    isReordering,
    onReorderToggle,
    moodAnchor,
    onMoodClick,
    onMoodClose,
    stickerAnchor,
    onStickerClick,
    onStickerClose,
    dateOpen,
    onDateOpen,
    onDateClose,
    timeOpen,
    onTimeOpen,
    onTimeClose,
    customActions,
    onStickerReorder,
}: EntryHeaderProps) {
    const dateAnchorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingSticker, setUploadingSticker] = useState(false);
    const [orderedStickers, setOrderedStickers] = useState(stickers);

    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        setOrderedStickers(stickers);
    }, [stickers]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: isReordering
                ? { distance: 5 }
                : { delay: 250, tolerance: 5 },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        if (!isReordering) {
            onReorderToggle();
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = orderedStickers.findIndex((s: any) => s.id === active.id);
            const newIndex = orderedStickers.findIndex((s: any) => s.id === over.id);

            const newOrder = arrayMove(orderedStickers, oldIndex, newIndex);
            setOrderedStickers(newOrder);
            if (onStickerReorder) {
                onStickerReorder(newOrder);
            }
        }
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // --- CLICK OUTSIDE HANDLER (FIXED) ---
    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (isReordering) {
            const target = e.target as HTMLElement;

            // Check if the click started inside a sticker item
            const clickedSticker = target.closest('[data-sticker-item]');

            // If we clicked something that is NOT a sticker, exit reorder mode.
            if (!clickedSticker) {
                onReorderToggle();
            }
        }
    };

    const entryDate = new Date(entry.date || Date.now());

    const handleMoodSelect = (mood: number) => {
        onUpdate({ mood });
        onMoodClose();
    };

    const handleStickerSelect = (stickerId: string) => {
        onUpdate({ sticker_id: stickerId });
        onStickerClose();
    };

    const handleStickerUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleStickerFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const input = event.target;
        setUploadingSticker(true);
        try {
            await onAddSticker(file);
        } catch (error) {
            console.error("Failed to upload sticker", error);
        } finally {
            setUploadingSticker(false);
            input.value = '';
        }
    };

    const activeSticker = activeId ? orderedStickers.find((s: any) => s.id === activeId) : null;

    const dropAnimationConfig: DragOverlayProps['dropAnimation'] = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.4' } },
        }),
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1, width: '100%' }}>

                {/* Top Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DateButton
                            value={dayjs(entryDate).format("dddd, MMMM D, YYYY")}
                            onClick={onDateOpen}
                            anchorRef={dateAnchorRef}
                        />

                        {(entry.mood || 0) > 0 && (
                            <Box
                                onClick={onMoodClick}
                                sx={{ fontSize: '1.5rem', cursor: 'pointer', '&:hover': { transform: 'scale(1.1)' } }}
                            >
                                {['😢', '😕', '😐', '🙂', '😄'][(entry.mood!) - 1]}
                            </Box>
                        )}
                    </Box>
                    {customActions ? customActions : (
                        <EntryHeaderActions
                            currentMood={entry.mood || 0}
                            onMoodClick={onMoodClick}
                            onStickerClick={onStickerClick}
                            onImageClick={onImageClick}
                        />
                    )}
                </Box>

                {/* Hidden Pickers */}
                <Box sx={{ display: 'none' }}>
                    <DatePicker
                        value={dayjs(entryDate)}
                        open={dateOpen}
                        onOpen={onDateOpen}
                        onClose={onDateClose}
                        onChange={(newValue) => {
                            if (newValue) {
                                const newDate = new Date(entryDate);
                                newDate.setFullYear(newValue.year(), newValue.month(), newValue.date());
                                onUpdate({ date: newDate.getTime() });
                            }
                        }}
                        slotProps={{ popper: { anchorEl: dateAnchorRef.current, placement: 'bottom-start' } }}
                    />
                    <MobileTimePicker
                        value={dayjs(entryDate)}
                        open={timeOpen}
                        onOpen={onTimeOpen}
                        onClose={onTimeClose}
                        onAccept={onTimeClose}
                        onChange={(newValue) => {
                            if (newValue) {
                                const newDate = new Date(entryDate);
                                newDate.setHours(newValue.hour(), newValue.minute());
                                onUpdate({ date: newDate.getTime() });
                            }
                        }}
                    />
                </Box>
                <TimeButton value={dayjs(entryDate).format("h:mm A")} onClick={onTimeOpen} />

                {/* Mood Popover */}
                <Popover
                    open={Boolean(moodAnchor)}
                    anchorEl={moodAnchor}
                    onClose={onMoodClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
                >
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>How are you?</Typography>
                            {(entry.mood || 0) > 0 && (
                                <Button size="small" color="error" onClick={() => handleMoodSelect(0)} sx={{ minWidth: 'auto', p: 0.5, ml: 2 }}>
                                    Remove
                                </Button>
                            )}
                        </Box>
                        <Stack direction="row" spacing={1}>
                            {[1, 2, 3, 4, 5].map((m) => (
                                <IconButton key={m} onClick={() => handleMoodSelect(m)} color={entry.mood === m ? 'primary' : 'default'} sx={{ fontSize: '1.5rem' }}>
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
                    onClose={() => {
                        if (isReordering) {
                            onReorderToggle();
                        }
                        onStickerClose();
                    }}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
                    keepMounted
                >
                    <Box
                        sx={{ p: 2, width: 500, maxHeight: 500, overflowY: 'auto' }}
                        // Apply Global Click Handler to the Container
                        onClick={handleBackgroundClick}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2">Stickers</Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                <Tooltip title={isReordering ? "Done Reordering" : "Reorder Stickers"}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            // STOP PROPAGATION so this button doesn't trigger handleBackgroundClick
                                            e.stopPropagation();
                                            onReorderToggle();
                                        }}
                                        color={isReordering ? "primary" : "default"}
                                    >
                                        <Move size={16} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={canManageStickers ? "Upload Sticker" : "Log in to add stickers"}>
                                    <span>
                                        <IconButton
                                            size="small"
                                            onClick={handleStickerUploadClick}
                                            disabled={!canManageStickers || uploadingSticker}
                                        >
                                            {uploadingSticker ? <CircularProgress size={16} /> : <Plus size={16} />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleStickerFileChange} />
                        </Box>

                        {entry.sticker_id && (
                            <Button
                                size="small"
                                color="error"
                                onClick={() => handleStickerSelect(undefined as any)}
                                sx={{ mb: 1, width: '100%' }}
                            >
                                Remove Current Sticker
                            </Button>
                        )}

                        {/* --- DND CONTEXT WRAPPER --- */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                            autoScroll={{ layoutShiftCompensation: false }}
                        >
                            <SortableContext
                                items={orderedStickers.map((s: any) => s.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', marginTop: '16px' }}>
                                    {orderedStickers.map((sticker: any) => (
                                        <SortableStickerItem
                                            key={sticker.id}
                                            sticker={sticker}
                                            isReordering={isReordering}
                                            onSelect={handleStickerSelect}
                                            onRemove={onRemoveSticker}
                                            canManage={canManageStickers}
                                        />
                                    ))}
                                </div>
                            </SortableContext>

                            <DragOverlay dropAnimation={dropAnimationConfig}>
                                {activeSticker ? (
                                    <div style={{ width: '88px', height: '88px' }}>
                                        <StickerOverlayItem sticker={activeSticker} />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>

                    </Box>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}