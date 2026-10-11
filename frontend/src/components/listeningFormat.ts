// A fixed locale keeps the wording consistent with the rest of the (English) UI.
// Times and days are shown in the user's own time zone.
const timeFormat = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' });
const dayWithYearFormat = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

/** 225000 → "3:45", 3723000 → "1:02:03". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/** The time of day a track was played, e.g. "2:05 PM". */
export function formatPlayedTime(playedAt: Date): string {
  return timeFormat.format(playedAt);
}

/** The calendar day in the user's time zone, e.g. "2026-10-09". Plays with the same key happened on the same day. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "Today", "Yesterday", "Friday, October 9", or "Wednesday, December 31, 2025" for another year. */
export function formatDay(date: Date, now = new Date()): string {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (dayKey(date) === dayKey(now)) return 'Today';
  if (dayKey(date) === dayKey(yesterday)) return 'Yesterday';
  return date.getFullYear() === now.getFullYear() ? dayFormat.format(date) : dayWithYearFormat.format(date);
}

/** 1 → "1 track", 12 → "12 tracks". */
export function formatTrackCount(count: number): string {
  return `${count} ${count === 1 ? 'track' : 'tracks'}`;
}
