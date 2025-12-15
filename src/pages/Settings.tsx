import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Avatar, Divider, Switch, Slider, Grid, Chip, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useThemeSettings } from '../context/ThemeContext';
import { ACCENT_COLORS, HEADER_FONTS, BODY_FONTS } from '../theme';

import { LogOut, User, Download, Trash2, Moon, Sun, Type } from 'lucide-react';
import { JournalService } from '../services/journal';

export default function Settings() {
  const { user, logout } = useAuth();
  const { mode, setMode, accentColor, setAccentColor, fontSize, setFontSize, headerFont, setHeaderFont, bodyFont, setBodyFont } = useThemeSettings();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    try {
      const entries = await JournalService.getEntries(user.uid);
      const dataStr = JSON.stringify(entries, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `journal-backup-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    // In a real app, this would call a cloud function to delete user data and auth
    alert("This feature would permanently delete your account and data. For safety in this demo, it is disabled.");
    setDeleteDialogOpen(false);
  };

  return (
    <Box sx={{
      height: '100%',
      overflowY: 'auto',
      p: 3,
      '&::-webkit-scrollbar-track': {
        my: 2
      }
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Appearance</Typography>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>

            {/* Dark Mode */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Moon size={20} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Dark Mode</Typography>
                  <Typography variant="body2" color="text.secondary">Switch between light and dark themes</Typography>
                </Box>
              </Box>
              <Switch checked={mode === 'dark'} onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')} />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Accent Color */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Accent Color</Typography>
              <Stack direction="row" spacing={2}>
                {(Object.keys(ACCENT_COLORS) as Array<keyof typeof ACCENT_COLORS>).map((color) => (
                  <Box
                    key={color}
                    onClick={() => setAccentColor(color)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: ACCENT_COLORS[color].primary,
                      cursor: 'pointer',
                      border: accentColor === color ? `3px solid ${mode === 'dark' ? '#fff' : '#000'}` : 'none',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.1)' }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Font Size */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>

                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Font Size</Typography>
              </Box>
              <Slider
                value={fontSize === 'small' ? 1 : fontSize === 'medium' ? 2 : 3}
                min={1}
                max={3}
                step={1}
                onChange={(_, val) => setFontSize(val === 1 ? 'small' : val === 2 ? 'medium' : 'large')}
                marks={[
                  { value: 1, label: 'Small' },
                  { value: 2, label: 'Medium' },
                  { value: 3, label: 'Large' },
                ]}
                sx={{
                  mt: 2,
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiSlider-markLabel[data-index="0"]': {
                    transform: 'translateX(0%)',
                  },
                  '& .MuiSlider-markLabel[data-index="2"]': {
                    transform: 'translateX(-100%)',
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Font Style */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Font Style</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Header Font</Typography>
                  <Box
                    component="select"
                    value={headerFont}
                    onChange={(e) => setHeaderFont(e.target.value)}
                    sx={{
                      width: '100%',
                      p: 1.5,
                      borderRadius: 3,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      fontFamily: 'inherit',
                      '&:focus': { outline: 'none', borderColor: 'primary.main' }
                    }}
                  >
                    {HEADER_FONTS.map((font) => (
                      <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </option>
                    ))}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Body Font</Typography>
                  <Box
                    component="select"
                    value={bodyFont}
                    onChange={(e) => setBodyFont(e.target.value)}
                    sx={{
                      width: '100%',
                      p: 1.5,
                      borderRadius: 3,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      fontFamily: 'inherit',
                      '&:focus': { outline: 'none', borderColor: 'primary.main' }
                    }}
                  >
                    {BODY_FONTS.map((font) => (
                      <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                        {font.name}
                      </option>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>Data & Privacy</Typography>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Download size={20} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Export Data</Typography>
                  <Typography variant="body2" color="text.secondary">Download all your journal entries as a JSON file</Typography>
                </Box>
              </Box>
              <Button variant="outlined" onClick={handleExport} sx={{ borderRadius: 3 }}>
                Export
              </Button>
            </Box>


          </Paper>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Account</Typography>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {user?.displayName?.[0] || 'U'}
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{user?.displayName || 'User'}</Typography>
                <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" color="inherit" onClick={logout} sx={{ borderRadius: 3 }}>
                Sign Out
              </Button>
              <Button variant="outlined" color="error" onClick={() => setDeleteDialogOpen(true)} sx={{ borderRadius: 3 }}>
                Delete Account
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Delete Account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and all your journal entries will be permanently lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained" sx={{ borderRadius: 2, color: 'white' }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
