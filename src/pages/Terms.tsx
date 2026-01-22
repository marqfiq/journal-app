import { Box, Container, Typography, Link, useTheme, Button } from '@mui/material';
import { useThemeSettings } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Terms() {
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
                    Terms of Service
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
                    <strong>Last Updated:</strong> January 21, 2026
                </Typography>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        1. Introduction
                    </Typography>
                    <Typography paragraph>
                        Ambry ("The Service") is provided by <strong>Lettuce Innovate LLC</strong>, a limited liability company registered in <strong>Florida, United States</strong>. By accessing or using our website and services, you agree to be bound by these Terms.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        2. The "No Lockout" Guarantee
                    </Typography>
                    <Typography paragraph>
                        We believe you should never lose access to your memories. Our subscription policy is designed to protect your data ownership:
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Active Subscriptions:</strong> While subscribed, you have full access to create, edit, and read entries.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Expired Subscriptions:</strong> If your subscription ends or is cancelled, your account will revert to <strong>"Read-Only"</strong> mode. You will retain the ability to <strong>read</strong> and <strong>export</strong> your past entries indefinitely. You will simply be unable to create <em>new</em> entries until you resubscribe.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Data Retention:</strong> We do not delete your data simply because you stopped paying. You must explicitly delete your account if you wish for your data to be removed.
                            </Typography>
                        </li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        3. Accounts and Security
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Authentication:</strong> Access to the Service is managed via Google Authentication. You are responsible for maintaining the security of your Google account.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Responsibility:</strong> You are responsible for all activity that occurs under your account.
                            </Typography>
                        </li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        4. Subscriptions and Refunds
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Billing:</strong> Subscriptions are billed in advance on a monthly or yearly basis via Stripe.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Cancellation:</strong> You may cancel your subscription at any time via the billing portal. Your access to paid features will continue until the end of your current billing period.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Refunds:</strong> As Ambry offers a free trial period (via the "First Entry" system) and non-tangible digital goods, payments are generally non-refundable. Exceptions may be made at our sole discretion.
                            </Typography>
                        </li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        5. User Content and License
                    </Typography>
                    <ul>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>Ownership:</strong> You retain full ownership of all journal entries and data you submit to the Service.
                            </Typography>
                        </li>
                        <li>
                            <Typography component="span" sx={{ display: 'block', mb: 1 }}>
                                <strong>License to Us:</strong> You grant us a limited license to store, process, and backup your content solely for the purpose of providing the Service to you. We do not sell this license to third parties.
                            </Typography>
                        </li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        6. Acceptable Use
                    </Typography>
                    <Typography paragraph>
                        You agree not to misuse the Service. This includes, but is not limited to:
                    </Typography>
                    <ul>
                        <li><Typography component="li">Attempting to reverse engineer or hack the Service.</Typography></li>
                        <li><Typography component="li">Using the Service to store illegal content.</Typography></li>
                        <li><Typography component="li">Overwhelming the Service infrastructure (e.g., DDoS attacks).</Typography></li>
                    </ul>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        7. Limitation of Liability
                    </Typography>
                    <Typography paragraph>
                        To the maximum extent permitted by law, <strong>Lettuce Innovate LLC</strong> shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. In no event shall our total liability exceed the amount you paid to us for the Service in the past six (6) months.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        8. "As Is" Service
                    </Typography>
                    <Typography paragraph>
                        The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the Service will be uninterrupted, error-free, or completely secure, though we strive to maintain high standards of reliability.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        9. Governing Law
                    </Typography>
                    <Typography paragraph>
                        These Terms shall be governed by and construed in accordance with the laws of the <strong>State of Florida</strong> and the federal laws of the <strong>United States</strong> applicable therein.
                    </Typography>
                </Box>

                <Box component="section" sx={{ mb: 6 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        10. Contact Information
                    </Typography>
                    <Typography paragraph>
                        If you have any questions about these Terms, please contact us at:
                    </Typography>
                    <Typography paragraph>
                        <strong>Ambry Support</strong><br />
                        Email: <Link href="mailto:support@ambryjournal.com">support@ambryjournal.com</Link><br />
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
