import { Show } from '@clerk/react';
import AuthBar from './components/AuthBar.tsx';
import CurrentUser from './components/CurrentUser.tsx';
import { useSpotifyScopes } from './hooks/useSpotifyScopes.ts';
import Home from './pages/Home.tsx';

export default function App() {
  const { missingScopes, requestMissingScopes } = useSpotifyScopes();

  return (
    <>
      <AuthBar />
      <Home>
        <Show when="signed-in">
          <CurrentUser onShareMoreDetails={missingScopes.length > 0 ? requestMissingScopes : undefined} />
        </Show>
      </Home>
    </>
  );
}
