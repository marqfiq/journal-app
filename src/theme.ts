import { createTheme, alpha } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange';
export type FontSize = 'small' | 'medium' | 'large';

export const HEADER_FONTS = [
  { name: 'Pompiere', value: '"Pompiere", serif' },
  { name: 'Poiret One', value: '"Poiret One", serif' },
  { name: 'Coming Soon', value: '"Coming Soon", cursive' },
  { name: 'Short Stack', value: '"Short Stack", cursive' },
  { name: 'Klee One', value: '"Klee One", cursive' },
  { name: 'Playpen Sans', value: '"Playpen Sans", cursive' },
  { name: 'Patrick Hand', value: '"Patrick Hand", cursive' },
  { name: 'Gaegu', value: '"Gaegu", cursive' },
  { name: 'DM Serif Text', value: '"DM Serif Text", serif' },
  { name: 'Monoton', value: '"Monoton", cursive' },
];

export const BODY_FONTS = [
  { name: 'Inter', value: '"Inter", sans-serif' },
  { name: 'Roboto', value: '"Roboto", sans-serif' },
  { name: 'Lato', value: '"Lato", sans-serif' },
  { name: 'Short Stack', value: '"Short Stack", cursive' },
  { name: 'Klee One', value: '"Klee One", cursive' },
  { name: 'Playpen Sans', value: '"Playpen Sans", cursive' },
  { name: 'Coming Soon', value: '"Coming Soon", cursive' },
];

export const ACCENT_COLORS: Record<AccentColor, { primary: string; secondary: string }> = {
  pink: { primary: '#E0B0B6', secondary: '#D4C4B7' },
  blue: { primary: '#A7C7E7', secondary: '#C4D4E0' },
  green: { primary: '#A8D5BA', secondary: '#C8D9C3' },
  purple: { primary: '#C3B1E1', secondary: '#DCD3E8' },
  orange: { primary: '#FFDAC1', secondary: '#E8D3C4' },
};

export const getTheme = (mode: ThemeMode, accentColor: AccentColor, fontSize: FontSize) => {
  const colors = ACCENT_COLORS[accentColor] || ACCENT_COLORS.pink;

  const fontSizeMultiplier = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  }[fontSize] || 1;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.secondary,
        contrastText: '#FFFFFF',
      },
      background: {
        default: mode === 'light'
          ? alpha(colors.primary, 0.08)
          : alpha(colors.primary, 0.04), // Faint tint over the base HTML background
        paper: mode === 'light' ? '#FFFFFF' : '#2C2C2C',
      },
      text: {
        primary: mode === 'light' ? '#4A4A4A' : '#E0E0E0',
        secondary: mode === 'light' ? '#8A8A8A' : '#A0A0A0',
      },
    },
    typography: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14 * fontSizeMultiplier,
      h1: {
        fontFamily: 'var(--font-serif)',
        fontWeight: 200,
      },
      h2: {
        fontFamily: 'var(--font-serif)',
        fontWeight: 200,
      },
      h3: {
        fontFamily: 'var(--font-serif)',
        fontWeight: 200,
      },
      h4: {
        fontFamily: 'var(--font-serif)',
        fontWeight: 200,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: mode === 'light' ? '#E0E0E0 #FFFFFF' : '#404040 #1A1A1A',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
              backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#E0E0E0' : '#404040',
              minHeight: 24,
              border: mode === 'light' ? '2px solid #FFFFFF' : '2px solid #1A1A1A',
            },
            '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
              backgroundColor: mode === 'light' ? '#BDBDBD' : '#606060',
            },
            '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active': {
              backgroundColor: mode === 'light' ? '#BDBDBD' : '#606060',
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              backgroundColor: colors.primary, // Use accent color on hover
            },
            '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
              backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A1A',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0px 4px 12px ${colors.primary}66`, // 40% opacity
            },
          },
          contained: {
            color: '#FFFFFF',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: mode === 'light' ? '0px 4px 20px rgba(0, 0, 0, 0.03)' : '0px 4px 20px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: colors.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.primary,
              },
            },
          },
        },
      },
    },
  });
};
