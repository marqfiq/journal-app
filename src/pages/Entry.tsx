import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, IconButton, Paper, Stack, Tooltip, CircularProgress, useTheme } from '@mui/material';
import { ArrowLeft, Trash2, Check, AlertCircle, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JournalService } from '../services/journal';
import EntryEditor from '../components/EntryEditor';
import DeleteDialog from '../components/DeleteDialog';
import { JournalEntry, BackLocationState } from '../types';
import { motion } from 'framer-motion';
import { useAutosave } from '../hooks/useAutosave';
import { SYSTEM_STICKERS } from '../constants/stickers';
import { StorageService } from '../services/storage';
import ImageLightbox from '../components/ImageLightbox';
import { MAX_IMAGES_PER_ENTRY } from '../constants/config';
import { useStickers } from '../hooks/useStickers';
import EntryHeader from '../components/EntryHeader';
import EntryAttachments from '../components/EntryAttachments';

export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isNew = id === 'new';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(() => {
    if (isNew) return true;
    return location.state?.isEditing || false;
  });

  // Sticker Hook
  const { stickers, loading: stickersLoading, addSticker, removeSticker, reorderStickers, canManage } = useStickers();

  // Dialog State
  const [uploading, setUploading] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reorder State
  const [isReordering, setIsReordering] = useState(false);

  // --- LIFTED STATE FOR ENTRY HEADER ---
  const [moodAnchor, setMoodAnchor] = useState<null | HTMLElement>(null);
  const [stickerAnchor, setStickerAnchor] = useState<null | HTMLElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const handleReorderToggle = () => {
    setIsReordering(!isReordering);
  };

  const [entry, setEntry] = useState<Partial<JournalEntry>>(() => {
    if (location.state?.entry) {
      return location.state.entry;
    }
    return {
      text: '',
      mood: 0,
      tags: [],
      date: Date.now(),
      sticker_id: undefined,
      image_urls: []
    };
  });

  const [loading, setLoading] = useState(() => {
    if (location.state?.entry) return false;
    return !isNew;
  });

  // Load entry data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      if (location.state?.entry) {
        setEntry(location.state.entry);
        setLoading(false);
        return;
      }

      if (isNew) {
        setEntry({
          text: '',
          mood: 0,
          tags: [],
          date: Date.now(),
          sticker_id: undefined,
          image_urls: []
        });
        setIsEditing(true);
        localStorage.removeItem('entry-new');
        setLoading(false);
        return;
      }

      if (id) {
        try {
          const entries = await JournalService.getEntries(user.uid);
          const found = entries.find(e => e.id === id);

          if (found) {
            setEntry(found);
            if (!location.state?.isEditing) {
              setIsEditing(false);
            }
          } else {
            navigate('/journal');
          }
        } catch (error) {
          console.error("Error loading entry", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [id, isNew, user, location.state]);

  // Autosave Handler
  const creationPromise = useRef<Promise<any> | null>(null);

  const handleAutosave = useCallback(async (currentEntry: Partial<JournalEntry>) => {
    if (!user) return;
    if (!currentEntry.text && isNew) return;

    if (isNew) {
      if (creationPromise.current) {
        const createdEntry = await creationPromise.current;
        await JournalService.updateEntry(createdEntry.id, currentEntry);
        return;
      }

      creationPromise.current = JournalService.createEntry(user.uid, currentEntry);
      try {
        const newEntry = await creationPromise.current;
        setEntry(prev => ({ ...prev, id: newEntry.id }));
      } catch (error) {
        console.error("Failed to create entry", error);
        creationPromise.current = null;
      }
    } else if (id) {
      await JournalService.updateEntry(id, currentEntry);
    }
  }, [user, isNew, id]);

  useEffect(() => {
    if (isNew && entry.id) {
      localStorage.removeItem('entry-new');
      navigate(`/journal/${entry.id}`, { replace: true, state: { entry } });
    }
  }, [isNew, entry.id, navigate, entry]);

  const { status, retry, saveNow } = useAutosave({
    data: entry,
    onSave: handleAutosave,
    key: isNew ? 'entry-new' : `entry-${id}`,
    interval: 1500
  });

  const handleDelete = async () => {
    if (!id) return;
    try {
      await JournalService.deleteEntry(id);
      localStorage.removeItem(`entry-${id}`);
      navigate('/journal');
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const handleDone = async () => {
    await saveNow();
    setIsEditing(false);
  };

  // Image Upload Ref
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !user) return;
    const currentImageCount = entry.image_urls?.length || 0;
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
        setEntry(prev => ({
          ...prev,
          image_urls: [...(prev.image_urls || []), ...urls]
        }));
        // handleImageClose(); // Removed, no longer needed as we don't use dialog
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!entry.image_urls) return;
    const urlToDelete = entry.image_urls[index];
    const newImageUrls = entry.image_urls.filter((_, i) => i !== index);

    setEntry(prev => ({ ...prev, image_urls: newImageUrls }));

    if (newImageUrls.length === 0) {
      setLightboxOpen(false);
    } else if (index >= newImageUrls.length) {
      setLightboxIndex(newImageUrls.length - 1);
    }

    try {
      await StorageService.deleteImage(urlToDelete);
    } catch (error) {
      console.error("Failed to delete image from storage", error);

    }
  };

  // Back Button Logic
  // Back Button Logic
  const handleBack = () => {
    // Cast to unknown first to handle potential mixed state properties (like isEditing)
    const state = location.state as unknown as BackLocationState;

    if (state?.from) {
      console.log('Navigating back to:', state.from, 'with context:', state.context);
      navigate(state.from, { state: state.context });
    } else {
      console.log('No back state found, defaulting to /journal');
      navigate('/journal');
    }
  };

  // Sticker Logic for display
  const selectedSticker = stickers.find(s => s.id === entry.sticker_id) ||
    SYSTEM_STICKERS.find(s => s.id === entry.sticker_id) ||
    (entry.sticker_id?.startsWith('http') ? { id: entry.sticker_id, url: entry.sticker_id, owner_id: 'unknown' } : null);

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;

  return (
    <Box sx={{
      height: '100%',
      overflowY: 'auto',
      pb: 10,
      '&::-webkit-scrollbar-track': { my: 2 }
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowLeft />}
            onClick={handleBack}
            sx={{ color: 'text.secondary' }}
          >
            {location.state?.label ? `Back to ${location.state.label}` : 'Back'}
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 40, justifyContent: 'flex-end' }}>
              {(isEditing || isNew) && (status === 'unsaved' || status === 'saving' || status === 'offline') && (
                <Tooltip title={status === 'offline' ? "Offline" : "Saving..."}>
                  <Check size={20} color="#9e9e9e" />
                </Tooltip>
              )}
              {(isEditing || isNew) && (status === 'saved' || status === 'idle') && (
                <Tooltip title="Saved">
                  <Check size={20} color={theme.palette.primary.main} strokeWidth={2.5} />
                </Tooltip>
              )}
              {(isEditing || isNew) && status === 'error' && (
                <Tooltip title="Failed to save. Click to retry.">
                  <IconButton size="small" onClick={retry} sx={{ p: 0.5 }}>
                    <AlertCircle size={20} color="#d32f2f" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!isNew && (
              <Button
                variant={isEditing ? "outlined" : "text"}
                size="small"
                onClick={isEditing ? handleDone : () => setIsEditing(true)}
                sx={{
                  borderRadius: isEditing ? 2 : '50%',
                  minWidth: isEditing ? 64 : 40,
                  width: isEditing ? 'auto' : 40,
                  height: isEditing ? 'auto' : 40,
                  px: isEditing ? 2 : 0,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isEditing ? "Done" : <Pencil size={20} />}
              </Button>
            )}

            {!isNew && isEditing && (
              <IconButton
                onClick={() => setDeleteDialogOpen(true)}
                color="error"
                sx={{
                  ml: 1,
                  '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.15)' }
                }}
              >
                <Trash2 size={20} />
              </IconButton>
            )}
          </Stack>
        </Box>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Paper elevation={0} sx={{ borderRadius: 4, mb: 3, border: 1, borderColor: 'divider' }}>

            <Box sx={{ p: 4, pb: 2 }}>
              <EntryHeader
                entry={entry}
                onUpdate={(updates) => setEntry((prev: any) => ({ ...prev, ...updates }))}
                onImageClick={handleImageClick}
                stickers={stickers}
                canManageStickers={canManage}
                onAddSticker={addSticker}
                onRemoveSticker={removeSticker}
                isReordering={isReordering}
                onReorderToggle={handleReorderToggle}

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
                onStickerReorder={reorderStickers}
              />


              <EntryAttachments
                sticker={selectedSticker}
                images={entry.image_urls}
                onStickerClick={(e) => setStickerAnchor(e.currentTarget)}
                onImageClick={(index) => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              />
            </Box>

            <Box sx={{ px: 4, pb: 4, position: 'relative', zIndex: 1 }}>
              <EntryEditor
                initialContent={entry.text}
                onUpdate={(content) => setEntry(prev => ({ ...prev, text: content }))}
                editable={isEditing}
              />
            </Box>
          </Paper>
        </motion.div>
      </Box>

      {/* DIALOGS */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Entry?"
        description="Are you sure you want to delete this journal entry? This action cannot be undone."
      />

      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={entry?.image_urls || []}
        initialIndex={lightboxIndex}
        onDelete={isEditing ? handleDeleteImage : undefined}
      />

      {/* Hidden input for image uploads (triggered by EntryHeader) */}
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