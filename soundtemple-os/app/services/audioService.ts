export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
}

export class AudioService {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private vibroacousticFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private systemAudioStream: MediaStream | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async initialize(audioElement: HTMLAudioElement) {
    if (!this.audioContext) return;

    this.audioElement = audioElement;

    // Create audio nodes
    this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    // Create gain node for volume control
    this.gainNode = this.audioContext.createGain();

    // Create filters for frequency bands
    this.bassFilter = this.audioContext.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    this.bassFilter.gain.value = 0;

    this.midFilter = this.audioContext.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;
    this.midFilter.gain.value = 0;

    this.trebleFilter = this.audioContext.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;
    this.trebleFilter.gain.value = 0;

    // Create vibroacoustic filter (20-27Hz emphasis)
    this.vibroacousticFilter = this.audioContext.createBiquadFilter();
    this.vibroacousticFilter.type = 'peaking';
    this.vibroacousticFilter.frequency.value = 23.5; // Center of 20-27Hz range
    this.vibroacousticFilter.Q.value = 2; // Narrow bandwidth
    this.vibroacousticFilter.gain.value = 12; // Boost by 12dB

    // Connect nodes
    this.sourceNode
      .connect(this.vibroacousticFilter)
      .connect(this.bassFilter)
      .connect(this.midFilter)
      .connect(this.trebleFilter)
      .connect(this.gainNode)
      .connect(this.analyser)
      .connect(this.audioContext.destination);
  }

  setVibroacousticBoost(enabled: boolean, intensity: number = 12) {
    if (this.vibroacousticFilter) {
      this.vibroacousticFilter.gain.value = enabled ? intensity : 0;
    }
  }

  setEQ(bass: number, mid: number, treble: number) {
    if (this.bassFilter) this.bassFilter.gain.value = bass;
    if (this.midFilter) this.midFilter.gain.value = mid;
    if (this.trebleFilter) this.trebleFilter.gain.value = treble;
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  getAnalysisData(): AudioAnalysisData | null {
    if (!this.analyser) return null;

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.getByteFrequencyData(frequencyData);
    this.analyser.getByteTimeDomainData(timeDomainData);

    // Calculate average levels for bass, mid, treble
    const bassEnd = Math.floor(frequencyData.length * 0.1);
    const midEnd = Math.floor(frequencyData.length * 0.5);

    const bass = this.getAverageLevel(frequencyData, 0, bassEnd);
    const mid = this.getAverageLevel(frequencyData, bassEnd, midEnd);
    const treble = this.getAverageLevel(frequencyData, midEnd, frequencyData.length);

    return {
      frequencyData,
      timeDomainData,
      bass,
      mid,
      treble,
    };
  }

  private getAverageLevel(data: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += data[i];
    }
    return sum / (end - start) / 255; // Normalize to 0-1
  }

  async resume() {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async initializeSystemAudio() {
    if (!this.audioContext) return;

    // Disconnect existing source if any
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }

    try {
      // Request system audio capture
      // Note: This captures the user's microphone by default
      // For true system audio, you'd need a virtual audio device or browser extension
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });

      this.systemAudioStream = stream;

      // Create source from stream
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);

      // Create analyzer and filters if they don't exist
      if (!this.analyser) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
      }

      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
      }

      if (!this.bassFilter) {
        this.bassFilter = this.audioContext.createBiquadFilter();
        this.bassFilter.type = 'lowshelf';
        this.bassFilter.frequency.value = 200;
        this.bassFilter.gain.value = 0;
      }

      if (!this.midFilter) {
        this.midFilter = this.audioContext.createBiquadFilter();
        this.midFilter.type = 'peaking';
        this.midFilter.frequency.value = 1000;
        this.midFilter.Q.value = 1;
        this.midFilter.gain.value = 0;
      }

      if (!this.trebleFilter) {
        this.trebleFilter = this.audioContext.createBiquadFilter();
        this.trebleFilter.type = 'highshelf';
        this.trebleFilter.frequency.value = 3000;
        this.trebleFilter.gain.value = 0;
      }

      if (!this.vibroacousticFilter) {
        this.vibroacousticFilter = this.audioContext.createBiquadFilter();
        this.vibroacousticFilter.type = 'peaking';
        this.vibroacousticFilter.frequency.value = 23.5;
        this.vibroacousticFilter.Q.value = 2;
        this.vibroacousticFilter.gain.value = 12;
      }

      // Connect nodes
      this.sourceNode
        .connect(this.vibroacousticFilter)
        .connect(this.bassFilter)
        .connect(this.midFilter)
        .connect(this.trebleFilter)
        .connect(this.gainNode)
        .connect(this.analyser)
        .connect(this.audioContext.destination);

      return true;
    } catch (error) {
      console.error('Failed to initialize system audio:', error);
      return false;
    }
  }

  stopSystemAudio() {
    if (this.systemAudioStream) {
      this.systemAudioStream.getTracks().forEach(track => track.stop());
      this.systemAudioStream = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
  }

  disconnect() {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
    this.stopSystemAudio();
  }
}

export const audioService = new AudioService();
