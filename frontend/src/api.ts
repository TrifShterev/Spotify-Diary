/** Response of `GET /api/me`. */
export interface MeResponse {
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

/** One play of a track from the user's Spotify listening history. */
export interface PlayedTrack {
  /** ISO timestamp of when the user played the track. */
  playedAt: string;
  name: string;
  artists: string[];
  album: { name: string; imageUrl: string | null };
  durationMs: number;
}

/** Response of `GET /api/recently-played`: the user's last plays, as Spotify returns them. */
export interface RecentlyPlayedResponse {
  items: PlayedTrack[];
}

/**
 * The track the user is playing right now. Spotify adds it to the history only once it ends.
 * Its `playedAt` is the estimated start of this play: server time minus Spotify's playback progress.
 */
export interface NowPlayingTrack extends PlayedTrack {
  /** False when playback is paused. */
  isPlaying: boolean;
}

/** Response of `GET /api/currently-playing`: `nowPlaying` is null when no track is playing. */
export interface CurrentlyPlayingResponse {
  nowPlaying: NowPlayingTrack | null;
}
