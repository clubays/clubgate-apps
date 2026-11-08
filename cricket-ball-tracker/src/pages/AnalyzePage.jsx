import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  Camera,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Save,
  Download,
  AlertTriangle,
  HelpCircle,
  X,
  FileVideo,
} from 'lucide-react';
import PageShell from '../components/layout/PageShell.jsx';
import DeliveryList from '../components/analyze/DeliveryList.jsx';
import FrameStepper from '../components/analyze/FrameStepper.jsx';
import ManualFixBar from '../components/analyze/ManualFixBar.jsx';
import QualityBadge from '../components/analyze/QualityBadge.jsx';
import SpeedCard from '../components/analyze/SpeedCard.jsx';
import Timeline from '../components/analyze/Timeline.jsx';
import VideoStage from '../components/analyze/VideoStage.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { generateSyntheticTrajectory, getSynthCalibration } from '../functions/synth.js';
import { useAnalysisWorker } from '../hooks/useAnalysisWorker.js';
import { useCamera } from '../hooks/useCamera.js';
import { useHotkeys } from '../hooks/useHotkeys.js';
import { probeVideoFps, useVideoFrames } from '../hooks/useVideoFrames.js';
import { useAnalysisStore } from '../store/useAnalysisStore.js';
import { useSessionsStore } from '../store/useSessionsStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { exportSessionToCSV, exportSessionToJSON } from '../utils/exportData.js';
import { formatDistance, mpsToKmh, mpsToMph } from '../utils/units.js';

export default function AnalyzePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const step = useAnalysisStore((s) => s.step);
  const setStep = useAnalysisStore((s) => s.setStep);
  const videoFile = useAnalysisStore((s) => s.videoFile);
  const videoUrl = useAnalysisStore((s) => s.videoUrl);
  const videoWidth = useAnalysisStore((s) => s.videoWidth);
  const videoHeight = useAnalysisStore((s) => s.videoHeight);
  const fps = useAnalysisStore((s) => s.fps);
  const detectedFps = useAnalysisStore((s) => s.detectedFps);
  const isSlowMotion = useAnalysisStore((s) => s.isSlowMotion);
  const recordedAtFps = useAnalysisStore((s) => s.recordedAtFps);
  const duration = useAnalysisStore((s) => s.duration);
  const currentTime = useAnalysisStore((s) => s.currentTime);
  const calibration = useAnalysisStore((s) => s.calibration);
  const deliveries = useAnalysisStore((s) => s.deliveries);
  const selectedDeliveryIdx = useAnalysisStore((s) => s.selectedDeliveryIdx);
  const isAnalyzing = useAnalysisStore((s) => s.isAnalyzing);
  const analysisProgress = useAnalysisStore((s) => s.analysisProgress);
  const processingFps = useAnalysisStore((s) => s.processingFps);

  const setVideoSource = useAnalysisStore((s) => s.setVideoSource);
  const setFpsOverride = useAnalysisStore((s) => s.setFpsOverride);
  const setIsSlowMotion = useAnalysisStore((s) => s.setIsSlowMotion);
  const startAnalysis = useAnalysisStore((s) => s.startAnalysis);
  const updateAnalysisProgress = useAnalysisStore((s) => s.updateAnalysisProgress);
  const finishAnalysisStore = useAnalysisStore((s) => s.finishAnalysis);
  const cancelAnalysisStore = useAnalysisStore((s) => s.cancelAnalysis);
  const resetAll = useAnalysisStore((s) => s.resetAll);

  const ballPreset = useSettingsStore((s) => s.ballPreset);
  const workingSize = useSettingsStore((s) => s.workingSize);
  const units = useSettingsStore((s) => s.units);
  const saveCurrentSession = useSessionsStore((s) => s.saveCurrentSession);
  const loadSession = useSessionsStore((s) => s.loadSession);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const { initWorker, sendFrame, finishAnalysis, resetWorker, onFrameResultRef, onCompleteRef } =
    useAnalysisWorker();
  const { processVideo, cancel: cancelVideoLoop } = useVideoFrames();
  const {
    stream: recordStream,
    isRecording,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    recordedBlob,
  } = useCamera();

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [bowlerName, setBowlerName] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Hotkeys handling
  useHotkeys({
    onSpace: () => {
      if (videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
      }
    },
    onStepBack1: () => {
      if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 1 / fps);
    },
    onStepForward1: () => {
      if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 1 / fps);
    },
    onStepBack10: () => {
      if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10 / fps);
    },
    onStepForward10: () => {
      if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10 / fps);
    },
    onToggleManualFix: () => {
      useAnalysisStore.getState().toggleManualFixMode();
    },
    onDeleteDetection: () => {
      useAnalysisStore.getState().deleteDetectionAtTime(currentTime);
    },
    onStartAnalyse: () => {
      if (step === 2 && calibration) handleRunAnalysis();
    },
  });

  // Re-open saved session if URL has sessionId
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId).then((sess) => {
        if (sess) {
          finishAnalysisStore(sess.deliveries || []);
          setBowlerName(sess.bowler || '');
          setStep(4);
        }
      });
    }
  }, [sessionId, loadSession]);

  // Load video file or sample
  const handleFileUpload = async (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);

    // Create temporary video element to probe dimensions & duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = url;

    tempVideo.onloadedmetadata = async () => {
      const width = tempVideo.videoWidth || 1280;
      const height = tempVideo.videoHeight || 720;
      const dur = tempVideo.duration || 10;

      // Probe frame rate
      const probed = await probeVideoFps(tempVideo);
      setVideoSource({
        file,
        url,
        width,
        height,
        duration: dur,
        fps: probed,
      });
    };
  };

  // Load built-in synthetic bowling video
  const handleLoadSampleClip = async () => {
    // Generate synthetic delivery clip rendered into canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 1280;
    sampleCanvas.height = 720;
    const ctx = sampleCanvas.getContext('2d');

    const calib = getSynthCalibration();
    const { points } = generateSyntheticTrajectory({ v0: 38.89, fps: 120 }); // 140 km/h delivery

    const stream = sampleCanvas.captureStream(120);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.start();

    // Render 1.5 seconds of frames
    for (let i = 0; i < points.length; i++) {
      const pt = points[i];
      // Draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 720);

      // Pitch strip
      ctx.fillStyle = '#2a2216';
      ctx.fillRect(140, 520, 1000, 60);

      // Stumps
      ctx.fillStyle = '#ffb020';
      ctx.fillRect(140, 480, 8, 80); // Bowler
      ctx.fillRect(1140, 480, 8, 80); // Striker

      // Ball
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fillStyle = '#d62828';
      ctx.fill();

      await new Promise((r) => setTimeout(r, 8));
    }

    mediaRecorder.stop();
    await new Promise((r) => (mediaRecorder.onstop = r));

    const sampleBlob = new Blob(chunks, { type: 'video/webm' });
    const sampleUrl = URL.createObjectURL(sampleBlob);

    setVideoSource({
      file: null,
      url: sampleUrl,
      width: 1280,
      height: 720,
      duration: 1.5,
      fps: 120,
    });
    useAnalysisStore.getState().solveCurrentCalibration();
  };

  // Run full video analysis pass
  const handleRunAnalysis = async () => {
    if (!videoRef.current || !calibration) return;

    startAnalysis();
    setStep(3);

    initWorker({
      width: videoWidth,
      height: videoHeight,
      calibration,
      ballPreset,
      workingSize,
    });

    onFrameResultRef.current = (data) => {
      // Stream detection updates
    };

    onCompleteRef.current = (data) => {
      finishAnalysisStore(data.deliveries || []);
    };

    // Run frame capture loop
    await processVideo(
      videoRef.current,
      fps,
      async (bitmap, mediaTime, frameIdx) => {
        sendFrame(bitmap, mediaTime, frameIdx);
      },
      (progress, frameCount) => {
        updateAnalysisProgress(progress, 30, frameCount);
      }
    );

    finishAnalysis(fps);
  };

  const handleSaveSession = async () => {
    const sessionData = {
      id: sessionId || `session-${Date.now().toString(36)}`,
      name: bowlerName ? `${bowlerName} Session` : `Bowling Analysis ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      bowler: bowlerName || 'Practice',
      ballType: ballPreset,
      fps,
      calibrationId: 'calib-1',
      deliveries,
    };

    await saveCurrentSession(sessionData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const selectedDelivery = deliveries[selectedDeliveryIdx] || null;
  const toUnit = (mps) => (units === 'mph' ? mpsToMph(mps) : mpsToKmh(mps));
  const unitLabel = units === 'mph' ? 'mph' : 'km/h';

  return (
    <PageShell noFooter>
      <div className="analyze-container">
        {/* Step Navigation Strip */}
        <div className="h-12 bg-[#0b0f14] border-b border-[#243146] px-4 md:px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-1 md:gap-3 text-xs font-semibold">
            {[
              { num: 1, label: 'Video' },
              { num: 2, label: 'Calibrate' },
              { num: 3, label: 'Analyse' },
              { num: 4, label: 'Review' },
            ].map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <button
                  key={s.num}
                  disabled={!videoUrl && s.num > 1}
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#182231] text-[#c6ff3d] border border-[#c6ff3d]'
                      : isDone
                      ? 'text-[#2fd27e] hover:bg-[#182231]'
                      : 'text-[#8a9ab0] opacity-50'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#c6ff3d] text-[#0b0f14]'
                        : isDone
                        ? 'bg-[#2fd27e] text-[#0b0f14]'
                        : 'bg-[#243146] text-[#8a9ab0]'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                disabled={!calibration}
                onClick={handleRunAnalysis}
              >
                Start Analyse (A)
              </Button>
            )}

            {step === 4 && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={Save} onClick={handleSaveSession}>
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    resetAll();
                    setStep(1);
                  }}
                >
                  New Clip
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step 1: Upload or Record View if no video yet */}
        {!videoUrl && step === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#182231] border border-[#243146] flex items-center justify-center text-[#c6ff3d] mb-4 shadow-xl">
              <FileVideo className="w-8 h-8" />
            </div>
            <h2 className="font-condensed text-3xl md:text-4xl font-bold text-[#e8eef5] uppercase">
              Select or Record a Delivery
            </h2>
            <p className="text-sm text-[#8a9ab0] mt-1 mb-8">
              Upload a side-on cricket bowling video, capture with camera, or load a sample test clip.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
              <Button
                variant="primary"
                size="lg"
                icon={Upload}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                Upload Video Clip
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={Sparkles}
                onClick={handleLoadSampleClip}
                className="w-full"
              >
                Load Sample Test Clip
              </Button>
            </div>

            <div className="mt-8 p-4 bg-[#121923] border border-[#243146] rounded-xl text-xs text-[#8a9ab0] text-left w-full space-y-1">
              <span className="font-bold text-[#e8eef5] block">Slow-Motion Recommendation</span>
              <p>For Grade A precision, record at 120 or 240 fps on your phone and upload the file directly.</p>
            </div>
          </div>
        )}

        {/* Video Stage & Analysis Workspace */}
        {videoUrl && (
          <div className="analyze-main">
            {/* Left: Video Stage */}
            <div className="flex-1 flex flex-col min-w-0 bg-black relative">
              <VideoStage videoRef={videoRef} />

              {/* Step 3: Analysis Progress Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#0b0f14]/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 text-center">
                  <Spinner size="lg" className="mb-4" />
                  <h3 className="font-condensed text-3xl font-bold text-[#e8eef5] uppercase">
                    Analyzing Trajectory & Speed
                  </h3>
                  <p className="text-xs text-[#8a9ab0] mt-1 mb-6">
                    Running motion segmentation, blob scoring, and Kalman gating...
                  </p>

                  <div className="w-full max-w-md bg-[#182231] h-3 rounded-full overflow-hidden border border-[#243146]">
                    <div
                      className="bg-[#c6ff3d] h-full transition-all duration-150"
                      style={{ width: `${Math.round(analysisProgress * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between w-full max-w-md mt-2 text-xs font-mono text-[#8a9ab0]">
                    <span>{Math.round(analysisProgress * 100)}%</span>
                    <span>{processingFps} working fps</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-6 text-[#e5473f]"
                    onClick={() => {
                      cancelVideoLoop();
                      cancelAnalysisStore();
                    }}
                  >
                    Cancel Analysis
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Sidebar Metrics & Delivery Inspector */}
            <div className="analyze-sidebar p-4 space-y-4">
              {/* Frame rate / slow motion config pill */}
              <div className="p-3 bg-[#0b0f14] border border-[#243146] rounded-xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#8a9ab0]">Capture Frame Rate:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-[#c6ff3d]">
                    <input
                      type="number"
                      value={fps}
                      onChange={(e) => setFpsOverride(parseInt(e.target.value) || 60)}
                      className="w-14 bg-[#182231] border border-[#243146] rounded px-1.5 py-0.5 text-right text-xs"
                    />
                    <span>fps</span>
                  </div>
                </div>

                <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-[#243146]/50">
                  <span className="text-[11px] text-[#8a9ab0]">Slow-motion clip (recorded at 120/240)?</span>
                  <input
                    type="checkbox"
                    checked={isSlowMotion}
                    onChange={(e) => setIsSlowMotion(e.target.checked, 240)}
                    className="w-3.5 h-3.5 accent-[#c6ff3d]"
                  />
                </label>
              </div>

              {/* Speed Card */}
              <SpeedCard delivery={selectedDelivery} />

              {/* Manual Fix Bar */}
              {step === 4 && <ManualFixBar />}

              {/* Metrics Grid */}
              {selectedDelivery && (
                <div className="card-panel p-3 text-xs space-y-2">
                  <span className="font-bold text-[#8a9ab0] uppercase block">Delivery Physics</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-[#0b0f14]">
                      <span className="text-[#8a9ab0] block">Length Zone</span>
                      <strong className="text-sm" style={{ color: selectedDelivery.metrics?.lengthZone?.color || '#c6ff3d' }}>
                        {selectedDelivery.metrics?.lengthZone?.name || '—'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-[#0b0f14]">
                      <span className="text-[#8a9ab0] block">Bounce Distance</span>
                      <strong className="text-sm text-[#e8eef5]">
                        {selectedDelivery.metrics?.lengthDist != null
                          ? `${selectedDelivery.metrics.lengthDist.toFixed(2)} m`
                          : 'Full toss'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-[#0b0f14]">
                      <span className="text-[#8a9ab0] block">Bounce Height</span>
                      <strong className="text-sm text-[#38bdf8]">
                        {selectedDelivery.metrics?.bounceHeight != null
                          ? `${selectedDelivery.metrics.bounceHeight.toFixed(2)} m`
                          : '—'}
                      </strong>
                    </div>
                    <div className="p-2 rounded bg-[#0b0f14]">
                      <span className="text-[#8a9ab0] block">Speed Loss</span>
                      <strong className="text-sm text-[#ffb020]">
                        {selectedDelivery.metrics?.lossPct != null
                          ? `${selectedDelivery.metrics.lossPct.toFixed(1)}%`
                          : '—'}
                      </strong>
                    </div>
                  </div>

                  {calibration?.mode === 'behindArm' && (
                    <div className="p-2 rounded bg-[#0b0f14] flex justify-between">
                      <span className="text-[#8a9ab0]">Swing Deviation:</span>
                      <strong className="text-[#c6ff3d]">
                        {selectedDelivery.metrics?.swing != null
                          ? `${(selectedDelivery.metrics.swing * 100).toFixed(1)} cm`
                          : '—'}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Selector List */}
              <DeliveryList
                onSeekToTime={(t) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = t;
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Bottom Timeline & FrameStepper */}
        {videoUrl && (
          <div className="bg-[#0b0f14] border-t border-[#243146] p-2 flex flex-col gap-2 shrink-0">
            <Timeline videoRef={videoRef} />
            <FrameStepper videoRef={videoRef} />
          </div>
        )}

        {/* Saved confirmation toast */}
        {isSavedToast && (
          <div className="fixed bottom-16 right-6 z-50 bg-[#2fd27e] text-[#0b0f14] px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Session saved to local device!</span>
          </div>
        )}
      </div>
    </PageShell>
  );
}
