import React from 'react';
import { Box, Button, Typography, Paper, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeSettings } from '../context/ThemeContext';
import { APP_NAME } from '../constants/app';


export default function SignIn() {
    const { signInWithGoogle, user, loading } = useAuth();
    const { mode } = useThemeSettings();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (user && !loading) {
            const origin = location.state?.from?.pathname || '/';
            navigate(origin, { replace: true });
        }
    }, [user, loading, navigate, location]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const isDark = mode === 'dark';

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark
                    ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' // Dark gradient
                    : 'linear-gradient(135deg, #FAF9F6 0%, #F5E6E8 100%)' // Light gradient
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
                            bgcolor: isDark ? 'rgba(30, 30, 30, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <Box
                            component="img"
                            src="/icon.png"
                            alt="Logo"
                            sx={{ width: 64, height: 64, mb: 3, borderRadius: '50%', bgcolor: 'primary.main', display: 'none' }}
                        />

                        <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'primary.main', mb: 1, fontFamily: 'var(--font-serif)' }}>
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
