import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Typography, IconButton, Paper, Chip, Stack, CircularProgress } from '@mui/material';
import { ArrowLeft, Trash2, Calendar as CalendarIcon, Check, CloudOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JournalService } from '../services/journal';
import EntryEditor from '../components/EntryEditor';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';
import { useAutosave } from '../hooks/useAutosave';

export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    text: '',
    mood: 3,
    tags: [],
    date: Date.now()
  });
  const [loading, setLoading] = useState(!isNew);

  // Load entry data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      // 1. Try to load from navigation state (prevents data loss on new->id transition)
      if (location.state?.entry) {
        setEntry(location.state.entry);
        setLoading(false);
        return;
      }

      // 2. If new, try to load from local storage backup
      if (isNew) {
        const localBackup = localStorage.getItem('entry-new');
        if (localBackup) {
          try {
            setEntry(JSON.parse(localBackup));
          } catch (e) {
            console.error("Failed to parse local backup", e);
          }
        }
        setLoading(false);
        return;
      }

      // 3. If existing, fetch from DB (or local storage backup if newer?)
      if (id) {
        try {
          // Check local backup first for this ID
          const localBackup = localStorage.getItem(`entry-${id}`);

          const entries = await JournalService.getEntries(user.uid);
          const found = entries.find(e => e.id === id);

          if (found) {
            // If local backup exists and is newer or different, maybe use it? 
            // For simplicity, let's trust the DB unless we are offline, 
            // but useAutosave will handle the "offline" state persistence.
            // Actually, if we just refreshed and had unsaved changes locally, we should prefer local?
            // Let's stick to DB for now to avoid conflicts, assuming autosave works well.
            setEntry(found);
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
  const handleAutosave = async (currentEntry: Partial<JournalEntry>) => {
    if (!user) return;

    // Don't save if empty text (unless it's an update to existing?)
    if (!currentEntry.text && isNew) return;

    if (isNew) {
      const newEntry = await JournalService.createEntry(user.uid, currentEntry);
      // Clean up "new" backup
      localStorage.removeItem('entry-new');
      // Navigate to the new ID, passing current state to avoid re-fetch flicker
      navigate(`/journal/${newEntry.id}`, { replace: true, state: { entry: newEntry } });
    } else if (id) {
      await JournalService.updateEntry(id, currentEntry);
    }
  };

  const { status, lastSaved } = useAutosave({
    data: entry,
    onSave: handleAutosave,
    key: isNew ? 'entry-new' : `entry-${id}`,
    interval: 1500
  });

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this entry?")) return;
    try {
      await JournalService.deleteEntry(id);
      localStorage.removeItem(`entry-${id}`);
      navigate('/journal');
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;

  return (
    <Box sx={{
      height: '100%',
      overflowY: 'auto',
      '&::-webkit-scrollbar-track': {
        my: 2
      }
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
            {/* Autosave Status Indicator */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', opacity: 0.8 }}>
              {status === 'saving' && (
                <>
                  <CircularProgress size={14} thickness={5} color="inherit" />
                  <Typography variant="caption">Saving...</Typography>
                </>
              )}
              {status === 'saved' && (
                <>
                  <Check size={16} />
                  <Typography variant="caption">Saved</Typography>
                </>
              )}
              {status === 'offline' && (
                <>
                  <CloudOff size={16} />
                  <Typography variant="caption">Offline</Typography>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle size={16} color="error" />
                  <Typography variant="caption" color="error">Error saving</Typography>
                </>
              )}
            </Box>

            {!isNew && (
              <IconButton onClick={handleDelete} color="error" size="small">
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
            <Box sx={{ p: 4, pb: 0, mb: 3, display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
              <CalendarIcon size={18} />
              <Typography>
                {new Date(entry.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>

            <Box sx={{ px: 4, pb: 4 }}>
              <EntryEditor
                initialContent={entry.text}
                onUpdate={(content) => setEntry(prev => ({ ...prev, text: content }))}
              />
            </Box>
          </Paper>

          {/* Mood & Tags Placeholder */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>Mood</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {[1, 2, 3, 4, 5].map((m) => (
                <Chip
                  key={m}
                  label={['😢', '😕', '😐', '🙂', '😄'][m - 1]}
                  onClick={() => setEntry(prev => ({ ...prev, mood: m }))}
                  variant={entry.mood === m ? 'filled' : 'outlined'}
                  color={entry.mood === m ? 'primary' : 'default'}
                  sx={{ fontSize: '1.2rem', py: 2 }}
                />
              ))}
            </Stack>
          </Paper>
        </motion.div>
      </Box>
    </Box>
  );
}
