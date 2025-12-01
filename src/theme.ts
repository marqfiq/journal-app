import { createTheme, alpha } from '@mui/material/styles';
import { ACCENT_COLORS } from './context/ThemeContext';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'pink' | 'blue' | 'green' | 'purple' | 'orange';
type FontSize = 'small' | 'medium' | 'large';

export const getTheme = (mode: ThemeMode, accentColor: AccentColor, fontSize: FontSize) => {
  const colors = ACCENT_COLORS[accentColor];

  const fontSizeMultiplier = {
    small: 0.875,
    medium: 1,
    large: 1.125,
  }[fontSize];

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
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14 * fontSizeMultiplier,
      h1: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 700,
      },
      h2: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
      },
      h3: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 600,
      },
      h4: {
        fontFamily: '"Playfair Display", serif',
        fontWeight: 500,
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
