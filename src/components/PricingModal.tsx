import React, { useState, useEffect } from 'react';
import {
    Dialog,
    IconButton,
    Box,
    Typography,
    Button,
    Switch,
    Stack,
    Fade,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    alpha,
    Paper
} from '@mui/material';
import { X, Check, Star } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SubscriptionService } from '../services/subscription';

export default function PricingModal() {
    const location = useLocation();
    const navigate = useNavigate();
    const { userAccess } = useAuth();
    const theme = useTheme();

    const [open, setOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [loading, setLoading] = useState(false);

    // Sync open state with hash
    useEffect(() => {
        setOpen(location.hash === '#pricing');
    }, [location.hash]);

    const handleClose = () => {
        // Navigate to current path without hash to close
        navigate(location.pathname, { replace: true });
    };

    const handleSubscribe = async () => {
        const priceId = billingCycle === 'yearly'
            ? (import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly_id_placeholder')
            : (import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly_id_placeholder');

        setLoading(true);
        try {
            await SubscriptionService.createCheckoutSession(priceId, billingCycle === 'yearly');
        } catch (error) {
            console.error("Subscription failed", error);
            alert("Failed to start subscription. Please try again.");
            setLoading(false);
        }
    };

    const isPro = userAccess?.accessLevel === 'pro';

    // Pricing Constants
    const PRICE_MONTHLY = 4.99;
    const PRICE_YEARLY = 29.99;
    const SAVINGS_PERCENT = Math.round(((PRICE_MONTHLY * 12 - PRICE_YEARLY) / (PRICE_MONTHLY * 12)) * 100);

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Fade}
            PaperProps={{
                sx: {
                    bgcolor: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(12px)',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                py: { xs: 4, md: 12 }, // Reduced mobile padding
                px: { xs: 3, md: 6 },
                position: 'relative',
                overflowY: 'auto'
            }}>

                {/* Close Button - Independent Position */}
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
                        zIndex: 10
                    }}
                >
                    <X size={24} />
                </IconButton>

                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: { xs: 4, md: 8 },
                    maxWidth: 'md',
                    width: '100%',
                    alignItems: 'center', // Centers the left group and right card vertically
                    m: 'auto'
                }}>

                    {/* Left Side Content Wrapper */}
                    {/* Desktop: Grouped (Flex Col). Mobile: Ungrouped (Contents) to allow Card insertion */}
                    <Box sx={{
                        display: { xs: 'contents', md: 'flex' },
                        flexDirection: 'column',
                        gap: 2, // Small gap between Header and Features on Desktop
                        textAlign: { xs: 'center', md: 'left' }
                    }}>

                        {/* 1. Header Section */}
                        <Box sx={{
                            order: { xs: 1, md: 0 }, // Mobile: First
                            gridColumn: '1 / 2'
                        }}>
                            <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0px 2px 10px rgba(0,0,0,0.1))',
                                mb: 1,
                                fontSize: { xs: '2.5rem', md: '3rem' }
                            }}>
                                Upgrade to Pro
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6, mb: { xs: 4, md: 0 } }}>
                                Unlock unlimited entries, advanced stats, and more.
                            </Typography>
                        </Box>

                        {/* 3. Features Section */}
                        <Box sx={{
                            order: { xs: 3, md: 0 }, // Mobile: Third (after Card)
                            mt: { xs: 0, md: 2 }, // Extra breathing room on desktop
                            bgcolor: { xs: alpha(theme.palette.text.primary, 0.03), md: 'transparent' },
                            borderRadius: 4,
                            p: { xs: 3, md: 0 },
                            border: { xs: `1px solid ${alpha(theme.palette.divider, 0.5)}`, md: 'none' }
                        }}>
                            <List disablePadding>
                                {[
                                    "Write unlimited journal entries",
                                    "Save 3 images per journal entry",
                                    "Smart search & calendar view",
                                    "Insights from your writing",
                                    "Priority support"
                                ].map((benefit, index) => (
                                    <ListItem key={index} disableGutters sx={{ py: 0.75 }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <Box sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                borderRadius: '50%',
                                                p: 0.5,
                                                display: 'flex',
                                                color: theme.palette.primary.main
                                            }}>
                                                <Check size={14} color="currentColor" />
                                            </Box>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={benefit}
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                color: 'text.primary',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            {/* Mobile Safe Text */}
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, display: { md: 'none' }, textAlign: 'center', fontSize: '0.9rem' }}>
                                Your journal entries are always safe, no matter what.
                            </Typography>
                        </Box>
                    </Box>

                    {/* 2. Action Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            order: { xs: 2, md: 0 }, // Mobile: Second
                            gridColumn: { xs: '1 / 2', md: '2 / 3' },
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            p: { xs: 4, md: 5 },
                            boxShadow: theme.shadows[10],
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        {/* Toggle */}
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 5 }}>
                            <Typography variant="body1" fontWeight={billingCycle === 'monthly' ? 600 : 400} color={billingCycle === 'monthly' ? 'text.primary' : 'text.secondary'}>
                                Monthly
                            </Typography>
                            <Switch
                                checked={billingCycle === 'yearly'}
                                onChange={(e) => setBillingCycle(e.target.checked ? 'yearly' : 'monthly')}
                                color="primary"
                            />
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight={billingCycle === 'yearly' ? 600 : 400} color={billingCycle === 'yearly' ? 'text.primary' : 'text.secondary'}>
                                    Yearly
                                </Typography>
                                {/* Savings Badge */}
                                <Box
                                    sx={{
                                        ml: { xs: 0, md: 1 },
                                        bgcolor: theme.palette.secondary.main,
                                        color: theme.palette.secondary.contrastText,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                        boxShadow: 2,
                                        position: 'absolute',
                                        left: { xs: '50%', md: '100%' },
                                        top: { xs: '100%', md: '50%' },
                                        transform: { xs: 'translateX(-50%)', md: 'translateY(-50%)' },
                                        mt: { xs: 1, md: 0 }
                                    }}
                                >
                                    Save {SAVINGS_PERCENT}%
                                </Box>
                            </Box>
                        </Stack>

                        {/* Price Display */}
                        <Box sx={{ mb: 4 }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={billingCycle}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography variant="h2" fontWeight="bold" color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
                                            ${billingCycle === 'yearly' ? (PRICE_YEARLY / 12).toFixed(2) : PRICE_MONTHLY}
                                            <Typography component="span" variant="h5" color="text.secondary" sx={{ ml: { xs: 0.5, md: 1 } }}>
                                                / month
                                            </Typography>
                                        </Typography>
                                        {billingCycle === 'yearly' && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                Billed yearly at ${PRICE_YEARLY} / year
                                            </Typography>
                                        )}
                                    </Box>
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        {/* CTA Button */}
                        {isPro ? (
                            <Button
                                fullWidth
                                variant="contained"
                                disabled
                                size="large"
                                startIcon={<Star size={20} fill="currentColor" />}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 3,
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    color: theme.palette.success.main,
                                    '&.Mui-disabled': { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }
                                }}
                            >
                                You're already Pro!
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSubscribe}
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    borderRadius: 3,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                    boxShadow: `0 3px 5px 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    color: theme.palette.primary.contrastText,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 6px 10px 4px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    },
                                    '&.Mui-disabled': {
                                        background: theme.palette.action.disabledBackground,
                                        color: theme.palette.action.disabled
                                    }
                                }}
                            >
                                {loading ? 'Redirecting...' : 'Subscribe'}
                            </Button>
                        )}

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontSize: '0.85rem' }}>
                            Secure payment via Stripe. Cancel anytime.
                        </Typography>
                    </Paper>

                </Box>
            </Box>
        </Dialog>
    );
}
