import { useState } from 'react';
import Alert, { type AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';

interface AllowScopesPromptProps extends Omit<AlertProps, 'icon' | 'action' | 'children'> {
  /** What the user allows, e.g. "Allow Spotify Diary to show your country and Spotify plan." */
  message: string;
  /** Asks Spotify for the missing scopes. */
  onAllow: () => Promise<void>;
}

/** Asks the user to let Spotify share more with the diary. */
export default function AllowScopesPrompt({ message, onAllow, sx, ...alertProps }: AllowScopesPromptProps) {
  const [status, setStatus] = useState<'idle' | 'allowing' | 'failed'>('idle');

  // On success the browser leaves for Spotify's consent page, so only a failure needs handling here.
  const allow = () => {
    setStatus('allowing');
    onAllow().catch(() => setStatus('failed'));
  };

  return (
    <Alert
      icon={<LockOpenRoundedIcon />}
      action={
        <Button color="primary" size="small" loading={status === 'allowing'} onClick={allow}>
          Allow
        </Button>
      }
      sx={[
        {
          alignItems: 'center',
          color: 'text.primary',
          backgroundColor: 'rgba(242, 165, 65, 0.16)',
          '& .MuiAlert-icon': { color: 'primary.main' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...alertProps}
    >
      {status === 'failed' ? "We couldn't reach Spotify. Please try again." : message}
    </Alert>
  );
}
