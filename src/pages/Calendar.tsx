import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import CalendarView from '../components/CalendarView';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Calendar() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEntries() {
      if (!user) return;
      const data = await JournalService.getEntries(user.uid);
      setEntries(data);
    }
    loadEntries();
  }, [user]);

  const selectedEntries = selectedDate
    ? entries.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear();
    })
    : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Calendar
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <CalendarView entries={entries} onDateSelect={setSelectedDate} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, minHeight: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {selectedDate ? (
              selectedEntries.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {selectedEntries.map(entry => (
                    <motion.div key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Box
                        onClick={() => navigate(`/journal/${entry.id}`)}
                        sx={{
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {entry.text.replace(/<[^>]*>?/gm, '')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No entries for this day.
                </Typography>
              )
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Click on a date to view entries.
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
