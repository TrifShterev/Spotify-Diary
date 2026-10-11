import { Show, useAuth } from '@clerk/react';
import AuthBar from './components/AuthBar.tsx';
import ConnectSpotify from './components/ConnectSpotify.tsx';
import CurrentUser from './components/CurrentUser.tsx';
import ListeningHistory from './components/ListeningHistory.tsx';
import { SPOTIFY_LISTENING_SCOPES, SPOTIFY_PROFILE_SCOPES, useSpotifyScopes } from './hooks/useSpotifyScopes.ts';
import Home from './pages/Home.tsx';

export default function App() {
  const { isSignedIn } = useAuth();
  // Every prompt asks Spotify for every scope, so one approval unlocks the profile and the diary.
  const { connected, lacks, authorizeSpotify } = useSpotifyScopes();
  // Users who signed up without Spotify have nothing to show until they connect it.
  const needsSpotify = isSignedIn && connected === false;

  return (
    <>
      <AuthBar />
      <Home
        diary={
          isSignedIn && !needsSpotify ? (
            <ListeningHistory
              onAllowListeningHistory={lacks(SPOTIFY_LISTENING_SCOPES) ? authorizeSpotify : undefined}
            />
          ) : undefined
        }
      >
        <Show when="signed-in">
          {needsSpotify ? (
            <ConnectSpotify onConnect={authorizeSpotify} />
          ) : (
            <CurrentUser onShareMoreDetails={lacks(SPOTIFY_PROFILE_SCOPES) ? authorizeSpotify : undefined} />
          )}
        </Show>
      </Home>
    </>
  );
}
