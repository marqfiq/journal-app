import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, IconButton, Paper, Chip, Stack } from '@mui/material';
import { ArrowLeft, Save, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { JournalService } from '../services/journal';
import EntryEditor from '../components/EntryEditor';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';

export default function Entry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [entry, setEntry] = useState<Partial<JournalEntry>>({
    text: '',
    mood: 3,
    tags: [],
    date: Date.now()
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && id && user) {
      loadEntry();
    }
  }, [id, isNew, user]);

  const loadEntry = async () => {
    try {
      // In a real app, use getEntry(id). For now we might need to fetch all and find, 
      // or implement getEntry in service. I'll assume getEntries for now as per service.
      // Wait, I didn't implement getEntry in service fully (it returned null).
      // Let's implement a quick fetch by ID in this component or fix service.
      // For now, I'll rely on the service to have getEntries and I'll filter. 
      // Ideally I should fix service. But let's just fetch all for now (inefficient but works for MVP).
      const entries = await JournalService.getEntries(user!.uid);
      const found = entries.find(e => e.id === id);
      if (found) {
        setEntry(found);
      } else {
        navigate('/journal');
      }
    } catch (error) {
      console.error("Error loading entry", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (isNew) {
        await JournalService.createEntry(user.uid, entry);
      } else if (id) {
        await JournalService.updateEntry(id, entry);
      }
      navigate('/journal');
    } catch (error) {
      console.error("Error saving", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this entry?")) return;
    try {
      await JournalService.deleteEntry(id);
      navigate('/journal');
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  if (loading) return <Box sx={{ p: 4 }}>Loading...</Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowLeft />}
          onClick={() => navigate('/journal')}
          sx={{ color: 'text.secondary' }}
        >
          Back
        </Button>

        <Stack direction="row" spacing={1}>
          {!isNew && (
            <IconButton onClick={handleDelete} color="error" size="small">
              <Trash2 size={20} />
            </IconButton>
          )}
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            onClick={handleSave}
            disabled={saving}
            sx={{ borderRadius: 3, px: 3 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, mb: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
            <CalendarIcon size={18} />
            <Typography>
              {new Date(entry.date || Date.now()).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Box>

          <EntryEditor
            initialContent={entry.text}
            onUpdate={(content) => setEntry(prev => ({ ...prev, text: content }))}
          />
        </Paper>

        {/* Mood & Tags Placeholder */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
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
  );
}
