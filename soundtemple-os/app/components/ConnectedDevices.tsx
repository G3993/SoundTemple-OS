'use client';

import { useState } from 'react';

interface SoundBed {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

export default function ConnectedDevices() {
  const [devices, setDevices] = useState<SoundBed[]>([
    { id: '1', name: 'SoundBed 1', status: 'online' },
    { id: '2', name: 'SoundBed 2', status: 'online' },
    { id: '3', name: 'SoundBed 3', status: 'online' },
    { id: '4', name: 'SoundBed 4', status: 'online' },
    { id: '5', name: 'SoundBed 5', status: 'online' },
    { id: '6', name: 'SoundBed 6', status: 'online' },
    { id: '8', name: 'SoundBed 8', status: 'offline' },
  ]);

  const handleAddDevice = () => {
    // Bluetooth connection logic would go here
    console.log('Adding new SoundBed...');
  };

  return (
    <div className="bg-black rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-6">Connected Devices</h2>

      <button
        onClick={handleAddDevice}
        className="w-full mb-6 py-4 px-6 rounded-full border-2 border-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        ADD NEW SOUNDBED
      </button>

      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-[#2a2a2a] rounded-2xl p-4 flex items-center justify-between hover:bg-[#333] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3a3a3a] rounded-lg flex items-center justify-center">
                <div className="grid grid-cols-5 gap-0.5">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-white" />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-medium">{device.name}</div>
                <div className="text-sm text-gray-400 uppercase">
                  {device.status}
                </div>
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                device.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
