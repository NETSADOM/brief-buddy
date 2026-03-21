import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import Waveform from "./Waveform";

interface AudioPlayerProps {
  duration?: string;
  className?: string;
  compact?: boolean;
  src?: string | null;
}

const AudioPlayer = ({ duration = "1:32", className = "", compact = false, src }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (src) {
      const el = audioRef.current;
      if (el) {
        if (playing) el.pause();
        else el.play();
        setPlaying(!playing);
      }
      return;
    }
    setPlaying(!playing);
    if (!playing) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setPlaying(false);
            return 0;
          }
          return p + 1;
        });
      }, 100);
    }
  };

  return (
    <div className={`card-surface p-4 flex items-center gap-4 ${className}`}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
      <button
        onClick={togglePlay}
        className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-primary flex items-center justify-center flex-shrink-0 transition-all hover:brightness-110`}
      >
        {playing ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <Waveform bars={compact ? 24 : 40} playing={playing} height={compact ? 32 : 40} />
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-foreground/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
