import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { PartyPopper } from 'lucide-react';

interface TrialConfirmationModalProps {
    open: boolean;
    onClose: () => void;
}

export default function TrialConfirmationModal({ open, onClose }: TrialConfirmationModalProps) {
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

                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                        <Typography variant="caption" display="block" color="text.secondary">
                            Included in your trial:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            ✅ Unlimited Journals • ✅ Mood Tracking • ✅ Photo Attachments
                        </Typography>
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
