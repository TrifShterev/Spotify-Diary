import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import type { NowPlayingTrack, PlayedTrack } from '../api.ts';
import { sunsetGradient } from '../theme.ts';
import { formatDuration, formatPlayedTime } from './listeningFormat.ts';

/** The cover's frame in px. The listening history's loading placeholder uses it too. */
export const COVER_SIZE = 72;

/**
 * One play from the listening history: album cover, song, performers, when it was played and how long it is.
 * The track playing right now is marked "Now playing", or "Paused"; its time is when this play started.
 */
export default function TrackItem({ play }: { play: PlayedTrack | NowPlayingTrack }) {
  const { name, artists, album, durationMs, playedAt } = play;

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.5 }} data-cy="track-item">
      <Avatar
        variant="square"
        src={album.imageUrl ?? undefined}
        alt={`${album.name} album cover`}
        sx={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          borderRadius: '4px',
          color: 'common.white',
          // A cover that isn't square keeps its proportions: it is scaled to fit, never cropped.
          '& .MuiAvatar-img': { objectFit: 'contain' },
          ...(!album.imageUrl && { background: sunsetGradient, boxShadow: '0 4px 12px rgba(59, 42, 37, 0.12)' }),
        }}
      >
        <MusicNoteRoundedIcon />
      </Avatar>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700 }} data-cy="track-name">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap data-cy="track-artists">
          {artists.join(', ')}
        </Typography>
        {'isPlaying' in play && <PlaybackChip isPlaying={play.isPlaying} />}
      </Box>

      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography
          component="time"
          dateTime={playedAt}
          sx={{ display: 'block', fontWeight: 700 }}
          data-cy="track-played-at"
        >
          {formatPlayedTime(new Date(playedAt))}
        </Typography>
        <Typography variant="body2" color="text.secondary" data-cy="track-duration">
          {formatDuration(durationMs)}
        </Typography>
      </Box>
    </Stack>
  );
}

/** "Now playing" while the track plays, "Paused" while playback is paused. */
function PlaybackChip({ isPlaying }: { isPlaying: boolean }) {
  return (
    <Chip
      size="small"
      icon={isPlaying ? <GraphicEqRoundedIcon /> : <PauseRoundedIcon />}
      label={isPlaying ? 'Now playing' : 'Paused'}
      sx={{
        mt: 0.5,
        ...(isPlaying
          ? { color: 'primary.dark', backgroundColor: 'rgba(200, 85, 61, 0.12)' }
          : { color: 'text.secondary', backgroundColor: 'rgba(59, 42, 37, 0.06)' }),
        '& .MuiChip-icon': { color: 'inherit' },
      }}
      data-cy="track-playback"
    />
  );
}
