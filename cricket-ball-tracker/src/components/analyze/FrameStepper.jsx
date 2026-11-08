import React from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { formatTime } from '../../utils/time.js';

export default function FrameStepper({ videoRef }) {
  const isPlaying = useAnalysisStore((s) => s.isPlaying);
  const currentTime = useAnalysisStore((s) => s.currentTime);
  const duration = useAnalysisStore((s) => s.duration);
  const fps = useAnalysisStore((s) => s.fps);
  const playbackRate = useAnalysisStore((s) => s.playbackRate);

  const setIsPlaying = useAnalysisStore((s) => s.setIsPlaying);
  const setCurrentTime = useAnalysisStore((s) => s.setCurrentTime);
  const setPlaybackRate = useAnalysisStore((s) => s.setPlaybackRate);

  const dt = 1 / (fps || 60);

  const togglePlay = () => {
    if (!videoRef?.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stepFrames = (frameCount) => {
    if (!videoRef?.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + frameCount * dt));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRateChange = (rate) => {
    if (videoRef?.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const currentFrame = Math.round(currentTime * fps);
  const totalFrames = Math.round(duration * fps);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#121923] border border-[#243146] rounded-xl text-xs select-none">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => stepFrames(-10)}
          className="p-1.5 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5]"
          title="Step -10 frames (Shift+Left)"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => stepFrames(-1)}
          className="px-2 py-1.5 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] font-mono"
          title="Step -1 frame (Left)"
        >
          -1
        </button>

        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-lg bg-[#c6ff3d] hover:brightness-110 text-[#0b0f14] flex items-center justify-center font-bold"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => stepFrames(1)}
          className="px-2 py-1.5 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5] font-mono"
          title="Step +1 frame (Right)"
        >
          +1
        </button>
        <button
          onClick={() => stepFrames(10)}
          className="p-1.5 rounded-lg bg-[#182231] hover:bg-[#243146] text-[#8a9ab0] hover:text-[#e8eef5]"
          title="Step +10 frames (Shift+Right)"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Frame Counter */}
      <div className="font-mono text-xs text-[#8a9ab0]">
        <span className="text-[#e8eef5] font-bold">F: {currentFrame}</span> / {totalFrames} (
        {formatTime(currentTime)})
      </div>

      {/* Playback speed selector */}
      <div className="flex items-center gap-1 bg-[#182231] p-0.5 rounded-lg border border-[#243146]">
        {[0.1, 0.25, 0.5, 1.0].map((rate) => (
          <button
            key={rate}
            onClick={() => handleRateChange(rate)}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
              playbackRate === rate
                ? 'bg-[#c6ff3d] text-[#0b0f14]'
                : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            {rate}x
          </button>
        ))}
      </div>
    </div>
  );
}
