import { Box, Container, Typography, Link, Divider, useTheme, Button } from '@mui/material';
import { useThemeSettings } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Privacy() {
    const { mode } = useThemeSettings();
    const isDark = mode === 'dark';
    const theme = useTheme();
    const navigate = useNavigate();

    const bgColor = isDark ? '#121212' : '#fdfdfc';
    const textColor = isDark ? '#e0e0e0' : '#2c2c2c';
    const mutedColor = isDark ? '#a0a0a0' : '#666666';

    return (
        <Box sx={{
            height: '100%',
            overflowY: 'auto',
            bgcolor: bgColor,
            color: textColor,
            py: 4
        }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ChevronLeft />}
                    onClick={() => navigate('/')}
                    sx={{ mb: 4, color: mutedColor }}
                >
                    Back to Home
                </Button>
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                    Privacy Policy
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
                    <strong>Last Updated:</strong> January 21, 2026
                </Typography>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        1. The Short Version: Your Journal Is Your Sanctuary
                    </Typography>
                    <Typography paragraph>
                        We built Ambry because we believe your thoughts belong to you, not a corporation. Here is our promise in plain English:
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>We Sell Subscriptions, Not Data.</strong> Our business model is simple: you pay us a small fee to use the tool. We do not sell, rent, or share your personal information or journal entries with advertisers or third parties.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>We Don't Want Your Password.</strong> We use Google Authentication exclusively. This means Ambry never sees, processes, or stores your password. Your account security is handled by Google's world-class infrastructure.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Your Data Is Portable.</strong> You are never locked in. You can export your entire journal history to a JSON file at any time via the Settings menu.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>We Use Standard Analytics.</strong> We use basic tools (Google Analytics) to monitor website performance, but we do not track the content of what you write.
                            </Typography>
                        </li>
                    </ul>
                    <Typography paragraph sx={{ mt: 2 }}>
                        If you have questions about your privacy, please email us at <strong>privacy@ambryjournal.com</strong>.
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        2. Information We Collect
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                        A. Account Information
                    </Typography>
                    <Typography paragraph>
                        When you sign up via Google, we receive your email address and basic profile information (name and avatar) to create your account. We do not collect passwords.
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                        B. Your Journal Data
                    </Typography>
                    <Typography paragraph>
                        We store the text, dates, and metadata of the journal entries you create. This data is stored securely in Google Cloud (Firestore) and is encrypted at rest. We access this data only when necessary to provide technical support at your specific request.
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 600 }}>
                        C. Payment Information
                    </Typography>
                    <Typography paragraph>
                        We do not process payments directly. All subscriptions are handled by <strong>Stripe</strong>, a secure third-party payment processor. We do not see or store your credit card details.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        3. How We Use Your Information
                    </Typography>
                    <Typography paragraph>We use your information strictly to:</Typography>
                    <ul>
                        <li><Typography component="li">Provide and maintain the Ambry service.</Typography></li>
                        <li><Typography component="li">Process your subscription payments.</Typography></li>
                        <li><Typography component="li">Send important administrative emails (e.g., policy updates or billing receipts).</Typography></li>
                        <li><Typography component="li">Detect and prevent fraud or abuse.</Typography></li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        4. Data Retention & Deletion
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Retention:</strong> We retain your journal data indefinitely so that it is available to you whenever you log in, even if your subscription has expired (see our "Read-Only" policy in the Terms of Service).
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Deletion:</strong> You may delete your account at any time from the Settings menu. Upon deletion, your data is permanently removed from our active database.
                            </Typography>
                        </li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        5. Third-Party Services
                    </Typography>
                    <Typography paragraph>We rely on the following trusted third parties to run our service:</Typography>
                    <ul>
                        <li><Typography component="li"><strong>Google Firebase:</strong> For authentication, database hosting, and infrastructure.</Typography></li>
                        <li><Typography component="li"><strong>Stripe:</strong> For payment processing.</Typography></li>
                        <li><Typography component="li"><strong>Google Analytics:</strong> For anonymous website usage statistics.</Typography></li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        6. International Data Transfers
                    </Typography>
                    <Typography paragraph>
                        Ambry is operated from Florida, United States. However, our infrastructure (Google Firebase) is distributed globally. By using the service, you acknowledge that your data may be processed in countries outside of your residence, including the United States.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        7. Contact Us
                    </Typography>
                    <Typography paragraph>
                        For any privacy-related questions or to exercise your data rights, please contact us at:
                    </Typography>
                    <Typography paragraph>
                        <strong>Ambry Support</strong><br />
                        Email: <Link href="mailto:privacy@ambryjournal.com">privacy@ambryjournal.com</Link><br />
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
