import React from 'react';
import { Box, Typography, Button, Paper, Avatar, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            src={user?.photoURL || undefined}
            sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
          >
            {user?.displayName?.charAt(0) || <User />}
          </Avatar>
          <Box>
            <Typography variant="h6">{user?.displayName || 'User'}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={18} />}
          onClick={logout}
          fullWidth
          sx={{ borderRadius: 3, py: 1.5 }}
        >
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
