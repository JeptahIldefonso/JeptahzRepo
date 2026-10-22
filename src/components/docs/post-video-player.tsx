"use client";

import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Video, Film, Download } from "lucide-react";

interface PostVideoPlayerProps {
  videoUrl: string;
  caption?: string;
  fileSizeMb?: number;
}

export function PostVideoPlayer({ videoUrl, caption, fileSizeMb }: PostVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Check if it's a YouTube link
  const youtubeMatch = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return (
      <div className="w-full space-y-1.5 select-none">
        <div className="relative w-full aspect-video rounded-[3px] overflow-hidden border border-black/10 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Video Player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <div className="flex items-center justify-between font-mono text-[10px] text-black/50 px-0.5">
          <span>{caption || "Embedded Video"}</span>
          <span className="flex items-center space-x-1">
            <Film className="w-3 h-3" />
            <span>YouTube Stream</span>
          </span>
        </div>
      </div>
    );
  }

  function togglePlay() {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function toggleFullscreen() {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }

  return (
    <div className="w-full space-y-1.5 select-none">
      <div className="group relative w-full aspect-video rounded-[3px] overflow-hidden border border-black/10 bg-black/95">
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-contain"
        />

        {/* Top-Right Max 25MB Limit Indicator Pill */}
        <div className="absolute top-2.5 right-2.5 pointer-events-none z-10 flex items-center space-x-1 font-mono text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-[2px] bg-black/75 backdrop-blur-xs text-white/90 border border-white/10">
          <Video className="w-3 h-3 text-emerald-400" />
          <span>{fileSizeMb ? `${fileSizeMb}MB` : "≤ 25MB Limit"}</span>
        </div>
      </div>

      {/* Caption & Info */}
      <div className="flex items-center justify-between font-mono text-[10px] text-black/50 px-0.5">
        <span className="truncate max-w-sm">{caption || "Screen Recording / Video Walkthrough"}</span>
        <a
          href={videoUrl}
          download
          className="hover:text-black flex items-center space-x-1 transition-colors"
        >
          <Download className="w-3 h-3" />
          <span>Save Video</span>
        </a>
      </div>
    </div>
  );
}
