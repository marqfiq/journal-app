import React from 'react';
import { Dialog, DialogContent, Typography, Box, Button } from '@mui/material';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubscriptionSuccessModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
}

export default function SubscriptionSuccessModal({ open, onClose, title, message, buttonText }: SubscriptionSuccessModalProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: 'visible',
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center'
                }
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: -40,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '4px solid white'
            }}>
                <Check size={40} color="white" strokeWidth={3} />
            </Box>

            <DialogContent sx={{ pt: 6, pb: 4, px: 3 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {title || "Welcome to Pro!"}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {message || "Your subscription has been confirmed. You now have unlimited entries and full access to everything."}
                    </Typography>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={onClose}
                        sx={{ borderRadius: 3, fontWeight: 600, py: 1.5 }}
                    >
                        {buttonText || "Start Journaling"}
                    </Button>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
