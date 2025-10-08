'use client';

import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(86); // 1:46
  const [duration] = useState(220); // 3:40
  const [outputsOpen, setOutputsOpen] = useState(false);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>(['beds', 'speakers']);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleOutput = (output: string) => {
    setSelectedOutputs(prev =>
      prev.includes(output)
        ? prev.filter(o => o !== output)
        : [...prev, output]
    );
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="bg-black rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-6">Audio Player</h2>

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
                      const scale = isPlaying ? 0.8 + Math.random() * 0.4 : 1;
                      return (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full transition-transform"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: `translate(-50%, -50%) scale(${scale})`,
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
        <h3 className="text-lg font-semibold mb-1">Remedy</h3>
        <p className="text-sm text-gray-400">Annie Schindel</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-400">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-4 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
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

        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 18h2V6h-2v12zm-4-6l-8.5 6V6L12 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
