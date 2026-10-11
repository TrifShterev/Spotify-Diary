import type { CurrentlyPlayingResponse, NowPlayingTrack, PlayedTrack, RecentlyPlayedResponse } from '../../src/api.ts';

/** Served by `cy.intercept()` from `cypress/fixtures/album-cover.png`, so no remote image is loaded. */
export const ALBUM_COVER_URL = '/fixtures/album-cover.png';

/** A 16:9 cover from `cypress/fixtures/album-cover-wide.png`, to check that covers keep their proportions. */
export const WIDE_ALBUM_COVER_URL = '/fixtures/album-cover-wide.png';

/**
 * "Now" in the tests: Sunday, October 11, 2026, 6 PM. Pass it to `cy.clock()` so "Today" and "Yesterday" are stable.
 * Play times are built in the browser's local time zone as well, so the rendered times are the same on every machine.
 */
export const NOW = new Date(2026, 9, 11, 18, 0);

/** An ISO timestamp for a local date and time in October 2026. */
function playedOn(day: number, hours: number, minutes: number): string {
  return new Date(2026, 9, day, hours, minutes).toISOString();
}

/** A typical play: one artist, an album cover, played this afternoon. */
export const playedTrack: PlayedTrack = {
  playedAt: playedOn(11, 14, 5),
  name: 'Paper Lanterns',
  artists: ['The Velvet Tides'],
  album: { name: 'Harbour Lights', imageUrl: ALBUM_COVER_URL },
  durationMs: 225_000,
};

/** A play with several performers and a title too long for one line on a phone. */
export const collaborationTrack: PlayedTrack = {
  playedAt: playedOn(10, 22, 47),
  name: 'Midnight Train Through the Northern Lights (Extended Orchestral Version)',
  artists: ['Aurora Fields', 'Nils Berg', 'The Copenhagen Strings'],
  album: { name: 'Northern Lights', imageUrl: ALBUM_COVER_URL },
  durationMs: 3_723_000,
};

/** A play whose cover isn't square, e.g. a video podcast's artwork. */
export const trackWithWideCover: PlayedTrack = {
  playedAt: playedOn(11, 11, 20),
  name: 'Live at the Lighthouse',
  artists: ['Harbour Session Band'],
  album: { name: 'Lighthouse Sessions', imageUrl: WIDE_ALBUM_COVER_URL },
  durationMs: 312_000,
};

/** A play whose album has no cover, e.g. a local file. */
export const trackWithoutCover: PlayedTrack = {
  playedAt: playedOn(7, 9, 30),
  name: 'Voice Memo Jam',
  artists: ['Maria Ivanova'],
  album: { name: 'Local Files', imageUrl: null },
  durationMs: 61_000,
};

/**
 * Plays across three days, deliberately out of order so the tests prove the list sorts them.
 * Newest first, they are: today 2:05 PM, today 9:15 AM, yesterday 10:47 PM, yesterday 8:00 AM, Wednesday 9:30 AM.
 */
export const recentlyPlayedResponse: RecentlyPlayedResponse = {
  items: [
    collaborationTrack,
    {
      playedAt: playedOn(11, 9, 15),
      name: 'Morning Coffee',
      artists: ['Lo-Fi Lena'],
      album: { name: 'Slow Mornings', imageUrl: ALBUM_COVER_URL },
      durationMs: 154_000,
    },
    trackWithoutCover,
    playedTrack,
    {
      playedAt: playedOn(10, 8, 0),
      name: 'Commute',
      artists: ['City Pulse'],
      album: { name: 'Rush Hour', imageUrl: ALBUM_COVER_URL },
      durationMs: 198_000,
    },
  ],
};

/** The plays of `recentlyPlayedResponse` from before today: Yesterday's two and Wednesday's one. */
export const playsBeforeTodayResponse: RecentlyPlayedResponse = {
  items: recentlyPlayedResponse.items.filter((play) => new Date(play.playedAt) < new Date(2026, 9, 11)),
};

/** The track playing right now (`isPlaying`), started two minutes before `NOW`. Not in the history yet. */
export const nowPlayingTrack: NowPlayingTrack = {
  playedAt: playedOn(11, 17, 58),
  name: 'Golden Hour Drive',
  artists: ['Sunset Avenue'],
  album: { name: 'Coastline', imageUrl: ALBUM_COVER_URL },
  durationMs: 241_000,
  isPlaying: true,
};

/** The same track, paused. */
export const pausedTrack: NowPlayingTrack = { ...nowPlayingTrack, isPlaying: false };

export const currentlyPlayingResponse: CurrentlyPlayingResponse = { nowPlaying: nowPlayingTrack };
