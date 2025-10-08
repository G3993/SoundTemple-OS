'use client';

import { useState, useEffect } from 'react';
import { bluetoothService, SoundBedDevice } from '../services/bluetoothService';

export default function ConnectedDevices() {
  const [devices, setDevices] = useState<SoundBedDevice[]>([
    { id: '1', name: 'SoundBed 1', status: 'online' },
    { id: '2', name: 'SoundBed 2', status: 'online' },
    { id: '3', name: 'SoundBed 3', status: 'online' },
    { id: '4', name: 'SoundBed 4', status: 'online' },
    { id: '5', name: 'SoundBed 5', status: 'online' },
    { id: '6', name: 'SoundBed 6', status: 'online' },
    { id: '8', name: 'SoundBed 8', status: 'offline' },
  ]);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBluetoothSupported(bluetoothService.isSupported());
  }, []);

  const handleAddDevice = async () => {
    if (!bluetoothSupported) {
      setError('Web Bluetooth is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    try {
      setError(null);
      const device = await bluetoothService.requestDevice();

      if (device) {
        setDevices(prev => [...prev, device]);
      }
    } catch (error: any) {
      console.error('Bluetooth connection error:', error);
      setError(error.message || 'Failed to connect to device');
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    await bluetoothService.disconnectDevice(deviceId);
    setDevices(prev =>
      prev.map(d => d.id === deviceId ? { ...d, status: 'offline' as const } : d)
    );
  };

  const handleReconnect = async (deviceId: string) => {
    const success = await bluetoothService.connectToDevice(deviceId);
    if (success) {
      setDevices(prev =>
        prev.map(d => d.id === deviceId ? { ...d, status: 'online' as const } : d)
      );
    }
  };

  return (
    <div className="bg-black rounded-3xl p-6">
      <h2 className="text-xl font-semibold mb-6">Connected Devices</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-sm text-red-200">
          {error}
        </div>
      )}

      {!bluetoothSupported && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-xl text-sm text-yellow-200">
          Web Bluetooth not supported. Use Chrome, Edge, or Opera browser.
        </div>
      )}

      <button
        onClick={handleAddDevice}
        disabled={!bluetoothSupported}
        className="w-full mb-6 py-4 px-6 rounded-full border-2 border-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="bg-[#2a2a2a] rounded-2xl p-4 hover:bg-[#333] transition-colors"
          >
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-3">
                {device.status === 'offline' && device.device && (
                  <button
                    onClick={() => handleReconnect(device.id)}
                    className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    Reconnect
                  </button>
                )}
                {device.status === 'online' && device.device && (
                  <button
                    onClick={() => handleDisconnect(device.id)}
                    className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  >
                    Disconnect
                  </button>
                )}
                <div
                  className={`w-3 h-3 rounded-full ${
                    device.status === 'online'
                      ? 'bg-green-500'
                      : device.status === 'connecting'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {bluetoothSupported && (
        <div className="mt-6 p-3 bg-white/5 rounded-xl text-xs text-gray-400">
          <div className="font-medium mb-1">💡 Bluetooth Tips:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Make sure your soundbed is powered on and in pairing mode</li>
            <li>Bluetooth must be enabled on your device</li>
            <li>You may need to grant Bluetooth permissions</li>
          </ul>
        </div>
      )}
    </div>
  );
}
