export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyTrack {
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: { name: string; images: SpotifyImage[] };
}

export interface SpotifyRecentlyPlayed {
  items: { played_at: string; track: SpotifyTrack }[];
}

export interface PlayedTrack {
  playedAt: string;
  name: string;
  artists: string[];
  album: { name: string; imageUrl: string | null };
  durationMs: number;
}

export interface RecentlyPlayedResponse {
  items: PlayedTrack[];
}

/** The most tracks Spotify returns from its listening history. */
export const RECENTLY_PLAYED_LIMIT = 50;

/** Covers are shown at 72px. Twice that stays sharp on high-density screens. */
const MIN_COVER_WIDTH = 144;

/** Picks the smallest image that is still sharp, else the widest, else null. An unknown width counts as 0. */
export function pickCover(images: SpotifyImage[]): string | null {
  const widestFirst = images.toSorted((a, b) => (b.width ?? 0) - (a.width ?? 0));
  const cover = widestFirst.findLast((image) => (image.width ?? 0) >= MIN_COVER_WIDTH) ?? widestFirst[0];
  return cover?.url ?? null;
}

/** Maps a Spotify track, played at the given ISO 8601 time, to the API shape. */
export function toPlayedTrack(track: SpotifyTrack, playedAt: string): PlayedTrack {
  return {
    playedAt,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: { name: track.album.name, imageUrl: pickCover(track.album.images) },
    durationMs: track.duration_ms,
  };
}

/** Maps Spotify's listening history to the API response. Keeps Spotify's order. */
export function toRecentlyPlayed(body: SpotifyRecentlyPlayed): RecentlyPlayedResponse {
  return { items: body.items.map(({ played_at, track }) => toPlayedTrack(track, played_at)) };
}
