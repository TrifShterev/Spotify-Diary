import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import App from './App.tsx';
import AppThemeProvider from './components/AppThemeProvider.tsx';
import { fontFamily, theme } from './theme.ts';

// Clerk's sign-in modal and user menu pick up the same warm palette as the rest of the app.
const clerkAppearance = {
  variables: {
    colorPrimary: theme.palette.primary.main,
    colorText: theme.palette.text.primary,
    fontFamily,
    borderRadius: '12px',
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider afterSignOutUrl="/" appearance={clerkAppearance}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </ClerkProvider>
  </StrictMode>,
);
