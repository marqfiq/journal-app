import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, InputAdornment, Grid, Card, CardContent, useTheme, alpha } from '@mui/material';
import { Search as SearchIcon, Sticker, Image as ImageIcon } from 'lucide-react';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Search() {
    const [query, setQuery] = useState('');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [results, setResults] = useState<JournalEntry[]>([]);
    const [scrollRatio, setScrollRatio] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();

    // Scroll handling
    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (!containerRef.current || !headerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const headerHeight = headerRef.current.offsetHeight;

        // The search bar is sticky at top:0.
        // It sits below:
        // 1. Top padding (pt: 8 = 64px)
        // 2. Header (variable height)
        // 3. Margin bottom (mb: 6 = 48px)
        // Total distance to scroll before sticking = 64 + H + 48.
        // We can approximate this, or rely on offsets.
        // headerRef.current.offsetTop includes the top padding (64px).
        // So stick point is headerOffsetTop + headerHeight + 48.

        const distanceToSticky = headerRef.current.offsetTop + headerHeight + 48;

        // Calculate progress: 0 when at top, 1 when search bar hits the top edge
        const ratio = Math.min(Math.max(scrollTop / distanceToSticky, 0), 1);

        setScrollRatio(ratio);
    };

    useEffect(() => {
        // Cast to unknown first to handle potential mixed state properties (like isEditing)
        const state = location.state as any;
        // Check for both direct query or nested context (fallback)
        const queryToRestore = state?.query || state?.context?.query;
        if (queryToRestore) {
            setQuery(queryToRestore);
        }
    }, [location.state]);

    useEffect(() => {
        async function loadEntries() {
            if (!user) return;
            const data = await JournalService.getEntries(user.uid);
            setEntries(data);
        }
        loadEntries();
    }, [user]);

    useEffect(() => {
        if (query.trim()) {
            const filtered = JournalService.searchEntries(entries, query);
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query, entries]);

    const truncateText = (html: string, maxLength: number = 150) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        const text = tmp.textContent || tmp.innerText || "";
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Derived styles based on scrollRatio

    const width = 100 - (30 * scrollRatio); // 100% -> 70%
    // Reduce height more aggressive: Start at 1, end at 0.25
    const paddingY = 1 - (0.75 * scrollRatio);
    // Reduce font size more: Start at 1.1, end at 0.95
    const fontSize = 1.1 - (0.15 * scrollRatio);

    return (
        <Box
            ref={containerRef}
            onScroll={handleScroll}
            sx={{
                height: '100%',
                overflowY: 'auto',
                '&::-webkit-scrollbar-track': { my: 2 }
            }}
        >
            <Box sx={{ maxWidth: 800, mx: 'auto', pt: 8, px: 3, pb: 10 }}>
                <Box ref={headerRef} sx={{ textAlign: 'center', mb: 6, opacity: 1 - scrollRatio }}>
                    <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
                        Search Memories
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Find specific moments, feelings, or thoughts from your past.
                    </Typography>
                </Box>

                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    mx: -3,
                    px: 3,
                    pt: 2,
                    // Dynamic bottom padding: Starts at 1, goes to 0.5 to save space
                    pb: 1 - (0.5 * scrollRatio),
                    // Fully opaque background when scrolled
                    bgcolor: scrollRatio > 0.1 ? theme.palette.background.paper : 'transparent',
                    backdropFilter: scrollRatio > 0.1 ? `blur(${12 * scrollRatio}px)` : 'none',
                    borderBottom: scrollRatio > 0.1 ? 1 : 0,
                    borderColor: scrollRatio > 0.1 ? alpha(theme.palette.divider, scrollRatio) : 'transparent',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'border 0.2s', // Smooth border transition
                }}>
                    <Box sx={{
                        width: `${width}%`,
                        // No transition on width to make it tied exactly to scroll
                    }}>
                        <TextField
                            fullWidth
                            placeholder="What are you looking for?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon size={24 * (1 - (0.3 * scrollRatio))} color="#9ca3af" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mb: 0, // No margin bottom on the field itself
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'background.paper',
                                    borderRadius: 4,
                                    fontSize: `${fontSize}rem`,
                                    boxShadow: (theme) => theme.palette.mode === 'light'
                                        ? `0px 4px 20px rgba(0,0,0,${0.05 * (1 - scrollRatio)})`
                                        : `0px 4px 20px rgba(0,0,0,${0.2 * (1 - scrollRatio)})`,
                                    '& fieldset': { border: 'none' },
                                    py: paddingY, // More aggressive shrinking
                                    minHeight: 'unset' // Allow shrinking
                                }
                            }}
                        />
                    </Box>
                </Box>

                <Box sx={{ mt: 6 }}>
                    {query && (
                        <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                            {results.length} Result{results.length !== 1 ? 's' : ''}
                        </Typography>
                    )}

                    <Grid container spacing={3}>
                        {results.map((entry, index) => (
                            <Grid size={{ xs: 12 }} key={entry.id} sx={{ width: '100%' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ width: '100%' }}
                                >
                                    <Card
                                        sx={{
                                            width: '100%',
                                            cursor: 'pointer',
                                            borderRadius: 3,
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            mb: 1,
                                            border: 'none',
                                            boxShadow: (theme) => theme.palette.mode === 'light' ? '0px 4px 20px rgba(0,0,0,0.02)' : '0px 4px 20px rgba(0,0,0,0.2)', // Subtle shadow like Sidebar
                                            height: 120, // Fixed height for uniformity
                                            display: 'flex',
                                            flexDirection: 'column',
                                            '&:hover': {
                                                transform: 'scale(1.01)', // Slight scale like Sidebar
                                                bgcolor: 'action.hover'
                                            }
                                        }}
                                        onClick={() => navigate(`/journal/${entry.id}`, {
                                            state: {
                                                from: '/search',
                                                label: 'Search',
                                                context: { query: query }
                                            }
                                        })}
                                    >
                                        <CardContent sx={{
                                            p: 2,
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between' // Distribute space
                                        }}>
                                            {/* Header: Date Left, Icons Right */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.8 }}>
                                                    {new Date(entry.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>

                                                {/* Icons: Mood, Sticker, Images */}
                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', opacity: 0.6 }}>
                                                    {/* Monochrome Mood Emoji */}
                                                    {(entry.mood || 0) > 0 && (
                                                        <Typography sx={{
                                                            fontSize: '1rem',
                                                            lineHeight: 1,
                                                            filter: 'grayscale(100%)',
                                                            opacity: 0.8
                                                        }}>
                                                            {['😢', '😕', '😐', '🙂', '😄'][(entry.mood!) - 1]}
                                                        </Typography>
                                                    )}

                                                    {/* Sticker Icon */}
                                                    {entry.sticker_id && (
                                                        <Sticker size={14} />
                                                    )}

                                                    {/* Image Icon + Count */}
                                                    {(entry.image_urls && entry.image_urls.length > 0) && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <ImageIcon size={14} />
                                                            <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
                                                                {entry.image_urls.length}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>

                                            {/* Content Preview */}
                                            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{
                                                    display: '-webkit-box',
                                                    overflow: 'hidden',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2,
                                                    lineHeight: 1.4,
                                                    opacity: 0.7,
                                                    width: '100%'
                                                }}>
                                                    {truncateText(entry.text)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>

                    {query && results.length === 0 && (
                        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                            No memories found matching "{query}"
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

