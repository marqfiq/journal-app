import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { getTheme } from '../theme';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
    mode: ThemeMode;
    accentColor: AccentColor;
    fontSize: FontSize;
    setMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS: Record<AccentColor, { primary: string; secondary: string }> = {
    pink: { primary: '#E0B0B6', secondary: '#D4C4B7' },
    blue: { primary: '#A7C7E7', secondary: '#C4D4E0' },
    green: { primary: '#A8D5BA', secondary: '#C8D9C3' },
    purple: { primary: '#C3B1E1', secondary: '#DCD3E8' },
    orange: { primary: '#FFDAC1', secondary: '#E8D3C4' },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        return (localStorage.getItem('themeMode') as ThemeMode) || 'light';
    });
    const [accentColor, setAccentColor] = useState<AccentColor>(() => {
        return (localStorage.getItem('accentColor') as AccentColor) || 'pink';
    });
    const [fontSize, setFontSize] = useState<FontSize>(() => {
        return (localStorage.getItem('fontSize') as FontSize) || 'medium';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor);
        // Update CSS variable for Tailwind/global styles
        const colors = ACCENT_COLORS[accentColor];
        document.documentElement.style.setProperty('--color-primary', colors.primary);
        document.documentElement.style.setProperty('--color-secondary', colors.secondary);
    }, [accentColor]);

    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

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
