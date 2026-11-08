import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [actualFps, setActualFps] = useState(60);
  const [isLowFps, setIsLowFps] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startCamera = useCallback(async (minFps = 0) => {
    setError(null);
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: minFps > 0 ? { min: minFps, ideal: 120 } : { ideal: 120 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        const fps = settings.frameRate || 30;
        setActualFps(fps);
        setIsLowFps(fps < 55);
      }
      return mediaStream;
    } catch (err) {
      setError(err.message || 'Camera permission denied or camera not found');
      return null;
    }
  }, []);

  const tryHigherFps = useCallback(async () => {
    // Attempt {min: 60} then {min: 120}
    try {
      await startCamera(60);
    } catch {
      await startCamera(0);
    }
  }, [startCamera]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setError(`Recording failed: ${err.message}`);
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    stream,
    error,
    actualFps,
    isLowFps,
    isRecording,
    recordedBlob,
    startCamera,
    stopCamera,
    tryHigherFps,
    startRecording,
    stopRecording,
  };
}
