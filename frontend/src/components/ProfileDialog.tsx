import { useState, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import type { MeResponse } from '../api.ts';
import { sunsetGradient } from '../theme.ts';
import ProfileAvatar from './ProfileAvatar.tsx';
import { formatCountry, formatFollowers, formatPlan } from './profileFormat.ts';

interface ProfileDialogProps {
  me: MeResponse;
  open: boolean;
  onClose: () => void;
}

interface Detail {
  label: string;
  value: string;
  icon: ReactNode;
  action?: ReactNode;
}

/** "My profile": everything we know about the signed-in user's Spotify account. Full screen on phones. */
export default function ProfileDialog({ me, open, onClose }: ProfileDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { spotify } = me;
  const name = spotify.displayName ?? spotify.id;

  const details: Detail[] = [];
  if (spotify.email) details.push({ label: 'Email', value: spotify.email, icon: <MailRoundedIcon /> });
  if (spotify.country) {
    details.push({
      label: 'Country',
      value: `${formatCountry(spotify.country)} (${spotify.country})`,
      icon: <PlaceRoundedIcon />,
    });
  }
  if (spotify.followers !== null) {
    details.push({ label: 'Followers', value: formatFollowers(spotify.followers), icon: <FavoriteRoundedIcon /> });
  }
  details.push({
    label: 'Spotify ID',
    value: spotify.id,
    icon: <TagRoundedIcon />,
    action: <CopyButton text={spotify.id} label="Copy Spotify ID" />,
  });
  details.push({ label: 'Diary account ID', value: me.userId, icon: <BadgeRoundedIcon /> });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
      aria-labelledby="profile-dialog-title"
      data-cy="profile-dialog"
    >
      <Box sx={{ position: 'relative', height: 96, flexShrink: 0, background: sunsetGradient }}>
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'common.white' }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Outside DialogContent, so the avatar overlapping the banner never scrolls or gets clipped. */}
      <Stack
        spacing={1}
        sx={{ position: 'relative', alignItems: 'center', mt: '-52px', px: 3, textAlign: 'center' }}
      >
        <ProfileAvatar name={name} imageUrl={spotify.imageUrl} size={104} />
        <Box>
          <Typography id="profile-dialog-title" variant="h3" component="h2">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            My profile
          </Typography>
        </Box>
        {spotify.product && (
          <Chip
            icon={<WorkspacePremiumRoundedIcon />}
            label={formatPlan(spotify.product)}
            color="secondary"
            size="small"
          />
        )}
      </Stack>

      <Divider sx={{ mx: 3, mt: 2 }} />

      <DialogContent sx={{ py: 1 }}>
        <List dense disablePadding>
          {details.map((detail) => (
            <ListItem key={detail.label} disableGutters secondaryAction={detail.action}>
              <ListItemIcon sx={{ minWidth: 48, color: 'primary.main' }}>{detail.icon}</ListItemIcon>
              <ListItemText
                primary={detail.label}
                secondary={detail.value}
                slotProps={{
                  primary: { variant: 'body2', color: 'text.secondary' },
                  secondary: { variant: 'body1', color: 'text.primary', sx: { wordBreak: 'break-all' } },
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Close</Button>
        {spotify.profileUrl && (
          <Button
            variant="contained"
            href={spotify.profileUrl}
            target="_blank"
            rel="noreferrer"
            endIcon={<OpenInNewRoundedIcon />}
          >
            Open in Spotify
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  };

  return (
    <Tooltip title={copied ? 'Copied!' : label} onClose={() => setCopied(false)}>
      <IconButton edge="end" aria-label={label} onClick={copy} data-cy="copy-spotify-id">
        <ContentCopyRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
