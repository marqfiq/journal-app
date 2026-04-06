import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, useTheme } from '@mui/material';
import { PartyPopper, Check } from 'lucide-react';

interface TrialConfirmationModalProps {
    open: boolean;
    onClose: () => void;
}

export default function TrialConfirmationModal({ open, onClose }: TrialConfirmationModalProps) {
    const theme = useTheme();
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box sx={{
                    bgcolor: 'primary.soft',
                    p: 2,
                    borderRadius: '50%',
                    mb: 2,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <PartyPopper size={32} />
                </Box>

                <DialogTitle sx={{ p: 0, mb: 1, fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Your Free Trial Has Started!
                </DialogTitle>

                <DialogContent sx={{ px: 4, pb: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Great job on your first entry!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You now have <strong>30 days</strong> of full access to create as many entries as you like.
                        Your entries are safe and securely stored.
                    </Typography>

                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, border: 1, borderColor: 'divider', textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>
                            Your trial includes:
                        </Typography>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Check size={16} color={theme.palette.primary.main} strokeWidth={3} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>Unlimited journal entries</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Check size={16} color={theme.palette.primary.main} strokeWidth={3} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>Daily mood tracking</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Check size={16} color={theme.palette.primary.main} strokeWidth={3} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>Photo & sticker attachments</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ width: '100%', justifyContent: 'center', pb: 4 }}>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        size="large"
                        sx={{ px: 4, borderRadius: 8 }}
                    >
                        Continue to Calendar
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
