import { useState } from 'react';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, Fab, Tooltip, alpha, Paper } from '@mui/material';
import { Book, Calendar, Search, Home, Plus, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { APP_NAME } from '../constants/app';
import AppIcon from './AppIcon';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 88;
const BOTTOM_NAV_HEIGHT = 72;

const MENU_ITEMS = [
    { text: 'Home', icon: Home, path: '/home' },
    { text: 'Journal', icon: Book, path: '/journal' },
    { text: 'Calendar', icon: Calendar, path: '/calendar' },
    { text: 'Search', icon: Search, path: '/search' },
    { text: 'Settings', icon: Settings, path: '/settings' },
];

export default function Layout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { userAccess } = useAuth();

    const handleCollapseToggle = () => {
        setIsCollapsed(!isCollapsed);
        setIsHeaderHovered(false);
    };

    const handleCreateEntry = () => {
        if (userAccess?.accessLevel === 'expired') {
            window.location.hash = 'pricing';
        } else {
            navigate('/journal/new');
        }
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
                            <Typography variant="h6" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {APP_NAME}
                            </Typography>
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
                                    onClick={() => navigate(item.path)}
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

            {/* Settings Item - Handled by MENU_ITEMS in mobile, but distinct in desktop sidebar */}
            {!isMobile && (
              <Box sx={{ p: 2 }}>
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
                      onClick={handleCreateEntry}
                  >
                      <Plus color="white" />
                  </Fab>
              </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{
            display: 'flex',
            height: '100dvh',
            bgcolor: 'background.default',
            overflow: 'hidden'
        }}>
            {/* Desktop Sidebar (Static) */}
            {!isMobile && (
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
                    height: '100dvh',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    p: isMobile ? 0 : 2,
                    pb: isMobile ? `${BOTTOM_NAV_HEIGHT}px` : (isMobile ? 0 : 2)
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
                    <Box 
                        sx={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            height: '100%',
                            width: '100%',
                            position: 'relative'
                        }}
                    >
                        <Outlet />
                    </Box>
                </Box>
            </Box>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: BOTTOM_NAV_HEIGHT,
                        bgcolor: 'background.paper',
                        zIndex: 1100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        borderTop: 1,
                        borderColor: 'divider',
                        px: 1
                    }}
                >
                    {/* Home */}
                    <IconButton
                        onClick={() => navigate('/home')}
                        sx={{
                            flexDirection: 'column',
                            color: location.pathname === '/home' ? 'primary.main' : 'text.secondary',
                            borderRadius: 2,
                            p: 1
                        }}
                    >
                        <Home size={24} />
                        <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>Home</Typography>
                    </IconButton>

                    {/* Journal */}
                    <IconButton
                        onClick={() => navigate('/journal')}
                        sx={{
                            flexDirection: 'column',
                            color: (location.pathname === '/journal' || location.pathname.startsWith('/journal/')) && location.pathname !== '/journal/new' ? 'primary.main' : 'text.secondary',
                            borderRadius: 2,
                            p: 1
                        }}
                    >
                        <Book size={24} />
                        <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>Journal</Typography>
                    </IconButton>

                    {/* Add (Center) */}
                    <Box sx={{ position: 'relative', top: -16 }}>
                        <Fab
                            color="primary"
                            onClick={handleCreateEntry}
                            sx={{
                                width: 56,
                                height: 56,
                                boxShadow: `0px 4px 15px ${theme.palette.primary.main}66`
                            }}
                        >
                            <Plus color="white" />
                        </Fab>
                    </Box>


                    {/* Calendar */}
                    <IconButton
                        onClick={() => navigate('/calendar')}
                        sx={{
                            flexDirection: 'column',
                            color: location.pathname === '/calendar' ? 'primary.main' : 'text.secondary',
                            borderRadius: 2,
                            p: 1
                        }}
                    >
                        <Calendar size={24} />
                        <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>Calendar</Typography>
                    </IconButton>

                    {/* Settings */}
                    <IconButton
                        onClick={() => navigate('/settings')}
                        sx={{
                            flexDirection: 'column',
                            color: location.pathname === '/settings' ? 'primary.main' : 'text.secondary',
                            borderRadius: 2,
                            p: 1
                        }}
                    >
                        <Settings size={22} />
                        <Typography variant="caption" sx={{ fontSize: '10px', mt: 0.5 }}>Settings</Typography>
                    </IconButton>
                </Paper>
            )}
        </Box>
    );
}
