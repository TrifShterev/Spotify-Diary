import { createTheme } from '@mui/material/styles';

// A warm "sunset vinyl" palette: terracotta, amber and cocoa on a cream background.
const COLORS = {
  terracotta: '#C8553D',
  coral: '#E07A5F',
  amber: '#F2A541',
  honey: '#F6C667',
  cream: '#FFF6EC',
  cocoa: '#3B2A25',
  cocoaMuted: '#7D6258',
};

export const sunsetGradient = `linear-gradient(135deg, ${COLORS.coral} 0%, ${COLORS.amber} 60%, ${COLORS.honey} 100%)`;

export const fontFamily = "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.terracotta, light: COLORS.coral, dark: '#A43F2B', contrastText: '#FFFFFF' },
    secondary: { main: COLORS.amber, light: COLORS.honey, dark: '#C9822A', contrastText: COLORS.cocoa },
    background: { default: COLORS.cream, paper: '#FFFFFF' },
    text: { primary: COLORS.cocoa, secondary: COLORS.cocoaMuted },
    divider: 'rgba(59, 42, 37, 0.1)',
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily,
    h1: { fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 },
    h3: { fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.3 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          // A soft glow of sunset colours behind the content.
          backgroundImage: [
            'radial-gradient(circle at 0% 0%, rgba(242, 165, 65, 0.18), transparent 40%)',
            'radial-gradient(circle at 100% 0%, rgba(224, 122, 95, 0.16), transparent 40%)',
          ].join(', '),
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 999, paddingInline: 20 } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: '1px solid rgba(59, 42, 37, 0.08)',
          boxShadow: '0 12px 32px rgba(200, 85, 61, 0.08)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700 } },
    },
    MuiDialog: {
      // Full-screen dialogs (on phones) fill the screen edge to edge, so they keep square corners.
      styleOverrides: { paper: ({ ownerState }) => ({ borderRadius: ownerState.fullScreen ? 0 : 24 }) },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 16 } },
    },
  },
});
