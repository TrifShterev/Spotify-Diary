import Avatar from '@mui/material/Avatar';
import { sunsetGradient } from '../theme.ts';

interface ProfileAvatarProps {
  name: string;
  imageUrl: string | null;
  size: number;
}

/** The user's Spotify picture in a sunset-coloured ring. Falls back to the first letter of their name. */
export default function ProfileAvatar({ name, imageUrl, size }: ProfileAvatarProps) {
  return (
    <Avatar
      src={imageUrl ?? undefined}
      alt=""
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 800,
        color: 'common.white',
        background: sunsetGradient,
        border: '4px solid',
        borderColor: 'background.paper',
        boxShadow: '0 0 0 3px rgba(242, 165, 65, 0.6)',
      }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
