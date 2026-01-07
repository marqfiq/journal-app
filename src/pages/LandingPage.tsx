import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShieldCheck, Download, LockKeyhole, ChevronDown } from 'lucide-react';
import { Button, Box, Container, Typography, Paper, Divider, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useThemeSettings } from '../context/ThemeContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { mode } = useThemeSettings();
    const theme = useTheme();
    const originRef = useRef<HTMLElement>(null);
    const { scrollY } = useScroll();
    const scrollOpacity = useTransform(scrollY, [0, 200], [1, 0]);

    const isDark = mode === 'dark';

    // Custom styles based on theme mode not fully covered by MUI theme
    const bgColor = isDark ? '#121212' : '#fdfdfc'; // Slightly warmer white for light mode
    const surfaceColor = isDark ? '#1e1e1e' : '#f5f5f0';
    const textColor = isDark ? '#e0e0e0' : '#2c2c2c';
    const mutedColor = isDark ? '#a0a0a0' : '#666666';

    const handleSignIn = () => navigate('/signin');
    const handleScrollDown = () => {
        originRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const stagger = {
        visible: { transition: { staggerChildren: 0.1 } }
    };

    // Scroll handling for header shadow/border
    const headerBorderOpacity = useTransform(scrollY, [0, 50], [0, 1]);
    const headerShadowOpacity = useTransform(scrollY, [0, 50], [0, 0.1]);

    const headerBorderColor = useTransform(
        headerBorderOpacity,
        [0, 1],
        ['rgba(0,0,0,0)', isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)']
    );
    
    // Use standard CSS box-shadow but animate the color alpha
    const headerBoxShadow = useTransform(
        headerShadowOpacity,
        [0, 0.1],
        ['0px 0px 0px rgba(0,0,0,0)', `0px 4px 20px rgba(0,0,0,${isDark ? 0.3 : 0.05})`]
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: bgColor, color: textColor, display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <motion.header 
                style={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: 10,
                    backgroundColor: bgColor, // Ensure background is opaque so content scrolls behind
                    borderBottom: '1px solid',
                    borderColor: headerBorderColor,
                    boxShadow: headerBoxShadow,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '24px 32px' // Matches px: 4, py: 3 (8px * 4 = 32, 8px * 3 = 24)
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontFamily: 'var(--font-serif)', fontWeight: 'var(--font-weight-header)' }}>
                    Helen's Journal
                </Typography>
                <Button
                    onClick={handleSignIn}
                    variant="text"
                    color="inherit"
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Sign in
                </Button>
            </motion.header>

            <Box component="main" sx={{ flexGrow: 1 }}>
                <Container maxWidth="lg">

                    {/* Hero Section */}
                    <Box sx={{
                        minHeight: 'calc(100vh - 100px)', // Subtract header approximation
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        pb: 8,
                        position: 'relative'
                    }}>
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={fadeInUp}>
                                <Typography variant="h2" component="h1" gutterBottom sx={{
                                    fontFamily: 'var(--font-serif)',
                                    fontWeight: 'var(--font-weight-header)',
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    mb: 3
                                }}>
                                    A safe place to write <br />and look back at your memories.
                                </Typography>
                            </motion.div>
                            <motion.div variants={fadeInUp}>
                                <Typography variant="h5" sx={{ color: mutedColor, mb: 6, maxWidth: '600px', mx: 'auto', fontWeight: 400, fontSize: '1.1rem', lineHeight: 1.6 }}>
                                    A simple private journaling space designed around trust and longevity.
                                    Your memories belong to you, always.
                                </Typography>
                            </motion.div>
                            <motion.div variants={fadeInUp}>
                                <Button
                                    onClick={handleSignIn}
                                    variant="contained"
                                    size="large"
                                    disableElevation
                                    sx={{
                                        px: 5,
                                        py: 1.5,
                                        borderRadius: '50px',
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    Start writing
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Learn More Scroller */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                bottom: 40,
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                opacity: scrollOpacity
                            }}
                            onClick={handleScrollDown}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1, duration: 1 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <Typography variant="body2" sx={{ color: mutedColor, mb: 1, fontWeight: 500 }}>
                                    Learn more
                                </Typography>
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <ChevronDown color={mutedColor} />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </Box>

                    <Divider sx={{ my: 8, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />

                    {/* Origin Story */}
                    <Box ref={originRef} sx={{ py: 6, maxWidth: '800px', mx: 'auto' }}>
                        <Typography variant="overline" display="block" align="center" sx={{ color: mutedColor, mb: 2, letterSpacing: 2 }}>
                            Origin Story
                        </Typography>
                        <Typography variant="body1" align="center" sx={{ lineHeight: 1.8, fontSize: '1.05rem', color: mutedColor }}>
                            Hi, I'm Mark, the creator of Helen's Journal. I built this app after my wife lost access to years of journal entries when another app locked her out of a premium account.
                            That felt like a betrayal. So for Christmas 2025, I built her this so that she had an easy trusted way to remember all her past memories, and continue to make new ones.
                            I'm sharing it now for others who want a safe and simple place to write and look back on their memories.
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 8, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />

                    {/* Pricing Section */}
                    <Box sx={{ py: 6, textAlign: 'center', mb: 10 }}>
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontFamily: 'var(--font-serif)', fontWeight: 'var(--font-weight-header)' }}>
                            Simple Pricing
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4, flexWrap: 'wrap' }}>
                            <Paper elevation={0} sx={{
                                p: 4,
                                borderRadius: 4,
                                bgcolor: surfaceColor,
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                minWidth: '240px'
                            }}>
                                <Typography variant="h6" gutterBottom>Monthly</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>$4.99</Typography>
                                <Typography variant="body2" sx={{ color: mutedColor }}>/ month</Typography>
                            </Paper>
                            <Paper elevation={0} sx={{
                                p: 4,
                                borderRadius: 4,
                                bgcolor: surfaceColor,
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                minWidth: '240px'
                            }}>
                                <Typography variant="h6" gutterBottom>Yearly</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 600, mb: 1 }}>$29.99</Typography>
                                <Typography variant="body2" sx={{ color: mutedColor }}>/ year</Typography>
                            </Paper>
                        </Box>
                        <Box sx={{ mt: 4, color: mutedColor }}>
                            <Typography variant="body2" gutterBottom>One month free. No card required.</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>You can always read and export your writing.</Typography>
                        </Box>
                    </Box>

                </Container>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{
                py: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.25), // Increased saturation
                borderTop: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        <Typography variant="body2" component="a" href="#" sx={{ color: mutedColor, textDecoration: 'none', '&:hover': { color: textColor } }}>Privacy</Typography>
                        <Typography variant="body2" component="a" href="#" sx={{ color: mutedColor, textDecoration: 'none', '&:hover': { color: textColor } }}>Terms</Typography>
                        <Typography variant="body2" component="a" href="#" sx={{ color: mutedColor, textDecoration: 'none', '&:hover': { color: textColor } }}>Contact</Typography>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
