import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert, Vibration, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { temporalVoter, formatPlate, isPlateOnHotlist, HotlistEntry } from '../utils/plateUtils';
import { sightingBuffer, fetchHotlist, getLocation, registerDevice } from '../services/sighting';
import { clearAuth, loadAuth } from '../services/auth';

export default function ScanScreen() {
  const { theme } = useTheme();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hotlist, setHotlist] = useState<HotlistEntry[]>([]);
  const [lastPlate, setLastPlate] = useState<string | null>(null);
  const [hitCount, setHitCount] = useState(0);
  const [status, setStatus] = useState<'initializing' | 'scanning' | 'hit'>('initializing');
  const [fps, setFps] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [lastFrameTime, setLastFrameTime] = useState(Date.now());
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'disconnected' | 'syncing'>('connected');

  useEffect(() => {
    checkPermissions();
    loadInitialData();
  }, []);

  const checkPermissions = async () => {
    if (!permission) return;

    if (permission.granted) {
      setHasPermission(true);
    } else {
      const result = await requestPermission();
      setHasPermission(result.granted);
    }
  };

  const loadInitialData = async () => {
    setStatus('initializing');
    try {
      // Try to register device
      await registerDevice();

      // Load hotlist
      const hotlistData = await fetchHotlist();
      setHotlist(hotlistData);
      setNetworkStatus(hotlistData.length > 0 ? 'connected' : 'syncing');

      setIsScanning(true);
      setStatus('scanning');
    } catch (error) {
      console.error('Failed to initialize:', error);
      setNetworkStatus('disconnected');
      setIsScanning(true);
      setStatus('scanning');
    }
  };

  const logHit = useCallback(async (plate: string, confidence: number, photoBase64?: string) => {
    setStatus('hit');
    setLastPlate(plate);

    Vibration.vibrate(500);

    const location = await getLocation();

    if (location) {
      sightingBuffer.add({
        plateNumber: plate,
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now(),
        confidence,
        photoBase64,
      });

      if (sightingBuffer.shouldFlush()) {
        setNetworkStatus('syncing');
        sightingBuffer.flush().then(() => {
          setNetworkStatus('connected');
        }).catch(() => {
          setNetworkStatus('disconnected');
        });
      }
    }

    setHitCount(prev => prev + 1);

    // Reset after 2 seconds
    setTimeout(() => {
      setStatus('scanning');
      setLastPlate(null);
    }, 2000);
  }, []);

  const processFrame = useCallback(async (photo: string) => {
    // In production, this would call the ONNX/TFLite model
    // For demo, we'll simulate plate detection
    // Real implementation would:
    // 1. Run YOLO model to detect plate region
    // 2. Crop and preprocess the plate image
    // 3. Run OCR on the plate
    // 4. Apply temporal voting
    // 5. Check against hotlist

    setFrameCount(prev => {
      const newCount = prev + 1;
      const now = Date.now();
      if (now - lastFrameTime < 1000) {
        setFps(fps); // Keep current FPS
      } else {
        setFps(Math.round(newCount / ((now - lastFrameTime) / 1000)));
        setLastFrameTime(now);
      }
      return newCount;
    });
  }, [fps, lastFrameTime]);

  const handleCameraReady = useCallback(async () => {
    if (!cameraRef.current || !isScanning) return;

    // In production, capture frames every second for processing
    // const subscriber = cameraRef.current?.frameProcessor((frame) => {
    //   'worklet';
    //   // Process frame with AI model
    // });
  }, [isScanning]);

  const takeSnapshot = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });

      // In production, process the photo with OCR
      // For now, simulate a plate being read
      processFrame(photo.base64 || '');

      // Simulate detection (in real app, this would be AI output)
      const simulatedPlate = 'MH12AB1234';
      const votedPlate = temporalVoter.record(simulatedPlate);

      if (votedPlate && isPlateOnHotlist(votedPlate, hotlist)) {
        await logHit(votedPlate, 0.95, photo.base64);
      }
    } catch (error) {
      console.error('Failed to take snapshot:', error);
    }
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text, fontSize: 18 }}>
          Camera permission is required to scan plates
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={checkPermissions}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar hidden />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode={isScanning ? 'video' : 'photo'}
        mute={true}
        onCameraReady={handleCameraReady}
      >
        {/* HUD Overlay */}
        <View style={[styles.hud, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, status === 'hit' ? styles.hitBadge : styles.scanBadge]}>
              <Text style={[styles.statusText, { color: '#fff' }]}>
                {status === 'hit' ? 'HIT!' : status === 'scanning' ? 'SCANNING' : 'INITIALIZING'}
              </Text>
            </View>
            <View style={styles.telemetry}>
              <Text style={[styles.telemetryText, { color: '#fff' }]}>
                FPS: {fps}
              </Text>
              <Text style={[styles.telemetryText, { color: networkStatus === 'connected' ? '#10b981' : '#f59e0b' }]}>
                {networkStatus === 'connected' ? 'NET: OK' : networkStatus === 'syncing' ? 'SYNCING...' : 'OFFLINE'}
              </Text>
              <Text style={[styles.telemetryText, { color: hitCount > 0 ? '#10b981' : '#fff' }]}>
                HITS: {hitCount}
              </Text>
            </View>
          </View>

          {/* Scanning guide */}
          <View style={styles.guideContainer}>
            <View style={styles.guideBox} />
            {lastPlate && (
              <View style={styles.hitBanner}>
                <Text style={styles.hitText}>PLATE: {lastPlate}</Text>
              </View>
            )}
          </View>

          {/* Smart button row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[styles.smartButton, { backgroundColor: '#222' }]}
              onPress={takeSnapshot}
              disabled={!isScanning}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>CAPTURE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smartButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                temporalVoter.reset();
                setLastPlate(null);
                setStatus('scanning');
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>RESET</Text>
            </TouchableOpacity>
          </View>

          {/* Logout button */}
          <TouchableOpacity
            style={[styles.logoutButton, { marginLeft: 'auto', marginRight: 16 }]}
            onPress={async () => {
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAuth();
                    setHotlist([]);
                  },
                },
              ]);
            }}
          >
            <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: 'bold' }}>LOGOUT</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  hud: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  scanBadge: {
    backgroundColor: '#3b82f6',
  },
  hitBadge: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  telemetry: {
    flexDirection: 'row',
    gap: 16,
  },
  telemetryText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  guideContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  guideBox: {
    width: 250,
    height: 80,
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 8,
    position: 'relative',
  },
  hitBanner: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#fff',
  },
  hitText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
  },
  smartButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
});
