import { useCallback, useEffect, useRef, useState } from 'react';

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface CameraActualSettings {
  width: number;
  height: number;
  frameRate: number;
  facingMode?: string;
  deviceId?: string;
}

export interface UseCameraOptions {
  preferredDeviceId?: string;
  resolution?: '720p' | '1080p';
  targetFps?: 30 | 60 | 120;
  autoStart?: boolean;
}

export function useCamera(options: UseCameraOptions = {}) {
  const {
    preferredDeviceId,
    resolution = '720p',
    targetFps = 60,
    autoStart = true,
  } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(preferredDeviceId);
  const [actualSettings, setActualSettings] = useState<CameraActualSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Enumerate camera devices
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1} (${d.deviceId.slice(0, 5)})`,
        }));
      setDevices(videoInputs);
    } catch {
      // Ignore enumeration failure
    }
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setActualSettings(null);
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser environment.');
      setHasPermission(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    stopStream();

    const idealWidth = resolution === '1080p' ? 1920 : 1280;
    const idealHeight = resolution === '1080p' ? 1080 : 720;

    const videoConstraints: MediaTrackConstraints = {
      width: { ideal: idealWidth },
      height: { ideal: idealHeight },
      frameRate: { ideal: targetFps, min: 30 },
    };

    if (selectedDeviceId) {
      videoConstraints.deviceId = { exact: selectedDeviceId };
    } else {
      videoConstraints.facingMode = { ideal: 'environment' };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        setActualSettings({
          width: settings.width || idealWidth,
          height: settings.height || idealHeight,
          frameRate: settings.frameRate || targetFps,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId,
        });
      }

      await refreshDevices();
      setIsLoading(false);
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setHasPermission(false);
          setError('Camera permission denied. Please allow camera access in your browser site settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera device found on this system.');
        } else if (err.name === 'OverconstrainedError') {
          // Retry with loose fallback constraints
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
            streamRef.current = fallbackStream;
            setHasPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              await videoRef.current.play().catch(() => {});
            }
            const track = fallbackStream.getVideoTracks()[0];
            if (track) {
              const settings = track.getSettings();
              setActualSettings({
                width: settings.width || 640,
                height: settings.height || 480,
                frameRate: settings.frameRate || 30,
              });
            }
            await refreshDevices();
            return;
          } catch {
            setError('Requested camera resolution or frame rate is not supported by your hardware.');
          }
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Failed to acquire camera stream.');
      }
    }
  }, [resolution, targetFps, selectedDeviceId, stopStream, refreshDevices]);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    return () => {
      stopStream();
    };
  }, [autoStart, startCamera, stopStream]);

  return {
    videoRef,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    actualSettings,
    isLoading,
    error,
    hasPermission,
    startCamera,
    stopCamera: stopStream,
    refreshDevices,
  };
}
