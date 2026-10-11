import { useEffect, useId, useState } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import type { CurrentlyPlayingResponse, NowPlayingTrack, PlayedTrack, RecentlyPlayedResponse } from '../api.ts';
import AllowScopesPrompt from './AllowScopesPrompt.tsx';
import { dayKey, formatDay, formatTrackCount } from './listeningFormat.ts';
import TrackItem, { COVER_SIZE } from './TrackItem.tsx';

type State =
  | { status: 'loading' }
  | { status: 'ready'; plays: PlayedTrack[]; nowPlaying: NowPlayingTrack | null }
  | { status: 'error'; message: string };

interface Day {
  key: string;
  label: string;
  plays: (PlayedTrack | NowPlayingTrack)[];
}

// Keyed by the API's `error` code: a 403 can mean either "not connected" or "scope missing".
const ERROR_MESSAGES = new Map([
  ['unauthenticated', 'Your session has expired. Please sign in again.'],
  ['spotify_not_connected', 'No Spotify account is connected to your profile.'],
  [
    'spotify_scope_missing',
    "Spotify hasn't shared your listening history yet. Reconnect Spotify under Manage account and allow access to your recently played tracks.",
  ],
  ['spotify_error', 'Spotify did not respond as expected. Please try again later.'],
]);

const SKELETON_ROWS = 3;

/** A friendly message for a failed request, chosen by the `error` code in the response body. */
async function errorMessage(res: Response): Promise<string> {
  // A proxy or server crash may answer with HTML or nothing at all instead of the API's JSON error.
  const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
  const message = typeof body?.error === 'string' ? ERROR_MESSAGES.get(body.error) : undefined;
  return message ?? `Request failed with status ${res.status}.`;
}

/**
 * The track playing now, or null. Never fails: without it the history still shows,
 * so an error status, a network error or an unexpected body all count as nothing playing.
 */
async function fetchNowPlaying(signal: AbortSignal): Promise<NowPlayingTrack | null> {
  try {
    const res = await fetch('/api/currently-playing', { signal });
    if (!res.ok) return null;
    const { nowPlaying } = (await res.json()) as CurrentlyPlayingResponse;
    return nowPlaying ?? null;
  } catch {
    return null;
  }
}

/**
 * Newest play first, grouped into days in the user's time zone. Today always comes first, even with no plays,
 * and starts with the track playing now: Spotify adds it to the history only once it ends.
 */
function groupByDay(plays: PlayedTrack[], nowPlaying: NowPlayingTrack | null): Day[] {
  const sorted = [...plays].sort((a, b) => Date.parse(b.playedAt) - Date.parse(a.playedAt));
  const now = new Date();
  const today: Day = { key: dayKey(now), label: formatDay(now, now), plays: nowPlaying ? [nowPlaying] : [] };
  const days = new Map([[today.key, today]]);
  for (const play of sorted) {
    const playedAt = new Date(play.playedAt);
    const key = dayKey(playedAt);
    const day = days.get(key) ?? { key, label: formatDay(playedAt), plays: [] };
    day.plays.push(play);
    days.set(key, day);
  }
  return [...days.values()];
}

interface ListeningHistoryProps {
  /** Set when Spotify hasn't shared the listening history yet. Asks Spotify for it. */
  onAllowListeningHistory?: () => Promise<void>;
}

/** The signed-in user's recently played tracks, newest first, in one section per day. */
export default function ListeningHistory({ onAllowListeningHistory }: ListeningHistoryProps) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const titleId = useId();
  const needsPermission = onAllowListeningHistory !== undefined;

  useEffect(() => {
    if (needsPermission) return;
    const controller = new AbortController();

    // Same-origin requests, made in parallel: the browser attaches Clerk's session cookie automatically.
    const history = fetch('/api/recently-played', { signal: controller.signal }).then(async (res) => {
      if (!res.ok) throw new Error(await errorMessage(res));
      const { items } = (await res.json()) as RecentlyPlayedResponse;
      return items;
    });

    // Only the history decides between loading, error and ready.
    Promise.all([history, fetchNowPlaying(controller.signal)])
      .then(([plays, nowPlaying]) => setState({ status: 'ready', plays, nowPlaying }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setState({ status: 'error', message: err instanceof Error ? err.message : String(err) });
      });

    return () => controller.abort();
  }, [needsPermission]);

  return (
    <Box component="section" aria-labelledby={titleId} data-cy="listening-history">
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
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
          <Typography id={titleId} variant="h2">
            Your diary
          </Typography>
          <Typography color="text.secondary">What you've been listening to lately, newest first.</Typography>
        </Box>
      </Stack>

      {onAllowListeningHistory ? (
        <AllowScopesPrompt
          message="Allow Spotify Diary to see what you've been listening to."
          onAllow={onAllowListeningHistory}
          data-cy="allow-listening-history"
        />
      ) : (
        <ListeningHistoryContent state={state} />
      )}
    </Box>
  );
}

function ListeningHistoryContent({ state }: { state: State }) {
  if (state.status === 'loading') {
    return (
      <Card aria-busy="true" aria-label="Loading your listening history">
        <CardContent>
          <Skeleton variant="text" width="25%" sx={{ fontSize: '1.25rem', mb: 1 }} />
          {Array.from({ length: SKELETON_ROWS }, (_, row) => (
            <Stack key={row} direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.5 }}>
              <Skeleton variant="rounded" width={COVER_SIZE} height={COVER_SIZE} sx={{ borderRadius: '4px' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="30%" />
              </Box>
            </Stack>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (state.status === 'error') {
    return (
      <Alert severity="error" variant="outlined" sx={{ backgroundColor: 'background.paper' }}>
        <AlertTitle>We couldn't load your listening history</AlertTitle>
        {state.message}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {groupByDay(state.plays, state.nowPlaying).map((day) => (
        <DaySection key={day.key} day={day} />
      ))}
    </Stack>
  );
}

function DaySection({ day }: { day: Day }) {
  const headingId = useId();

  return (
    <Card component="section" aria-labelledby={headingId} data-cy="listening-day">
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Typography id={headingId} variant="h3">
            {day.label}
          </Typography>
          {day.plays.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }} data-cy="listening-day-count">
              {formatTrackCount(day.plays.length)}
            </Typography>
          )}
        </Stack>
        {/* Only Today can be empty: every other day exists because something was played on it. */}
        {day.plays.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }} data-cy="listening-day-empty">
            Nothing played yet today.
          </Typography>
        ) : (
          <Box component="ol" sx={{ listStyle: 'none', m: 0, mt: 1, p: 0 }}>
            {day.plays.map((play) => (
              <Box
                component="li"
                key={play.playedAt}
                sx={{ '& + &': { borderTop: 1, borderColor: 'divider' } }}
              >
                <TrackItem play={play} />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
