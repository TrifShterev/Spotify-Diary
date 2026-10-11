import type { ReactNode } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import { sunsetGradient } from '../theme.ts';

/** The top bar with the app's brand. `children` are the actions shown on the right, e.g. the sign-in button. */
export default function AppHeader({ children }: { children?: ReactNode }) {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255, 246, 236, 0.8)' }}
    >
      <Container maxWidth="md">
        <Toolbar disableGutters sx={{ gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 40,
                height: 40,
                borderRadius: 3,
                color: 'common.white',
                background: sunsetGradient,
              }}
            >
              <HeadphonesRoundedIcon />
            </Box>
            <Typography component="span" variant="h6" sx={{ fontWeight: 800 }}>
              Spotify Diary
            </Typography>
          </Box>
          {children}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
