import { Show, SignInButton, UserButton } from '@clerk/react';
import Button from '@mui/material/Button';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { SPOTIFY_SCOPES } from '../hooks/useSpotifyScopes.ts';
import AppHeader from './AppHeader.tsx';

export default function AuthBar() {
  return (
    <AppHeader>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <Button variant="contained" startIcon={<LoginRoundedIcon />}>
            Sign in with Spotify
          </Button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        {/* "Manage account" offers to reconnect Spotify when these scopes are missing. */}
        <UserButton userProfileProps={{ additionalOAuthScopes: { spotify: SPOTIFY_SCOPES } }} />
      </Show>
    </AppHeader>
  );
}
