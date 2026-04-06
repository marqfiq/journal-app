import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Divider, useTheme, alpha, Button, useMediaQuery, IconButton, Backdrop } from '@mui/material';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import CalendarView from '../components/CalendarView';
import JournalSidebarItem from '../components/JournalSidebarItem';
import { useNavigate, useLocation } from 'react-router-dom';
import { useJournal } from '../context/JournalContext';

export default function Calendar() {
  const { entries } = useJournal();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isListExpanded, setIsListExpanded] = useState(false);

  useEffect(() => {
    console.log('Calendar page mounted');
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    if (location.state?.date) {
      return new Date(location.state.date);
    }
    return new Date();
  });

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (isMobile && date) {
      setIsListExpanded(true);
    }
  };


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
      height: '100dvh',
      overflow: 'hidden',
      p: isMobile ? 0 : 3,
      position: 'relative'
    }}>


      <Grid container spacing={isMobile ? 0 : 4} sx={{ height: '100%' }}>
        <Grid size={{ xs: 12, md: 8 }} sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: isMobile ? 'calc(100% - 152px)' : '100%',
          px: isMobile ? 0.5 : 0,
          py: isMobile ? 2 : 0,
          overflow: 'hidden',
          justifyContent: 'flex-start'
        }}>
          <Typography variant="h4" component="h1" sx={{ mb: isMobile ? 1 : 4, px: isMobile ? 1.5 : 0 }}>
            Calendar
          </Typography>
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'flex-start', // Anchored to top
            minHeight: 0
          }}>
            <CalendarView 
              entries={entries} 
              onDateSelect={handleDateSelect} 
              initialDate={selectedDate || new Date()} 
            />
          </Box>
        </Grid>

        {!isMobile ? (
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

              {selectedDate && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    const now = new Date();
                    const newEntryDate = new Date(selectedDate);
                    newEntryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());

                    navigate('/journal/new', {
                      state: {
                        entry: {
                          date: newEntryDate.getTime(),
                          mood: 0,
                          tags: [],
                          text: '',
                          image_urls: []
                        },
                        from: '/calendar',
                        label: 'Calendar',
                        context: { date: selectedDate.getTime() }
                      }
                    });
                  }}
                  sx={{
                    mb: 0,
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    textTransform: 'none',
                    py: .5,
                    borderRadius: 2,
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'transparent',
                      borderColor: 'primary.main',
                      boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  + Add Entry for This Day
                </Button>
              )}

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
        ) : (
          <>
            <Backdrop
              open={isListExpanded}
              onClick={() => setIsListExpanded(false)}
              sx={{ 
                zIndex: 1040, 
                backgroundColor: 'rgba(0,0,0,0.2)',
                backdropFilter: 'blur(2px)'
              }}
            />
            {/* Mobile Bottom Sheet */}
            <motion.div
            initial={false}
            animate={{ height: isListExpanded ? '70%' : '80px' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: 72, // Above bottom nav
              left: 0,
              right: 0,
              backgroundColor: theme.palette.background.paper,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              zIndex: 1050,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              borderBottom: 'none'
            }}
          >
            {/* Handle / Header */}
            <Box 
              onClick={() => setIsListExpanded(!isListExpanded)}
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                cursor: 'pointer',
                bgcolor: alpha(theme.palette.primary.main, 0.05)
              }}
            >
              <Box sx={{ width: 40, height: 4, bgcolor: 'divider', borderRadius: 2, mb: 1 }} />
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }) : 'Entries'}
                </Typography>
                <IconButton size="small">
                  {isListExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: isListExpanded ? 'auto' : 'hidden', px: 2, pb: 4 }}>
              {selectedDate && (
                <Button
                  startIcon={<Plus size={18} />}
                  onClick={() => {
                    const now = new Date();
                    const newEntryDate = new Date(selectedDate);
                    newEntryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
                    navigate('/journal/new', {
                      state: {
                        entry: { date: newEntryDate.getTime() },
                        from: '/calendar',
                        label: 'Calendar',
                        context: { date: selectedDate.getTime() }
                      }
                    });
                  }}
                  sx={{ my: 2, width: '100%', borderRadius: 2 }}
                  variant="outlined"
                >
                  Add Entry
                </Button>
              )}

              {selectedEntries.length > 0 ? (
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
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  No entries for this day.
                </Typography>
              )}
            </Box>
          </motion.div>
        </>
      )}
    </Grid>
    </Box>
  );
}
