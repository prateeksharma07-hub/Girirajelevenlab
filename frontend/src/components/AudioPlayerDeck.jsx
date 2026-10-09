import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Rewind, 
  Sparkles, 
  Share2, 
  Check 
} from 'lucide-react';

export default function AudioPlayerDeck({ audioUrl, voiceName, textSnippet, onNotify }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize and handle audio URL change
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      audioRef.current.load();
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Playback error:", err);
          if (onNotify) onNotify("Playback failed: " + err.message, "error");
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (e) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const skipSeconds = (sec) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + sec, 0), duration || 100);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    const cleanVoice = (voiceName || 'voice').toLowerCase().replace(/\s+/g, '-');
    link.download = `beta-ai-${cleanVoice}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onNotify) onNotify("Audio file downloaded successfully!", "success");
  };

  const handleCopyLink = async () => {
    if (!audioUrl) return;
    try {
      await navigator.clipboard.writeText(audioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onNotify) onNotify("Audio URL copied to clipboard!", "success");
    } catch (err) {
      if (onNotify) onNotify("Could not copy link", "error");
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="audio-player-deck">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="deck-header">
        <div className="deck-title">
          <Sparkles size={18} className="text-indigo-400" />
          <span>Active Narration Master</span>
          <span className="card-badge">{voiceName || 'ElevenLabs Voice'}</span>
        </div>
        <div className="text-xs text-muted">
          {textSnippet ? `"${textSnippet.slice(0, 38)}..."` : 'Generated audio'}
        </div>
      </div>

      {/* Dynamic Soundwave Visualizer Bars */}
      <div className="visualizer-container">
        {Array.from({ length: 32 }).map((_, idx) => {
          const progress = duration > 0 ? currentTime / duration : 0;
          const barProgress = idx / 32;
          const isPassed = barProgress <= progress;
          // Calculate animated or deterministic height
          const baseHeight = 12 + Math.sin(idx * 0.8) * 10 + ((idx * 7) % 24);
          const activeHeight = isPlaying ? Math.min(52, baseHeight + Math.random() * 26) : baseHeight;

          return (
            <div
              key={idx}
              className={`vis-bar ${isPassed ? 'active' : ''}`}
              style={{
                height: `${Math.max(6, activeHeight)}px`,
                opacity: isPassed ? 1 : 0.4
              }}
            />
          );
        })}
      </div>

      {/* Scrubber Progress Bar */}
      <div className="scrubber-container">
        <span className="time-stamp">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.05"
          value={currentTime}
          onChange={handleSeek}
          className="custom-slider scrubber-slider"
          aria-label="Seek audio"
          id="audio-scrubber"
        />
        <span className="time-stamp">{formatTime(duration)}</span>
      </div>

      {/* Main Controls Row */}
      <div className="player-controls-row">
        <div className="playback-buttons">
          <button
            className="secondary-control-btn"
            onClick={() => skipSeconds(-5)}
            title="Rewind 5 seconds"
          >
            <Rewind size={16} />
          </button>

          <button
            className="main-play-btn"
            onClick={togglePlay}
            id="audio-deck-play-btn"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="secondary-control-btn"
            onClick={() => skipSeconds(5)}
            title="Forward 5 seconds"
          >
            <FastForward size={16} />
          </button>

          <button
            className="secondary-control-btn"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            title="Replay from start"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* Speed & Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={playbackRate}
            onChange={handleSpeedChange}
            className="speed-select"
            title="Playback Speed"
          >
            <option value="0.75">0.75x</option>
            <option value="1">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              className="secondary-control-btn"
              onClick={toggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ width: 32, height: 32 }}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="custom-slider"
              style={{ width: 70, height: 4 }}
              title="Volume"
            />
          </div>
        </div>

        {/* Download & Share Actions */}
        <div className="deck-action-buttons">
          <button
            className="action-pill-btn"
            onClick={handleCopyLink}
            title="Copy Audio Link"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            className="action-pill-btn primary"
            onClick={handleDownload}
            id="audio-deck-download-btn"
            title="Download MP3 file"
          >
            <Download size={15} />
            <span>Download MP3</span>
          </button>
        </div>
      </div>
    </div>
  );
}
