import { Show, SignInButton, UserButton } from '@clerk/react';

export default function AuthBar() {
  return (
    <nav className="auth-bar">
      <span className="auth-bar__brand">Spotify Diary</span>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="button button--primary">
            Sign in with Spotify
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </nav>
  );
}
