import { useEffect, useState } from 'react';

interface MeResponse {
  userId: string;
  spotify: {
    id: string;
    displayName: string | null;
    email: string | null;
    country: string | null;
    product: string | null;
    imageUrl: string | null;
    profileUrl: string | null;
    followers: number | null;
  };
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; me: MeResponse }
  | { status: 'error'; message: string };

const ERROR_MESSAGES: Record<number, string> = {
  401: 'Your session has expired. Please sign in again.',
  403: 'No Spotify account is connected to your profile.',
  502: 'Spotify did not respond as expected. Please try again later.',
};

export default function CurrentUser() {
  const [state, setState] = useState<State>({ status: 'loading' });

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
    return <section className="card">Loading your Spotify profile…</section>;
  }

  if (state.status === 'error') {
    return (
      <section className="card card--error" role="alert">
        {state.message}
      </section>
    );
  }

  const { spotify } = state.me;
  const name = spotify.displayName ?? spotify.id;

  return (
    <section className="card current-user">
      {spotify.imageUrl && <img className="current-user__avatar" src={spotify.imageUrl} alt="" />}
      <div>
        <h2>Hi, {name}!</h2>
        <dl className="current-user__details">
          {spotify.email && (
            <>
              <dt>Email</dt>
              <dd>{spotify.email}</dd>
            </>
          )}
          {spotify.product && (
            <>
              <dt>Plan</dt>
              <dd className="current-user__plan">{spotify.product}</dd>
            </>
          )}
          {spotify.country && (
            <>
              <dt>Country</dt>
              <dd>{spotify.country}</dd>
            </>
          )}
          {spotify.followers !== null && (
            <>
              <dt>Followers</dt>
              <dd>{spotify.followers}</dd>
            </>
          )}
        </dl>
        {spotify.profileUrl && (
          <a href={spotify.profileUrl} target="_blank" rel="noreferrer">
            Open in Spotify
          </a>
        )}
      </div>
    </section>
  );
}
