import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, IconButton, Paper, Stack, Tooltip, Popover, Dialog, DialogTitle, DialogContent, CircularProgress, useTheme } from '@mui/material';
import { ArrowLeft, Trash2, Check, AlertCircle, X, Upload, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JournalService } from '../services/journal';
import EntryEditor from '../components/EntryEditor';
import DeleteDialog from '../components/DeleteDialog';
import EntryHeaderActions from '../components/EntryHeaderActions';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';
import { useAutosave } from '../hooks/useAutosave';
import { SYSTEM_STICKERS } from '../constants/stickers';
import ReadView from '../components/ReadView';
import { StorageService } from '../services/storage';
import ImageLightbox from '../components/ImageLightbox';
import { MAX_IMAGES_PER_ENTRY } from '../constants/config';
import { useStickers } from '../hooks/useStickers';
import ScrapbookGallery from '../components/ScrapbookGallery';

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
  const { stickers, loading: stickersLoading, addSticker, removeSticker, canManage } = useStickers();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingSticker, setUploadingSticker] = useState(false);

  // Sticker Delete Dialog State
  const [deleteStickerDialogOpen, setDeleteStickerDialogOpen] = useState(false);
  const [stickerToDelete, setStickerToDelete] = useState<string | null>(null);

  // Popover State
  const [moodAnchor, setMoodAnchor] = useState<null | HTMLElement>(null);
  const [stickerAnchor, setStickerAnchor] = useState<null | HTMLElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [entry, setEntry] = useState<Partial<JournalEntry>>(() => {
    if (location.state?.entry) {
      return location.state.entry;
    }
    return {
      text: '',
      mood: 0, // Default to 0 (no mood)
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
  const handleAutosave = useCallback(async (currentEntry: Partial<JournalEntry>) => {
    if (!user) return;
    if (!currentEntry.text && isNew) return;

    if (isNew) {
      const newEntry = await JournalService.createEntry(user.uid, currentEntry);
      localStorage.removeItem('entry-new');
      navigate(`/journal/${newEntry.id}`, { replace: true, state: { entry: newEntry } });
    } else if (id) {
      await JournalService.updateEntry(id, currentEntry);
    }
  }, [user, isNew, id, navigate]);

  const { status, retry } = useAutosave({
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

  // Handlers
  const handleMoodClick = (event: React.MouseEvent<HTMLElement>) => setMoodAnchor(event.currentTarget);
  const handleMoodClose = () => setMoodAnchor(null);
  const handleMoodSelect = (mood: number) => {
    setEntry(prev => ({ ...prev, mood }));
    handleMoodClose();
  };

  const handleStickerClick = (event: React.MouseEvent<HTMLElement>) => setStickerAnchor(event.currentTarget);
  const handleStickerClose = () => setStickerAnchor(null);
  const handleStickerSelect = (stickerId: string) => {
    setEntry(prev => ({ ...prev, sticker_id: stickerId }));
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
    setDeleteStickerDialogOpen(true);
  };

  const confirmStickerDelete = async () => {
    if (stickerToDelete) {
      await removeSticker(stickerToDelete);
      setDeleteStickerDialogOpen(false);
      setStickerToDelete(null);
    }
  };

  const handleImageClick = () => setImageDialogOpen(true);
  const handleImageClose = () => setImageDialogOpen(false);

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
        handleImageClose();
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

    // Optimistically update state
    setEntry(prev => ({ ...prev, image_urls: newImageUrls }));

    // Close lightbox if no images left, or adjust index
    if (newImageUrls.length === 0) {
      setLightboxOpen(false);
    } else if (index >= newImageUrls.length) {
      setLightboxIndex(newImageUrls.length - 1);
    }

    // Delete from storage
    try {
      await StorageService.deleteImage(urlToDelete);
    } catch (error) {
      console.error("Failed to delete image from storage", error);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;

  // Read View
  if (!isEditing && !isNew) {
    return (
      <Box sx={{ height: '100%', overflowY: 'auto', p: 3 }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Button
            startIcon={<ArrowLeft />}
            onClick={() => navigate('/journal')}
            sx={{ color: 'text.secondary', mb: 3 }}
          >
            Back
          </Button>
          <ReadView entry={entry} onEdit={() => setIsEditing(true)} />
        </Box>
      </Box>
    );
  }

  // Use the hook's stickers list to find the selected one, falling back to system stickers if needed, or orphaned custom stickers
  const selectedSticker = stickers.find(s => s.id === entry.sticker_id) ||
    SYSTEM_STICKERS.find(s => s.id === entry.sticker_id) ||
    (entry.sticker_id?.startsWith('http') ? { id: entry.sticker_id, url: entry.sticker_id, owner_id: 'unknown' } : null);
  const entryDate = new Date(entry.date || Date.now());

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
            onClick={() => navigate('/journal')}
            sx={{ color: 'text.secondary' }}
          >
            Back
          </Button>

          <Stack direction="row" spacing={2} alignItems="center">
            {!isNew && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setIsEditing(false)}
                sx={{ borderRadius: 2 }}
              >
                Done
              </Button>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 40, justifyContent: 'flex-end' }}>
              {(status === 'unsaved' || status === 'saving' || status === 'offline') && (
                <Tooltip title={status === 'offline' ? "Offline" : "Saving..."}>
                  <Check size={20} color="#9e9e9e" />
                </Tooltip>
              )}
              {(status === 'saved' || status === 'idle') && (
                <Tooltip title="Saved">
                  <Check size={20} color={theme.palette.primary.main} strokeWidth={2.5} />
                </Tooltip>
              )}
              {status === 'error' && (
                <Tooltip title="Failed to save. Click to retry.">
                  <IconButton size="small" onClick={retry} sx={{ p: 0.5 }}>
                    <AlertCircle size={20} color="#d32f2f" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {!isNew && (
              <IconButton onClick={() => setDeleteDialogOpen(true)} color="error" size="small">
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

            {/* Header Section */}
            <Box sx={{ p: 4, pb: 2 }}>
              {/* Row 1: Date, Mood, and Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                          lineHeight: 1.2
                        }}
                      >
                        {entryDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>

                      {/* Mood (Next to Date, Vertically Aligned) */}
                      {(entry.mood || 0) > 0 && (
                        <Box
                          onClick={handleMoodClick}
                          sx={{
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' },
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {['😢', '😕', '😐', '🙂', '😄'][(entry.mood!) - 1]}
                        </Box>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>

                <EntryHeaderActions
                  currentMood={entry.mood || 0}
                  onMoodClick={handleMoodClick}
                  onStickerClick={handleStickerClick}
                  onImageClick={handleImageClick}
                />
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
                      onClick={handleStickerClick}
                      sx={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' }, zIndex: 10 }}
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

            <Box sx={{ px: 4, pb: 4 }}>
              <EntryEditor
                initialContent={entry.text}
                onUpdate={(content) => setEntry(prev => ({ ...prev, text: content }))}
              />


            </Box>
          </Paper>
        </motion.div>
      </Box>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Entry?"
        description="Are you sure you want to delete this journal entry? This action cannot be undone."
      />

      {/* Popovers & Dialogs (Lifted from EntryHeaderActions) */}

      {/* Mood Popover */}
      <Popover
        open={Boolean(moodAnchor)}
        anchorEl={moodAnchor}
        onClose={handleMoodClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center' }}>How are you?</Typography>
            {(entry.mood || 0) > 0 && (
              <Button
                size="small"
                color="error"
                onClick={() => handleMoodSelect(0)}
                sx={{ minWidth: 'auto', p: 0.5, ml: 2 }}
              >
                Remove
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {[1, 2, 3, 4, 5].map((m) => (
              <IconButton
                key={m}
                onClick={() => handleMoodSelect(m)}
                color={entry.mood === m ? 'primary' : 'default'}
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: 4 } }}
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

          {entry.sticker_id && (
            <Button
              size="small"
              color="error"
              fullWidth
              onClick={() => {
                setEntry(prev => ({ ...prev, sticker_id: null }));
                handleStickerClose();
              }}
              sx={{ mb: 1 }}
            >
              Remove Selected
            </Button>
          )}

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

      <DeleteDialog
        open={deleteStickerDialogOpen}
        onClose={() => setDeleteStickerDialogOpen(false)}
        onConfirm={confirmStickerDelete}
        title="Delete Sticker?"
        description="Are you sure you want to delete this sticker? This action cannot be undone."
      />

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={handleImageClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add Images
          <IconButton onClick={handleImageClose} size="small"><X /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            component="label"
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer',
              '&:hover': { bgcolor: uploading ? 'transparent' : 'action.hover' },
              display: 'block'
            }}
          >
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? (
              <CircularProgress />
            ) : (
              <>
                <Upload size={48} color="#9e9e9e" />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Max 3 images)
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={entry.image_urls || []}
        initialIndex={lightboxIndex}
        onDelete={handleDeleteImage}
      />

    </Box >
  );
}
