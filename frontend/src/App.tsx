import { Show } from '@clerk/react';
import AuthBar from './components/AuthBar.tsx';
import CurrentUser from './components/CurrentUser.tsx';
import Home from './pages/Home.tsx';

export default function App() {
  return (
    <>
      <AuthBar />
      <Home>
        <Show when="signed-in">
          <CurrentUser />
        </Show>
      </Home>
    </>
  );
}
