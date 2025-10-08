'use client';

import { useState, useEffect } from 'react';
import { bluetoothService, SoundBedDevice } from '../services/bluetoothService';
import Link from 'next/link';

interface VibrationZone {
  name: string;
  value: number;
}

interface BedSettings {
  [bedId: string]: {
    enabled: boolean;
    zones: VibrationZone[];
  };
}

export default function DevicesPage() {
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
  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  const [bedSettings, setBedSettings] = useState<BedSettings>({});

  useEffect(() => {
    setBluetoothSupported(bluetoothService.isSupported());

    // Initialize bed settings
    const initialSettings: BedSettings = {};
    devices.forEach(device => {
      initialSettings[device.id] = {
        enabled: device.status === 'online',
        zones: [
          { name: 'HEAD', value: 50 },
          { name: 'SHOULDERS', value: 50 },
          { name: 'HEART', value: 50 },
          { name: 'BELLY', value: 50 },
          { name: 'LOWER BACK', value: 50 },
        ],
      };
    });
    setBedSettings(initialSettings);
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
        setBedSettings(prev => ({
          ...prev,
          [device.id]: {
            enabled: true,
            zones: [
              { name: 'HEAD', value: 50 },
              { name: 'SHOULDERS', value: 50 },
              { name: 'HEART', value: 50 },
              { name: 'BELLY', value: 50 },
              { name: 'LOWER BACK', value: 50 },
            ],
          },
        }));
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
    setBedSettings(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], enabled: false },
    }));
  };

  const handleReconnect = async (deviceId: string) => {
    const success = await bluetoothService.connectToDevice(deviceId);
    if (success) {
      setDevices(prev =>
        prev.map(d => d.id === deviceId ? { ...d, status: 'online' as const } : d)
      );
      setBedSettings(prev => ({
        ...prev,
        [deviceId]: { ...prev[deviceId], enabled: true },
      }));
    }
  };

  const toggleBed = (bedId: string) => {
    setBedSettings(prev => ({
      ...prev,
      [bedId]: {
        ...prev[bedId],
        enabled: !prev[bedId]?.enabled,
      },
    }));
  };

  const handleZoneChange = (bedId: string, zoneIndex: number, value: number) => {
    setBedSettings(prev => {
      const newZones = [...prev[bedId].zones];
      newZones[zoneIndex].value = value;
      return {
        ...prev,
        [bedId]: {
          ...prev[bedId],
          zones: newZones,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-12 h-12 bg-white rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
            <div className="grid grid-cols-5 gap-0.5">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-black" />
              ))}
            </div>
          </Link>
          <h1 className="text-2xl font-semibold">Connected Devices</h1>
        </div>
        <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Device List */}
        <div className="xl:col-span-1">
          <div className="bg-black rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-6">Devices</h2>

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
              {devices.map((device) => {
                const settings = bedSettings[device.id];
                const isEnabled = settings?.enabled ?? false;

                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedBed(device.id)}
                    className={`bg-[#2a2a2a] rounded-2xl p-4 hover:bg-[#333] transition-colors cursor-pointer ${
                      selectedBed === device.id ? 'ring-2 ring-white/40' : ''
                    }`}
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBed(device.id);
                          }}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            isEnabled ? 'bg-white' : 'bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-black transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isEnabled ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bed Settings */}
        <div className="xl:col-span-2">
          {selectedBed ? (
            <div className="bg-black rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-6">
                {devices.find(d => d.id === selectedBed)?.name} Settings
              </h2>

              {/* Vibration Zone Sliders */}
              <div className="space-y-8">
                {bedSettings[selectedBed]?.zones.map((zone, index) => (
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
                        onChange={(e) => handleZoneChange(selectedBed, index, parseInt(e.target.value))}
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
                <div className="text-xs text-gray-400 mb-2">DEVICE SPECIFIC SETTINGS</div>
                <div className="text-sm">
                  Adjust vibration levels independently for this bed
                </div>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-3 py-1 bg-white/10 rounded-full">
                    {bedSettings[selectedBed]?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="px-3 py-1 bg-white/10 rounded-full">
                    Custom Zones
                  </span>
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
          ) : (
            <div className="bg-black rounded-3xl p-6 flex items-center justify-center min-h-[500px]">
              <div className="text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <p className="text-lg">Select a device to configure settings</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
