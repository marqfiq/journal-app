import React, { useState } from 'react';
import { Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, Fab } from '@mui/material';
import { Menu as MenuIcon, Book, Calendar, Search, Home, Plus, Settings } from 'lucide-react';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DRAWER_WIDTH = 280;

const MENU_ITEMS = [
    { text: 'Home', icon: Home, path: '/' },
    { text: 'Journal', icon: Book, path: '/journal' },
    { text: 'Calendar', icon: Calendar, path: '/calendar' },
    { text: 'Search', icon: Search, path: '/search' },
];

export default function Layout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const element = useOutlet();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    component="img"
                    src="/icon.png"
                    alt="Logo"
                    sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'none' }} // Placeholder
                />
                <Typography variant="h5" sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: 'primary.main' }}>
                    Helen's Journal
                </Typography>
            </Box>

            <List sx={{ px: 2, flexGrow: 1 }}>
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: isActive ? 'rgba(224, 176, 182, 0.15)' : 'transparent',
                                    color: isActive ? 'primary.main' : 'text.primary',
                                    '&:hover': {
                                        bgcolor: 'rgba(224, 176, 182, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                                    <Icon size={20} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.95rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ p: 2 }}>
                <ListItemButton sx={{ borderRadius: 3, color: 'text.secondary' }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                        <Settings size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Mobile Header */}
            {isMobile && (
                <Box sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 64,
                    bgcolor: 'background.paper',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    boxShadow: '0px 1px 10px rgba(0,0,0,0.05)'
                }}>
                    <IconButton onClick={handleDrawerToggle} edge="start" sx={{ color: 'text.primary' }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2, fontFamily: 'Playfair Display', fontWeight: 700 }}>
                        Helen's Journal
                    </Typography>
                </Box>
            )}

            {/* Navigation Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid rgba(0,0,0,0.03)' },
                        }}
                        open
                    >
                        {drawerContent}
                    </Drawer>
                )}
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: { xs: 8, md: 0 },
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '1200px',
                    mx: 'auto'
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%' }}
                    >
                        {element}
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Floating Action Button for New Entry */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    boxShadow: '0px 4px 20px rgba(224, 176, 182, 0.4)',
                    '&:hover': { transform: 'scale(1.05)' },
                    transition: 'transform 0.2s'
                }}
                onClick={() => navigate('/journal/new')}
            >
                <Plus color="white" />
            </Fab>
        </Box>
    );
}
