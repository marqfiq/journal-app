import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

interface TrialBannerProps {
    trialEndAt?: Timestamp | null | undefined;
    status?: 'trial' | 'expired';
}

export default function TrialBanner({ trialEndAt, status = 'trial' }: TrialBannerProps) {
    const [visible, setVisible] = useState(true);

    // Reset visibility if status changes (e.g. from trial to expired)
    useEffect(() => {
        setVisible(true);
    }, [status]);

    if (status === 'trial' && !trialEndAt) return null;

    let message = '';
    let diffDays = 0;

    if (status === 'trial') {
        const now = new Date();
        const endDate = trialEndAt instanceof Timestamp ? trialEndAt.toDate() : new Date(0);
        const diffTime = Math.max(0, endDate.getTime() - now.getTime());
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return null; // Should be handled by status='expired' but safe check
        message = `Free Trial Active: ${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
    } else {
        message = "Your trial or subscription has ended. Subscribe to continue writing";
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                    style={{ overflow: 'hidden' }}
                >
                    <Box sx={{
                        bgcolor: status === 'expired' ? 'warning.light' : 'primary.main',
                        color: status === 'expired' ? 'warning.contrastText' : 'primary.contrastText',
                        py: 1, // Increased from 0.5 to 1 (add 4px)
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        width: '100%',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap'
                    }}>
                        <Typography variant="body2" sx={{
                            fontWeight: 600,
                            textAlign: 'left',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexGrow: 1,
                            minWidth: 0 // Required for ellipsis in flexbox
                        }}>
                            {message}
                        </Typography>

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1, // 8px spacing
                            flexShrink: 0
                        }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                href="#pricing"
                                sx={{
                                    borderColor: 'inherit',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    '&:hover': { borderColor: 'inherit', bgcolor: 'rgba(255,255,255,0.1)' }
                                }}
                            >
                                Subscribe
                            </Button>

                            <IconButton
                                size="small"
                                onClick={() => setVisible(false)}
                                sx={{
                                    color: 'inherit',
                                    opacity: 0.8,
                                    '&:hover': { opacity: 1 }
                                }}
                            >
                                <X size={16} />
                            </IconButton>
                        </Box>
                    </Box>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
