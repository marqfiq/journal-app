import { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { restoreAccount, deleteAccountPermanently } from '../services/userService';
import { Timestamp } from 'firebase/firestore';
import { AlertTriangle, Clock, RefreshCw, Trash2, LogOut } from 'lucide-react';


export default function RestoreAccount() {
    const { appUser, user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState('');

    // Calculate deletion date (30 days from scheduled time)
    const scheduledAt = appUser?.scheduledForDeletionAt;
    let deletionDate: Date | null = null;

    if (scheduledAt instanceof Timestamp) {
        // 30 days = 30 * 24 * 60 * 60 * 1000 ms = 2592000000 ms
        const deletionTime = scheduledAt.toMillis() + 2592000000;
        deletionDate = new Date(deletionTime);
    }

    const handleRestore = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await restoreAccount(user.uid);
            // Reload page to clear zombie mode state
            window.location.reload();
        } catch (error) {
            console.error("Failed to restore account", error);
            alert("Failed to restore account. Please try again.");
            setLoading(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!user) return;
        setLoading(true);
        setIsDeleting(true);
        localStorage.setItem('isDeletingAccount', 'true');

        // Status messages
        const messages = [
            'Verifying security...',
            'Cancelling Stripe subscription...',
            'Locating and deleting images...',
            'Scrubbing journal entries...',
            'Finalizing account removal...'
        ];

        let messageIndex = 0;
        setDeleteStatus(messages[0]);

        const intervalId = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setDeleteStatus(messages[messageIndex]);
        }, 2500);

        try {
            // 1. Delete Firestore Data & Auth (via Cloud Function)
            await deleteAccountPermanently(user.uid);

            clearInterval(intervalId);
            setDeleteStatus('Success! Goodbye.');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 2. Clear local auth state (User is already deleted on server)
            try {
                await logout();
            } catch (e) {
                console.log("Logout after deletion failed (expected if user gone):", e);
            }

            // 3. Redirect
            localStorage.removeItem('isDeletingAccount');
            window.location.href = '/';
        } catch (error: any) {
            clearInterval(intervalId);
            console.error("Failed to delete account permanently", error);

            if (error.code === 'auth/user-token-expired' || error.message?.includes('expired') || error.code === 'auth/requires-recent-login') {
                alert("Security Update: Please Sign Out and Sign In again to verify your identity before deleting your account.");
            } else {
                alert(`Failed to delete account: ${error.message || "Unknown error"}`);
            }

            setLoading(false);
            setIsDeleting(false);
            localStorage.removeItem('isDeletingAccount');
            setDeleteConfirmOpen(false);
        }
    };


    return (
        <Box sx={{
            height: '100vh',
            width: '100vw',
            bgcolor: 'background.default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3
        }} >
            {/* ... Paper ... */}
            <Paper elevation={3} sx={{
                p: 4,
                maxWidth: 500,
                width: '100%',
                borderRadius: 4,
                textAlign: 'center',
                borderTop: '6px solid',
                borderColor: 'warning.main'
            }}>
                {/* ... Header ... */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: 'warning.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Clock size={32} color="#ed6c02" />
                    </Box>
                </Box>

                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    Account Scheduled for Deletion
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                    Your account is currently deactivated and scheduled for permanent deletion on
                    <strong> {deletionDate ? deletionDate.toLocaleDateString() : 'Unknown Date'}</strong>.
                    <br /><br />
                    We're keeping your data safe for 30 days in case you change your mind. Restoration is instant.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleRestore}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshCw />}
                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem' }}
                    >
                        Restore Account
                    </Button>

                    <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={loading}
                        startIcon={<Trash2 size={16} />}
                        sx={{ mt: 2 }}
                    >
                        Advanced: Delete immediately & permanently
                    </Button>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        variant="text"
                        color="inherit"
                        size="small"
                        onClick={async () => {
                            try {
                                await logout();
                                window.location.href = '/';
                            } catch (error) {
                                console.error("Failed to sign out", error);
                            }
                        }}
                        disabled={loading}
                        startIcon={<LogOut size={16} />}
                    >
                        Sign Out
                    </Button>
                </Box>
            </Paper>

            {/* Permanent Delete Confirmation */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                    <AlertTriangle size={24} />
                    Permanent Deletion
                </DialogTitle>
                <DialogContent>
                    {isDeleting ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, minWidth: 300 }}>
                            <CircularProgress size={40} thickness={4} sx={{ mb: 3 }} />
                            <Box sx={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography
                                    key={deleteStatus}
                                    variant="body1"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        animation: 'fadeIn 0.5s ease-in'
                                    }}
                                >
                                    {deleteStatus}
                                </Typography>
                            </Box>
                            <style>
                                {`
                                            @keyframes fadeIn {
                                                from { opacity: 0; transform: translateY(5px); }
                                                to { opacity: 1; transform: translateY(0); }
                                            }
                                        `}
                            </style>
                        </Box>
                    ) : (
                        <DialogContentText>
                            Are you sure you want to delete your account immediately?
                            <br /><br />
                            <strong>This action cannot be undone.</strong> All your journal entries and settings will be wiped forever, right now.
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    {!isDeleting && (
                        <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                            Cancel
                        </Button>
                    )}
                    <Button
                        onClick={handlePermanentDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
