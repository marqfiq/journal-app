import React from 'react';
import { Box, Button, Typography, Paper, Container, useTheme, alpha } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_NAME } from '../constants/app';


export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 4,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{ width: 64, height: 64, mb: 3, borderRadius: '50%', bgcolor: 'primary.main', display: 'none' }}
            />

            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
              {APP_NAME}
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              A beautiful space for your thoughts and memories.
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleLogin}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 8
              }}
            >
              Sign in with Google
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
