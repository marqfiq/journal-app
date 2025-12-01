import { createTheme } from '@mui/material/styles';

// Define custom colors matching index.css
const colors = {
  primary: '#E0B0B6', // Dusty Pink
  secondary: '#D4C4B7', // Warm Beige
  background: '#FAF9F6', // Off White
  surface: '#FFFFFF',
  text: '#4A4A4A',
  error: '#FFB4AB',
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary,
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: '#8A8A8A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
      textTransform: 'none', // More natural feel
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16, // Softer corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(224, 176, 182, 0.4)',
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
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)', // Very subtle shadow
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.05)',
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

export default theme;
