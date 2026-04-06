import { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, InputAdornment, useTheme, alpha } from '@mui/material';
import { Search as SearchIcon } from 'lucide-react';
import { JournalEntry } from '../types';
import { JournalService } from '../services/journal';
import { useJournal } from '../context/JournalContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import JournalSidebarItem from '../components/JournalSidebarItem';

export default function Search() {
    const [query, setQuery] = useState('');
    const { entries } = useJournal();
    const [results, setResults] = useState<JournalEntry[]>([]);
    const [scrollRatio, setScrollRatio] = useState(0);

    useEffect(() => {
        console.log('Search page mounted');
    }, []);
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
        // Restore query from navigation context
        const state = location.state as any;
        const queryToRestore = state?.query || state?.context?.query;
        if (queryToRestore) {
            console.log('Restoring search query:', queryToRestore);
            setQuery(queryToRestore);
        }
    }, [location.state]);


    useEffect(() => {
        if (query.trim()) {
            const filtered = JournalService.searchEntries(entries, query);
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query, entries]);


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

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {results.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                style={{ width: '100%' }}
                            >
                                <JournalSidebarItem
                                    entry={entry}
                                    isSelected={false}
                                    onClick={() => navigate(`/journal/${entry.id}`, {
                                        state: {
                                            from: '/search',
                                            label: 'Search',
                                            context: { query: query }
                                        }
                                    })}
                                    sx={{
                                        boxShadow: (theme: any) => theme.palette.mode === 'light' 
                                            ? '0px 4px 20px rgba(0,0,0,0.02)' 
                                            : '0px 4px 20px rgba(0,0,0,0.2)',
                                        mb: 0 // Remove bottom margin since Box uses gap
                                    }}
                                />
                            </motion.div>
                        ))}
                    </Box>

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

