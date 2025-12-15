import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { getTheme, ACCENT_COLORS, ThemeMode, AccentColor, FontSize } from '../theme';
import { useAuth } from './AuthContext';
import { getUserSettings, updateUserSettings } from '../services/userService';

interface ThemeContextType {
    mode: ThemeMode;
    accentColor: AccentColor;
    fontSize: FontSize;
    setMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // Initialize from localStorage (or default)
    const [mode, setMode] = useState<ThemeMode>(() => {
        const stored = localStorage.getItem('themeMode');
        if (stored && ['light', 'dark'].includes(stored)) {
            return stored as ThemeMode;
        }
        return 'light';
    });
    const [accentColor, setAccentColor] = useState<AccentColor>(() => {
        const stored = localStorage.getItem('accentColor');
        if (stored && Object.keys(ACCENT_COLORS).includes(stored)) {
            return stored as AccentColor;
        }
        return 'pink';
    });
    const [fontSize, setFontSize] = useState<FontSize>(() => {
        const stored = localStorage.getItem('fontSize');
        if (stored && ['small', 'medium', 'large'].includes(stored)) {
            return stored as FontSize;
        }
        return 'medium';
    });

    // 1. Sync FROM Cloud on Login
    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                try {
                    const settings = await getUserSettings(user.uid);
                    if (settings) {
                        if (settings.themeMode) setMode(settings.themeMode);
                        if (settings.accentColor) setAccentColor(settings.accentColor);
                        if (settings.fontSize) setFontSize(settings.fontSize);
                    }
                } catch (error) {
                    console.error("Failed to fetch user settings:", error);
                }
            }
        };
        fetchSettings();
    }, [user]);

    // 2. Sync TO Cloud (and localStorage) on Change
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (user) {
            updateUserSettings(user.uid, { themeMode: mode }).catch(console.error);
        }
    }, [mode, user]);

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor);
        // Update CSS variable for Tailwind/global styles
        const colors = ACCENT_COLORS[accentColor];
        document.documentElement.style.setProperty('--color-primary', colors.primary);
        document.documentElement.style.setProperty('--color-secondary', colors.secondary);

        if (user) {
            updateUserSettings(user.uid, { accentColor }).catch(console.error);
        }
    }, [accentColor, user]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        if (user) {
            updateUserSettings(user.uid, { fontSize }).catch(console.error);
        }
    }, [fontSize, user]);

    const theme = getTheme(mode, accentColor, fontSize);

    return (
        <ThemeContext.Provider value={{ mode, accentColor, fontSize, setMode, setAccentColor, setFontSize }}>
            <MUIThemeProvider theme={theme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeSettings() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useThemeSettings must be used within a ThemeProvider');
    }
    return context;
}
