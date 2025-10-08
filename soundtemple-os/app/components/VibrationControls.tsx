'use client';

import { useState } from 'react';

type VibrationMode = 'balanced' | 'dynamic' | 'custom';

interface VibrationZone {
  name: string;
  value: number;
}

export default function VibrationControls() {
  const [mode, setMode] = useState<VibrationMode>('balanced');
  const [zones, setZones] = useState<VibrationZone[]>([
    { name: 'HEAD', value: 50 },
    { name: 'SHOULDERS', value: 50 },
    { name: 'HEART', value: 50 },
    { name: 'BELLY', value: 50 },
    { name: 'LOWER BACK', value: 50 },
  ]);

  const handleModeChange = (newMode: VibrationMode) => {
    setMode(newMode);

    // Preset values for different modes
    if (newMode === 'balanced') {
      setZones([
        { name: 'HEAD', value: 50 },
        { name: 'SHOULDERS', value: 50 },
        { name: 'HEART', value: 50 },
        { name: 'BELLY', value: 50 },
        { name: 'LOWER BACK', value: 50 },
      ]);
    } else if (newMode === 'dynamic') {
      setZones([
        { name: 'HEAD', value: 60 },
        { name: 'SHOULDERS', value: 75 },
        { name: 'HEART', value: 80 },
        { name: 'BELLY', value: 70 },
        { name: 'LOWER BACK', value: 85 },
      ]);
    }
  };

  const handleZoneChange = (index: number, value: number) => {
    const newZones = [...zones];
    newZones[index].value = value;
    setZones(newZones);
    if (mode !== 'custom') {
      setMode('custom');
    }
  };

  return (
    <div className="bg-black rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-6">Vibration Controls</h2>

      {/* Mode Selection */}
      <div className="mb-8">
        <div className="bg-[#1a1a1a] rounded-full p-1 flex gap-1">
          <button
            onClick={() => handleModeChange('balanced')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              mode === 'balanced'
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            BALANCED
          </button>
          <button
            onClick={() => handleModeChange('dynamic')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              mode === 'dynamic'
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            DYNAMIC
          </button>
          <button
            onClick={() => handleModeChange('custom')}
            className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all ${
              mode === 'custom'
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            CUSTOM
          </button>
        </div>
      </div>

      {/* Vibration Zone Sliders */}
      <div className="space-y-8">
        {zones.map((zone, index) => (
          <div key={zone.name}>
            <label className="block text-sm font-medium mb-3 text-center">
              {zone.name}
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={zone.value}
                onChange={(e) => handleZoneChange(index, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #fff ${zone.value}%, #374151 ${zone.value}%)`,
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full pointer-events-none shadow-lg"
                style={{
                  left: `calc(${zone.value}% - 12px)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Frequency Info */}
      <div className="mt-8 p-4 bg-[#1a1a1a] rounded-2xl">
        <div className="text-xs text-gray-400 mb-2">VIBROACOUSTIC FREQUENCY</div>
        <div className="text-sm">
          Optimized for 20-27Hz therapeutic range
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="px-3 py-1 bg-white/10 rounded-full">Bass Enhanced</span>
          <span className="px-3 py-1 bg-white/10 rounded-full">Low Freq Focus</span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 0;
          height: 0;
        }
        .slider::-moz-range-thumb {
          appearance: none;
          width: 0;
          height: 0;
          border: none;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
