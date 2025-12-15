import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { AlertTriangle } from 'lucide-react';

interface DeleteDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export default function DeleteDialog({
    open,
    onClose,
    onConfirm,
    title = "Delete Entry?",
    description = "This action cannot be undone."
}: DeleteDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    p: 1,
                    minWidth: 320
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Box sx={{
                    bgcolor: '#fee2e2',
                    p: 1,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <AlertTriangle size={20} color="#ef4444" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography color="text.secondary">
                    {description}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: 'text.secondary',
                        borderRadius: 2,
                        px: 2,
                        '&:hover': { bgcolor: 'action.hover' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        boxShadow: 'none',
                        '&:hover': { boxShadow: 'none', bgcolor: '#dc2626' }
                    }}
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
