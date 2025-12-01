import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Paper, Card, CardContent } from '@mui/material';
import { Plus, Book, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JournalService } from '../services/journal';
import { JournalEntry } from '../types';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    async function loadRecent() {
      if (!user) return;
      try {
        const entries = await JournalService.getEntries(user.uid);
        setRecentEntries(entries.slice(0, 3));
      } catch (error) {
        console.error("Error loading recent", error);
      }
    }
    loadRecent();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Box>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, mb: 1 }}>
          {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Helen'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Ready to capture your thoughts today?
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #E0B0B6 0%, #D4C4B7 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              minHeight: 200,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
                Write a new entry
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  borderRadius: 3,
                  px: 3
                }}
                startIcon={<Plus />}
                onClick={() => navigate('/journal/new')}
              >
                Start Writing
              </Button>
            </Box>
            {/* Decorative circle */}
            <Box sx={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              width: 150,
              height: 150,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.1)'
            }} />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}
            onClick={() => navigate('/calendar')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'rgba(224, 176, 182, 0.15)', color: 'primary.main' }}>
                <Calendar size={24} />
              </Box>
              <Typography variant="h6">Calendar</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              View your journey over time
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontFamily: 'Playfair Display' }}>
        Recent Memories
      </Typography>

      <Grid container spacing={3}>
        {recentEntries.length > 0 ? (
          recentEntries.map((entry, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={entry.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    cursor: 'pointer',
                    height: '100%',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0px 8px 24px rgba(0,0,0,0.06)' }
                  }}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {new Date(entry.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                      mb: 2
                    }}>
                      {entry.text.replace(/<[^>]*>?/gm, '')}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary">No entries yet.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
