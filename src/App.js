import React, { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import Webcam from 'react-webcam';
import { drawHand } from './utilities';
import Game from './components/game/Game';

// Constants
const DETECTION_INTERVAL_MS = 100;
const PINCH_DISTANCE_THRESHOLD = 30;

// Keypoint indices for the new hand-pose-detection API
const THUMB_TIP_INDEX = 4;       // thumb_tip
const INDEX_FINGER_TIP_INDEX = 8; // index_finger_tip

// Estimated model load time in ms (for progress simulation)
const ESTIMATED_LOAD_TIME_MS = 15000;
const PROGRESS_UPDATE_INTERVAL_MS = 100;

function App() {
  const [isTouching, setIsTouching] = useState(false);
  const [showLandscapeHint, setShowLandscapeHint] = useState(true);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const detectorRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const handleDistance = useCallback((hands) => {
    if (hands.length === 0) return;

    // Process first detected hand
    const hand = hands[0];
    const keypoints = hand.keypoints;
    const thumbTip = keypoints[THUMB_TIP_INDEX];
    const indexFingerTip = keypoints[INDEX_FINGER_TIP_INDEX];

    // New API uses {x, y} objects instead of [x, y, z] arrays
    const xDiff = thumbTip.x - indexFingerTip.x;
    const yDiff = thumbTip.y - indexFingerTip.y;
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

    setIsTouching(dist < PINCH_DISTANCE_THRESHOLD);
  }, []);

  const detect = useCallback(async () => {
    if (
      !webcamRef.current ||
      !canvasRef.current ||
      webcamRef.current.video.readyState !== 4 ||
      !detectorRef.current
    ) {
      return;
    }

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const hands = await detectorRef.current.estimateHands(video);
    const ctx = canvasRef.current.getContext('2d');

    drawHand(hands, ctx);
    handleDistance(hands);
  }, [handleDistance]);

  // Dispatch jump event when pinch state changes to true
  useEffect(() => {
    if (isTouching) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    }
  }, [isTouching]);

  // Initialize hand detector and detection loop
  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();

    // Simulate progress bar (model doesn't provide real progress)
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Use easing function to slow down as it approaches 90%
      const rawProgress = Math.min(elapsed / ESTIMATED_LOAD_TIME_MS, 0.9);
      const easedProgress = rawProgress * (2 - rawProgress); // Ease out
      setLoadingProgress(Math.round(easedProgress * 100));
    }, PROGRESS_UPDATE_INTERVAL_MS);

    const initDetector = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'full',
        maxHands: 1,
      };

      const detector = await handPoseDetection.createDetector(model, detectorConfig);

      if (!mounted) return;

      // Stop progress simulation and animate to 100%
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setLoadingProgress(100);

      detectorRef.current = detector;
      console.log('Hand pose detection model loaded.');

      // Small delay to show 100% before hiding loader
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!mounted) return;
      setIsModelLoading(false);

      // Start detection loop
      intervalRef.current = setInterval(() => {
        detect();
      }, DETECTION_INTERVAL_MS);
    };

    initDetector();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, [detect]);

  return (
    <div className="App">
      {/* Full screen game */}
      <Game isModelLoading={isModelLoading} loadingProgress={loadingProgress} />

      {/* Floating camera panel */}
      <div className={`camera-panel ${isModelLoading ? 'loading' : ''}`}>
        {isModelLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <span className="loading-text">Loading hand detection...</span>
            <div className="loading-progress-bar">
              <div
                className="loading-progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <span className="loading-percent">{loadingProgress}%</span>
          </div>
        )}
        <Webcam
          ref={webcamRef}
          className="webcam-video"
          mirrored={true}
        />
        <canvas
          ref={canvasRef}
          className="hand-canvas"
        />
        {!isModelLoading && (
          <div className={`pinch-indicator ${isTouching ? 'active' : ''}`}>
            {isTouching ? '✊ Pinching!' : '👌 Pinch to jump'}
          </div>
        )}
      </div>

      {/* Landscape hint */}
      {showLandscapeHint && (
        <div className="landscape-hint">
          <span>For best experience, use landscape mode</span>
          <button
            className="landscape-hint-close"
            onClick={() => setShowLandscapeHint(false)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
