/**
 * AudioPlayer - Player de áudio com waveform
 *
 * Features:
 * - Reprodução de arquivos de áudio (mp3, wav, ogg)
 * - Waveform visual interativo
 * - Controles de play/pause, seek, volume
 * - Integração com tema
 */

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  url: string;
  className?: string;
  waveColor?: string;
  progressColor?: string;
  height?: number;
}

export function AudioPlayer({
  url,
  className,
  waveColor = 'hsl(var(--muted-foreground))',
  progressColor = 'hsl(var(--primary))',
  height = 80,
}: AudioPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    // Criar instância do WaveSurfer
    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor,
      progressColor,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      cursorWidth: 1,
      cursorColor: progressColor,
      normalize: true,
    });

    // Carregar áudio
    wavesurfer.current.load(url);

    // Event listeners
    wavesurfer.current.on('ready', () => {
      setIsLoading(false);
      setDuration(wavesurfer.current?.getDuration() || 0);
    });

    wavesurfer.current.on('play', () => setIsPlaying(true));
    wavesurfer.current.on('pause', () => setIsPlaying(false));

    wavesurfer.current.on('audioprocess', () => {
      setCurrentTime(wavesurfer.current?.getCurrentTime() || 0);
    });

    return () => {
      wavesurfer.current?.destroy();
    };
  }, [url, waveColor, progressColor, height]);

  const togglePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    wavesurfer.current?.setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      wavesurfer.current?.setVolume(volume);
    } else {
      setIsMuted(true);
      wavesurfer.current?.setVolume(0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4 p-4 border rounded-lg bg-card', className)}>
      {/* Waveform */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <div ref={waveformRef} className="rounded" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Time */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-[80px]">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
