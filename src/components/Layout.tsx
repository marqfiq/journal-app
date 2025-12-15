import React, { useState } from 'react';
import { Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, Fab, Tooltip, alpha } from '@mui/material';
import { Menu as MenuIcon, Book, Calendar, Search, Home, Plus, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import AppIcon from './AppIcon';
import { useNavigate, useLocation, useOutlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;

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
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const element = useOutlet();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        setIsCollapsed(!isCollapsed);
        setIsHeaderHovered(false);
    };

    // Desktop Sidebar Content
    const sidebarContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'transparent',
            color: 'text.primary',
            overflowX: 'hidden'
        }}>
            {/* Header / Logo */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    minHeight: 80,
                    cursor: isCollapsed ? 'pointer' : 'default',
                    position: 'relative'
                }}
                onMouseEnter={() => setIsHeaderHovered(true)}
                onMouseLeave={() => setIsHeaderHovered(false)}
                onClick={() => isCollapsed && handleCollapseToggle()}
            >
                {isCollapsed ? (
                    <Box sx={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AnimatePresence mode="wait">
                            {isHeaderHovered ? (
                                <motion.div
                                    key="open-button"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: 'absolute' }}
                                >
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleCollapseToggle(); }} sx={{ color: 'text.secondary' }}>
                                        <ChevronRight size={24} />
                                    </IconButton>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="logo"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: 'absolute' }}
                                >
                                    <AppIcon size={40} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AppIcon size={40} />
                        </Box>
                        {!isMobile && (
                            <IconButton onClick={handleCollapseToggle} sx={{ color: 'text.secondary' }}>
                                <ChevronLeft size={24} />
                            </IconButton>
                        )}
                    </>
                )}
            </Box>

            {/* Navigation Items */}
            <List sx={{ px: 2, flexGrow: 1 }}>
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1, display: 'block' }}>
                            <Tooltip title={isCollapsed ? item.text : ''} placement="right">
                                <ListItemButton
                                    onClick={() => {
                                        navigate(item.path);
                                        if (isMobile) setMobileOpen(false);
                                    }}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: isCollapsed ? 'center' : 'initial',
                                        px: 2.5,
                                        borderRadius: 3,
                                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                        color: isActive ? 'primary.main' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isCollapsed ? 0 : 2,
                                            justifyContent: 'center',
                                            color: isActive ? 'primary.main' : 'text.secondary'
                                        }}
                                    >
                                        <Icon size={22} />
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isActive ? 600 : 400,
                                                fontSize: '0.95rem',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                            sx={{ opacity: isCollapsed ? 0 : 1 }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            {/* Settings Item */}
            <Box sx={{ p: 2 }}>
                <Tooltip title={isCollapsed ? "Settings" : ""} placement="right">
                    <ListItemButton
                        onClick={() => {
                            navigate('/settings');
                            if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                            minHeight: 48,
                            justifyContent: isCollapsed ? 'center' : 'initial',
                            px: 2.5,
                            borderRadius: 3,
                            color: 'text.secondary'
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: isCollapsed ? 0 : 2,
                                justifyContent: 'center',
                                color: 'text.secondary'
                            }}
                        >
                            <Settings size={22} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Settings" sx={{ opacity: isCollapsed ? 0 : 1 }} />}
                    </ListItemButton>
                </Tooltip>
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'absolute',
                        bottom: 32,
                        right: 32,
                        boxShadow: `0px 4px 20px ${theme.palette.primary.main}66`,
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'transform 0.2s',
                        zIndex: 10
                    }}
                    onClick={() => navigate('/journal/new')}
                >
                    <Plus color="white" />
                </Fab>
            </Box>
        </Box>
    );

    return (
        <Box sx={{
            display: 'flex',
            height: '100vh',
            bgcolor: 'background.default',
            overflow: 'hidden'
        }}>
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
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 700 }}>
                        Helen's Journal
                    </Typography>
                </Box>
            )}

            {/* Mobile Drawer */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    anchor="top"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: '100%',
                            height: 'auto',
                            maxHeight: '80vh',
                            borderBottomLeftRadius: 24,
                            borderBottomRightRadius: 24,
                            bgcolor: 'background.paper',
                            boxShadow: '0px 4px 20px rgba(0,0,0,0.1)'
                        },
                    }}
                >
                    <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Mobile Header with Close Button */}
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 0 }}>
                            <IconButton onClick={handleDrawerToggle} sx={{ color: 'text.secondary' }}>
                                <X size={24} />
                            </IconButton>
                        </Box>

                        {/* Navigation Items */}
                        <List sx={{ width: '100%', px: 2 }}>
                            {MENU_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <ListItem key={item.text} disablePadding sx={{ mb: 1, display: 'block' }}>
                                        <ListItemButton
                                            onClick={() => {
                                                navigate(item.path);
                                                setMobileOpen(false);
                                            }}
                                            sx={{
                                                minHeight: 48,
                                                justifyContent: 'center',
                                                px: 2.5,
                                                borderRadius: 3,
                                                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                                color: isActive ? 'primary.main' : 'text.primary',
                                                position: 'relative'
                                            }}
                                        >
                                            <ListItemIcon sx={{
                                                minWidth: 0,
                                                color: isActive ? 'primary.main' : 'text.secondary',
                                                position: 'absolute',
                                                left: 16
                                            }}>
                                                <Icon size={22} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, textAlign: 'center' }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                );
                            })}

                            {/* Settings Item (Inline for Mobile) */}
                            <ListItem disablePadding sx={{ mb: 1, display: 'block' }}>
                                <ListItemButton
                                    onClick={() => {
                                        navigate('/settings');
                                        setMobileOpen(false);
                                    }}
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: 'center',
                                        px: 2.5,
                                        borderRadius: 3,
                                        color: 'text.primary',
                                        position: 'relative'
                                    }}
                                >
                                    <ListItemIcon sx={{
                                        minWidth: 0,
                                        color: 'text.secondary',
                                        position: 'absolute',
                                        left: 16
                                    }}>
                                        <Settings size={22} />
                                    </ListItemIcon>
                                    <ListItemText primary="Settings" primaryTypographyProps={{ textAlign: 'center' }} />
                                </ListItemButton>
                            </ListItem>
                        </List>

                        <Box sx={{ mb: 2, mt: 1 }}>
                            <AppIcon size={32} />
                        </Box>
                    </Box>
                </Drawer>
            ) : (
                /* Desktop Sidebar (Static) */
                <motion.div
                    animate={{ width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{
                        flexShrink: 0,
                        height: '100%',
                        overflow: 'hidden',
                        borderRight: 'none'
                    }}
                >
                    {sidebarContent}
                </motion.div>
            )}

            {/* Main Content Wrapper */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    p: isMobile ? 0 : 2
                }}
            >
                <Box sx={{
                    flexGrow: 1,
                    bgcolor: 'background.paper',
                    borderRadius: isMobile ? 0 : 2,
                    boxShadow: isMobile ? 'none' : '0px 4px 20px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Box sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        height: '100%',
                        width: '100%',
                        position: 'relative'
                    }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname.startsWith('/journal/') ? 'journal-entry' : location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                style={{ width: '100%', height: '100%' }}
                            >
                                {element}
                            </motion.div>
                        </AnimatePresence>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
