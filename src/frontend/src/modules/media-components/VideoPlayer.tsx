/**
 * VideoPlayer - Player de vídeo universal
 *
 * Features:
 * - Vídeos locais (mp4, webm, ogg)
 * - YouTube, Vimeo
 * - Streaming (HLS, DASH)
 * - Controles padrão
 * - Fullscreen
 * - Velocidade de reprodução
 */

import ReactPlayer from 'react-player';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  url: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
}

export function VideoPlayer({ className, ...playerProps }: VideoPlayerProps) {
  return (
    <div className={cn('relative rounded-lg overflow-hidden bg-black', className)}>
      <ReactPlayer
        width="100%"
        height="auto"
        controls={true}
        {...playerProps}
      />
    </div>
  );
}
