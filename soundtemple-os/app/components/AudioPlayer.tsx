'use client';

import { useState, useRef, useEffect } from 'react';
import { audioService, AudioAnalysisData } from '../services/audioService';

interface Track {
  id: string;
  name: string;
  artist: string;
  file: File | null;
  url: string | null;
}

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [outputsOpen, setOutputsOpen] = useState(false);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(['beds', 'speakers']);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [audioData, setAudioData] = useState<AudioAnalysisData | null>(null);
  const [vibroacousticEnabled, setVibroacousticEnabled] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      playNext();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    if (isPlaying) {
      updateVisualization();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isPlaying]);

  const updateVisualization = () => {
    const data = audioService.getAnalysisData();
    if (data) {
      setAudioData(data);
    }
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newTracks: Track[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      const track: Track = {
        id: Date.now() + i + '',
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        file,
        url,
      };

      newTracks.push(track);
    }

    setPlaylist(prev => [...prev, ...newTracks]);

    // Auto-play first track if nothing is playing
    if (!currentTrack && newTracks.length > 0) {
      loadTrack(newTracks[0]);
    }
  };

  const loadTrack = async (track: Track) => {
    if (!audioRef.current || !track.url) return;

    setCurrentTrack(track);
    audioRef.current.src = track.url;

    // Initialize audio service
    if (!audioService) return;
    await audioService.initialize(audioRef.current);
    audioService.setVibroacousticBoost(vibroacousticEnabled, 12);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    await audioService.resume();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    loadTrack(playlist[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    loadTrack(playlist[prevIndex]);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleOutput = (output: string) => {
    setSelectedOutputs(prev =>
      prev.includes(output)
        ? prev.filter(o => o !== output)
        : [...prev, output]
    );
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-black rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-6">Audio Player</h2>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* File Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full mb-4 py-3 px-6 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        UPLOAD AUDIO FILES
      </button>

      {/* Vibroacoustic Toggle */}
      <div className="mb-4 flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-sm">Vibroacoustic Boost (20-27Hz)</span>
        </div>
        <button
          onClick={() => {
            const newState = !vibroacousticEnabled;
            setVibroacousticEnabled(newState);
            audioService.setVibroacousticBoost(newState, 12);
          }}
          className={`w-12 h-6 rounded-full transition-colors ${
            vibroacousticEnabled ? 'bg-white' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-black transition-transform ${
              vibroacousticEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Output Selection Dropdown */}
      <div className="relative mb-8">
        <button
          onClick={() => setOutputsOpen(!outputsOpen)}
          className="w-full py-4 px-6 rounded-full bg-[#1a1a1a] hover:bg-[#252525] transition-all flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <span>OUTPUTS ( x{selectedOutputs.length} )</span>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${outputsOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {outputsOpen && (
          <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] rounded-2xl p-4 z-10 border border-white/10">
            {['beds', 'speakers', 'headphones'].map((output) => (
              <label
                key={output}
                className="flex items-center gap-3 py-3 cursor-pointer hover:bg-white/5 rounded-lg px-2"
              >
                <input
                  type="checkbox"
                  checked={selectedOutputs.includes(output)}
                  onChange={() => toggleOutput(output)}
                  className="w-5 h-5 rounded border-2 border-white/30"
                />
                <span className="capitalize">{output}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Visualizer */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center h-64">
          <div className="relative w-48 h-48">
            {/* Circular dots visualization */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, ring) => {
                const radius = 20 + ring * 10;
                const dotsInRing = 8 + ring * 4;
                return (
                  <div key={ring}>
                    {[...Array(dotsInRing)].map((_, i) => {
                      const angle = (i / dotsInRing) * 2 * Math.PI;
                      const x = 96 + radius * Math.cos(angle);
                      const y = 96 + radius * Math.sin(angle);

                      // Use audio data if available
                      let scale = 1;
                      if (isPlaying && audioData) {
                        const frequencyIndex = Math.floor((i / dotsInRing) * audioData.frequencyData.length);
                        const intensity = audioData.frequencyData[frequencyIndex] / 255;
                        scale = 0.5 + intensity * 1.5;
                      }

                      return (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full transition-transform duration-75"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: `translate(-50%, -50%) scale(${scale})`,
                            opacity: isPlaying ? 0.8 + (scale - 0.5) * 0.4 : 0.6,
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-1">
          {currentTrack?.name || 'No Track Selected'}
        </h3>
        <p className="text-sm text-gray-400">{currentTrack?.artist || 'Upload audio to begin'}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-gray-400 w-12">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-400 w-12">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        <button
          onClick={playPrevious}
          disabled={!currentTrack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={togglePlay}
          disabled={!currentTrack}
          className="p-4 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={playNext}
          disabled={!currentTrack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-30"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 18h2V6h-2v12zm-4-6l-8.5 6V6L12 12z" />
          </svg>
        </button>
      </div>

      {/* Playlist */}
      {playlist.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h3 className="text-sm font-medium mb-3 text-gray-400">PLAYLIST ({playlist.length})</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {playlist.map((track) => (
              <button
                key={track.id}
                onClick={() => loadTrack(track)}
                className={`w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors ${
                  currentTrack?.id === track.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="text-sm font-medium truncate">{track.name}</div>
                <div className="text-xs text-gray-500 truncate">{track.artist}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
