import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { sunsetGradient } from '../theme.ts';

interface ConnectSpotifyProps {
  /** Sends the user to Spotify to connect their account. */
  onConnect: () => Promise<void>;
}

/** Shown instead of the profile and the diary to a user who signed up without Spotify. */
export default function ConnectSpotify({ onConnect }: ConnectSpotifyProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'failed'>('idle');

  // On success the browser leaves for Spotify's consent page, so only a failure needs handling here.
  const connect = () => {
    setStatus('connecting');
    onConnect().catch(() => setStatus('failed'));
  };

  return (
    <Card component="section" data-cy="connect-spotify">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
          <Box
            aria-hidden
            sx={{
              display: 'grid',
              flexShrink: 0,
              placeItems: 'center',
              width: 64,
              height: 64,
              borderRadius: 4,
              color: 'common.white',
              background: sunsetGradient,
            }}
          >
            <HeadphonesRoundedIcon fontSize="large" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              Connect your Spotify account
            </Typography>
            <Typography color={status === 'failed' ? 'error' : 'text.secondary'}>
              {status === 'failed'
                ? "We couldn't reach Spotify. Please try again."
                : 'Spotify Diary reads your profile and listening history from Spotify. Connect your account to start your diary.'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<LinkRoundedIcon />}
            loading={status === 'connecting'}
            onClick={connect}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
          >
            Connect Spotify
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
