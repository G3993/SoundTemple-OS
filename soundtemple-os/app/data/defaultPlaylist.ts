export interface DefaultTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: number; // in seconds
}

export const defaultPlaylist: DefaultTrack[] = [
  {
    id: 'deep-rest',
    name: 'Deep Rest · Delta Waves',
    artist: 'OPUS SESSIONS',
    url: '/audio/Deep_Rest_Delta_Waves.mp3',
    duration: 1800, // 30 minutes (approximate)
  },
  {
    id: 'ease-174',
    name: 'Ease · 174 Hz',
    artist: 'OPUS SESSIONS',
    url: '/audio/Ease_174_Hz.mp3',
    duration: 1440, // 24 minutes (approximate)
  },
  {
    id: 'mystic-rising',
    name: 'Mystic Rising',
    artist: 'OPUS SESSIONS',
    url: '/audio/Mystic_Rising.mp3',
    duration: 720, // 12 minutes (approximate)
  },
];

export const playlistName = 'Feel Connected';

export const getTotalDuration = (): number => {
  return defaultPlaylist.reduce((total, track) => total + track.duration, 0);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
