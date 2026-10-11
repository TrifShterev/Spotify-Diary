import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import type { MeResponse } from '../api.ts';
import ProfileAvatar from './ProfileAvatar.tsx';
import ProfileDialog from './ProfileDialog.tsx';
import { formatCountry, formatFollowers, formatPlan } from './profileFormat.ts';

type State =
  | { status: 'loading' }
  | { status: 'ready'; me: MeResponse }
  | { status: 'error'; message: string };

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'No Spotify account is connected to your profile.',
  502: 'Spotify did not respond as expected. Please try again later.',
};

const AVATAR_SIZE = 88;

export default function CurrentUser() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    // Same-origin request: the browser attaches Clerk's session cookie automatically.
    fetch('/api/me', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(ERROR_MESSAGES[res.status] ?? `Request failed with status ${res.status}.`);
        }
        setState({ status: 'ready', me: (await res.json()) as MeResponse });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });

    return () => controller.abort();
  }, []);

  if (state.status === 'loading') {
    return (
      <Card component="section" aria-busy="true" aria-label="Loading your Spotify profile" data-cy="current-user">
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
            <Skeleton variant="circular" width={AVATAR_SIZE} height={AVATAR_SIZE} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="text" width="60%" sx={{ fontSize: '1.5rem' }} />
              <Skeleton variant="rounded" width="45%" height={24} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'error') {
    return (
      <Alert severity="error" variant="outlined" sx={{ backgroundColor: 'background.paper' }} data-cy="current-user">
        <AlertTitle>We couldn't load your profile</AlertTitle>
        {state.message}
      </Alert>
    );
  }

  const { me } = state;
  const { spotify } = me;
  const name = spotify.displayName ?? spotify.id;

  return (
    <Card component="section" data-cy="current-user">
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
          <ProfileAvatar name={name} imageUrl={spotify.imageUrl} size={AVATAR_SIZE} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800 }}>
              Welcome back
            </Typography>
            <Typography variant="h2" sx={{ mb: 1 }}>
              Hi, {name}!
            </Typography>
            <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
              {spotify.product && (
                <Chip
                  icon={<WorkspacePremiumRoundedIcon />}
                  label={formatPlan(spotify.product)}
                  color="secondary"
                  size="small"
                />
              )}
              {spotify.country && (
                <Chip icon={<PlaceRoundedIcon />} label={formatCountry(spotify.country)} size="small" />
              )}
              {spotify.followers !== null && (
                <Chip icon={<FavoriteRoundedIcon />} label={formatFollowers(spotify.followers)} size="small" />
              )}
            </Stack>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonRoundedIcon />}
            onClick={() => setProfileOpen(true)}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}
            data-cy="my-profile-button"
          >
            My profile
          </Button>
        </Stack>
      </CardContent>

      <ProfileDialog me={me} open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Card>
  );
}
