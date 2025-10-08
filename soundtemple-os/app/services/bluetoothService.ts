export interface SoundBedDevice {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'connecting';
  device?: BluetoothDevice;
}

export class BluetoothService {
  private devices: Map<string, SoundBedDevice> = new Map();

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async requestDevice(): Promise<SoundBedDevice | null> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser');
    }

    try {
      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'SoundBed' },
          { namePrefix: 'OPUS' },
        ],
        optionalServices: ['battery_service', 'device_information'],
      });

      const soundBed: SoundBedDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        status: 'connecting',
        device,
      };

      // Listen for disconnection
      device.addEventListener('gattserverdisconnected', () => {
        this.onDeviceDisconnected(device.id);
      });

      // Connect to GATT server
      await device.gatt?.connect();

      soundBed.status = 'online';
      this.devices.set(device.id, soundBed);

      return soundBed;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      return null;
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    const soundBed = this.devices.get(deviceId);
    if (!soundBed || !soundBed.device) return false;

    try {
      soundBed.status = 'connecting';
      await soundBed.device.gatt?.connect();
      soundBed.status = 'online';
      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      soundBed.status = 'offline';
      return false;
    }
  }

  async disconnectDevice(deviceId: string): Promise<void> {
    const soundBed = this.devices.get(deviceId);
    if (!soundBed || !soundBed.device) return;

    if (soundBed.device.gatt?.connected) {
      soundBed.device.gatt.disconnect();
    }
    soundBed.status = 'offline';
  }

  private onDeviceDisconnected(deviceId: string) {
    const soundBed = this.devices.get(deviceId);
    if (soundBed) {
      soundBed.status = 'offline';
    }
  }

  getDevices(): SoundBedDevice[] {
    return Array.from(this.devices.values());
  }

  async sendVibrationPattern(deviceId: string, pattern: number[]): Promise<boolean> {
    const soundBed = this.devices.get(deviceId);
    if (!soundBed || !soundBed.device?.gatt?.connected) return false;

    try {
      // This would send the vibration pattern to the device
      // Actual implementation depends on the device's GATT services
      console.log(`Sending vibration pattern to ${soundBed.name}:`, pattern);
      return true;
    } catch (error) {
      console.error('Failed to send vibration pattern:', error);
      return false;
    }
  }

  async setVibrationZone(deviceId: string, zone: string, intensity: number): Promise<boolean> {
    const soundBed = this.devices.get(deviceId);
    if (!soundBed || !soundBed.device?.gatt?.connected) return false;

    try {
      console.log(`Setting ${zone} to ${intensity}% on ${soundBed.name}`);
      // Actual implementation would write to specific GATT characteristic
      return true;
    } catch (error) {
      console.error('Failed to set vibration zone:', error);
      return false;
    }
  }
}

export const bluetoothService = new BluetoothService();
