import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, useTheme, alpha } from '@mui/material';
import CalendarView from '../components/CalendarView';
import JournalSidebarItem from '../components/JournalSidebarItem';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { JournalEntry } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Calendar() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    async function loadEntries() {
      if (!user) return;
      const data = await JournalService.getEntries(user.uid);
      setEntries(data);
    }
    loadEntries();

    if (location.state?.date) {
      setSelectedDate(new Date(location.state.date));
    }
  }, [user, location.state]);

  const selectedEntries = selectedDate
    ? entries.filter(e => {
      const d = new Date(e.date);
      return d.getDate() === selectedDate.getDate() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getFullYear() === selectedDate.getFullYear();
    }).sort((a, b) => a.date - b.date)
    : [];

  return (
    <Box sx={{
      height: '100%',
      overflowY: 'auto',
      p: 3,
      '&::-webkit-scrollbar-track': {
        my: 2
      }
    }}>


      <Grid container spacing={4} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
            Calendar
          </Typography>
          <CalendarView entries={entries} onDateSelect={setSelectedDate} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{
            p: 3,
            borderRadius: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: 1,
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.06)
          }}>
            <Typography variant="h6" sx={{ mb: 2, flexShrink: 0 }}>
              {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
            </Typography>

            <Divider sx={{ mb: 3, flexShrink: 0 }} />

            <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, p: 2, mx: -2 }}>
              {selectedDate ? (
                selectedEntries.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedEntries.map(entry => (
                      <JournalSidebarItem
                        key={entry.id}
                        entry={entry}
                        isSelected={false}
                        onClick={() => navigate(`/journal/${entry.id}`, {
                          state: {
                            from: '/calendar',
                            label: 'Calendar',
                            context: { date: selectedDate?.getTime() }
                          }
                        })}
                        className="glassmorphism"
                        sx={{ border: 'none' }}
                      />
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
