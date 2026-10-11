import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import { sunsetGradient } from '../theme.ts';

export default function Home({ children }: { children?: ReactNode }) {
  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Box component="header" sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            display: 'inline-block',
            background: sunsetGradient,
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Spotify Diary
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, fontSize: '1.125rem' }}>
          Explore and reflect on your Spotify listening habits.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {children}

        <Card component="section">
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box
                aria-hidden
                sx={{
                  display: 'grid',
                  flexShrink: 0,
                  placeItems: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  color: 'primary.main',
                  backgroundColor: 'rgba(242, 165, 65, 0.18)',
                }}
              >
                <AutoStoriesRoundedIcon />
              </Box>
              <Box>
                <Typography variant="h2" sx={{ mb: 0.5 }}>
                  Your diary
                </Typography>
                <Typography color="text.secondary">
                  Your recent tracks, favourite artists and listening moments will appear here soon.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
