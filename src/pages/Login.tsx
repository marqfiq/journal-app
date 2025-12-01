import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

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
        background: 'linear-gradient(135deg, #FAF9F6 0%, #F5E6E8 100%)'
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
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <Box
              component="img"
              src="/icon.png"
              alt="Logo"
              sx={{ width: 64, height: 64, mb: 3, borderRadius: '50%', bgcolor: 'primary.main', display: 'none' }}
            />

            <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
              Helen's Journal
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
