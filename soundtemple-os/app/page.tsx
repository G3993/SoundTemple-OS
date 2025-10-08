'use client';

import { useState } from 'react';
import AudioPlayer from './components/AudioPlayer';
import VibrationControls from './components/VibrationControls';
import AudioVisualizer from './components/AudioVisualizer';
import Link from 'next/link';

export default function Home() {
  const [vibroacousticEnabled, setVibroacousticEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-5 gap-0.5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-black" />
              ))}
            </div>
          </div>
          <h1 className="text-2xl font-semibold">SoundTemple OS</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/devices"
            className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium">Connected Devices</span>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </Link>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <AudioVisualizer />
        <AudioPlayer
          vibroacousticEnabled={vibroacousticEnabled}
          setVibroacousticEnabled={setVibroacousticEnabled}
        />
        <VibrationControls
          vibroacousticEnabled={vibroacousticEnabled}
          setVibroacousticEnabled={setVibroacousticEnabled}
        />
      </div>
    </div>
  );
}
