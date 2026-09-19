import { hotlistApi, sightingApi, getDeviceId } from './api';
import * as Location from 'expo-location';

interface SightingEntry {
  plateNumber: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  confidence: number;
  photoBase64?: string;
}

interface HotlistEntry {
  id: string;
  plateNumber: string;
  encryptedData: string;
}

class SightingBuffer {
  private buffer: SightingEntry[] = [];
  private lastFlush = Date.now();
  private readonly flushInterval = 5000; // 5 seconds
  private readonly maxBufferSize = 100;

  add(entry: SightingEntry) {
    this.buffer.push(entry);
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  getBuffer(): SightingEntry[] {
    return [...this.buffer];
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];
    this.lastFlush = Date.now();

    try {
      await sightingApi.ingest({ sightings: batch });
    } catch (error) {
      console.error('Failed to flush sightings:', error);
      // Re-add to buffer for retry
      this.buffer = [...batch];
    }
  }

  getTimeSinceLastFlush(): number {
    return Date.now() - this.lastFlush;
  }

  shouldFlush(): boolean {
    return this.getTimeSinceLastFlush() >= this.flushInterval && this.buffer.length > 0;
  }
}

export const sightingBuffer = new SightingBuffer();

export const fetchHotlist = async (): Promise<HotlistEntry[]> => {
  try {
    const response = await hotlistApi.sync();
    return response.entries;
  } catch (error) {
    console.error('Failed to fetch hotlist:', error);
    return [];
  }
};

export const getLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
};

export const registerDevice = async (type: 'FLEET' | 'VOLUNTEER' = 'VOLUNTEER'): Promise<boolean> => {
  try {
    const deviceId = await getDeviceId();
    await deviceApi.register({
      deviceId,
      type,
      token: deviceId,
    });
    return true;
  } catch (error) {
    console.error('Failed to register device:', error);
    return false;
  }
};
