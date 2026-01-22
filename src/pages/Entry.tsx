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
import { startTrialForUser } from '../services/userService';
import TrialConfirmationModal from '../components/TrialConfirmationModal';

export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  interface LocationState {
    entry?: Partial<JournalEntry>;
    isEditing?: boolean;
    label?: string;
    from?: string;
    context?: any;
  }
  const locationState = location.state as LocationState | null;

  const { user, userAccess } = useAuth();
  const theme = useTheme();
  const isNew = id === 'new';
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(() => {
    if (isNew) return true;
    return locationState?.isEditing || false;
  });

  // Redirect if trying to create new entry while expired
  useEffect(() => {
    if (isNew && userAccess?.accessLevel === 'expired') {
      navigate('/journal', { replace: true });
      // Short timeout to ensure hash is set after navigation completes
      setTimeout(() => {
        window.location.hash = 'pricing';
      }, 50);
    }
  }, [isNew, userAccess, navigate]);

  // Sticker Hook
  const { stickers, loading: stickersLoading, addSticker, removeSticker, reorderStickers, canManage } = useStickers();

  // Dialog State
  const [uploading, setUploading] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Reorder State
  const [isReordering, setIsReordering] = useState(false);

  // Trial Modal State
  const [trialModalOpen, setTrialModalOpen] = useState(false);

  // --- LIFTED STATE FOR ENTRY HEADER ---
  const [moodAnchor, setMoodAnchor] = useState<null | HTMLElement>(null);
  const [stickerAnchor, setStickerAnchor] = useState<null | HTMLElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const handleReorderToggle = () => {
    setIsReordering(!isReordering);
  };

  const [entry, setEntry] = useState<Partial<JournalEntry>>(() => {
    if (locationState?.entry) {
      return locationState.entry;
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
    return true; // Always start loading to prevent flicker
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

        // Anti-flicker: Delay showing UI slightly to allow auth/redirect to settle
        if (userAccess?.accessLevel === 'expired') {
          return; // Keep loading true, redirect will happen
        }

        setTimeout(() => {
          setLoading(false);
        }, 50);
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
  }, [id, isNew, user, location.state, userAccess]);

  // Autosave Handler
  const creationPromise = useRef<Promise<any> | null>(null);

  const handleAutosave = useCallback(async (currentEntry: Partial<JournalEntry>) => {
    if (!user) return;

    // Check if new entry is actually empty (handling empty HTML tags from editor)
    if (isNew) {
      const hasText = currentEntry.text && currentEntry.text.replace(/<[^>]*>/g, '').trim().length > 0;
      const hasMood = (currentEntry.mood || 0) > 0;
      const hasSticker = !!currentEntry.sticker_id;
      const hasImages = (currentEntry.image_urls?.length || 0) > 0;
      const hasTags = (currentEntry.tags?.length || 0) > 0;

      if (!hasText && !hasMood && !hasSticker && !hasImages && !hasTags) {
        return;
      }
    }

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

    // Check for trial start eligibility
    if (user) {
      try {
        const result = await startTrialForUser(user.uid);
        if (result.trialStarted) {
          setIsEditing(false); // Switch to View Mode animation first
          setTimeout(() => {
            setTrialModalOpen(true);
          }, 3000); // Wait 3 seconds before showing the modal
          return;
        }
      } catch (error) {
        console.error("Failed to check trial status", error);
      }
    }

    setIsEditing(false);
  };

  const handleTrialModalClose = () => {
    setTrialModalOpen(false);
    // Navigate to Calendar as requested in requirements
    navigate('/calendar');
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

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isNew && userAccess?.accessLevel === 'expired') {
    return null;
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{
      height: '100%',
      overflowY: 'auto',
      pb: 10,
      '&::-webkit-scrollbar-track': { my: 2 }
    }}>
      <motion.div
        key={isEditing ? 'editing' : 'viewing'}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}
      >
        {/* Toolbar */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              startIcon={<ArrowLeft />}
              onClick={handleBack}
              sx={{ color: 'text.secondary' }}
              disabled={trialModalOpen}
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
                <Tooltip title={isEditing ? "Save Changes" : "Edit Entry"}>
                  <Button
                    variant={isEditing ? "outlined" : "text"}
                    size="small"
                    onClick={isEditing ? handleDone : () => {
                      if (userAccess?.accessLevel === 'expired') {
                        window.location.hash = 'pricing';
                      } else {
                        setIsEditing(true);
                      }
                    }}
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
                </Tooltip>
              )}

              {!isNew && isEditing && (
                <Tooltip title="Delete Entry">
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
                </Tooltip>
              )}
            </Stack>
          </Box>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}>
          <Paper elevation={0} sx={{ borderRadius: 4, mb: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>

            <Box sx={{ p: 4, pb: 2 }}>
              <motion.div variants={itemVariants}>
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
                  disableImages={(entry.image_urls?.length || 0) >= MAX_IMAGES_PER_ENTRY}

                  // Controlled Props
                  moodAnchor={moodAnchor}
                  onMoodClick={(e) => {
                    if (userAccess?.accessLevel === 'expired') window.location.hash = 'pricing';
                    else setMoodAnchor(e.currentTarget);
                  }}
                  onMoodClose={() => setMoodAnchor(null)}
                  stickerAnchor={stickerAnchor}
                  onStickerClick={(e) => {
                    if (userAccess?.accessLevel === 'expired') window.location.hash = 'pricing';
                    else setStickerAnchor(e.currentTarget);
                  }}
                  onStickerClose={() => setStickerAnchor(null)}
                  dateOpen={dateOpen}
                  onDateOpen={() => {
                    if (userAccess?.accessLevel === 'expired') window.location.hash = 'pricing';
                    else setDateOpen(true);
                  }}
                  onDateClose={() => setDateOpen(false)}
                  timeOpen={timeOpen}
                  onTimeOpen={() => {
                    if (userAccess?.accessLevel === 'expired') window.location.hash = 'pricing';
                    else setTimeOpen(true);
                  }}
                  onTimeClose={() => setTimeOpen(false)}
                  onStickerReorder={reorderStickers}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <EntryAttachments
                  sticker={selectedSticker}
                  images={entry.image_urls}
                  onStickerClick={(e) => setStickerAnchor(e.currentTarget)}
                  onImageClick={(index) => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              </motion.div>
            </Box>

            <Box sx={{ px: 4, pb: 4, position: 'relative', zIndex: 1 }}>
              <motion.div variants={itemVariants}>
                <EntryEditor
                  initialContent={entry.text}
                  onUpdate={(content) => setEntry(prev => ({ ...prev, text: content }))}
                  editable={isEditing}
                />
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </motion.div>

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

      <TrialConfirmationModal
        open={trialModalOpen}
        onClose={handleTrialModalClose}
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