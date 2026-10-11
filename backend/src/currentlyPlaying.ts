import { type PlayedTrack, type SpotifyTrack, toPlayedTrack } from './recentlyPlayed.ts';

export interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  /** A track only when `currently_playing_type` is 'track'. */
  item: SpotifyTrack | null;
}

export interface NowPlayingTrack extends PlayedTrack {
  isPlaying: boolean;
}

export interface CurrentlyPlayingResponse {
  nowPlaying: NowPlayingTrack | null;
}

/**
 * Maps Spotify's playback state to the API response. `body` is null when nothing is playing (204).
 * `playedAt` estimates when this play started: `now` (epoch ms) minus the playback progress.
 * Podcast episodes and ads count as nothing playing.
 */
export function toCurrentlyPlaying(body: SpotifyCurrentlyPlaying | null, now: number): CurrentlyPlayingResponse {
  if (!body?.item || body.currently_playing_type !== 'track') return { nowPlaying: null };

  const playedAt = new Date(now - (body.progress_ms ?? 0)).toISOString();
  return { nowPlaying: { ...toPlayedTrack(body.item, playedAt), isPlaying: body.is_playing } };
}
