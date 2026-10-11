import { Show, SignInButton, UserButton } from '@clerk/react';
import Button from '@mui/material/Button';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
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
        <UserButton />
      </Show>
    </AppHeader>
  );
}
