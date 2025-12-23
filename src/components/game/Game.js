import React, { useEffect, useRef, useCallback } from "react";
import './styles.css';
import { updateGround, setupGround } from "./ground.js";
import { updateDino, setupDino, getDinoRect, setDinoLose, cleanupDino } from "./dino.js";
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js";

// Import images
import groundImg from './imgs/ground.png';
import dinoStationary from './imgs/dino-stationary.png';

// Game difficulty scaling
const SPEED_SCALE_INCREASE = 0.00001;
const SCORE_MULTIPLIER = 0.01;

// Delay before allowing restart after losing
const RESTART_DELAY_MS = 100;

export default function Game({ isModelLoading = true, loadingProgress = 0 }) {
  const worldRef = useRef();
  const screenRef = useRef();
  const groundRef1 = useRef();
  const groundRef2 = useRef();
  const dinoRef = useRef();
  const scoreRef = useRef();

  // Use refs for game state to avoid re-renders
  const gameStateRef = useRef({
    lastTime: null,
    speedScale: 1,
    score: 0,
    isRunning: false,
  });

  const isCollision = useCallback((rect1, rect2) => {
    return (
      rect1.left < rect2.right &&
      rect1.top < rect2.bottom &&
      rect1.right > rect2.left &&
      rect1.bottom > rect2.top
    );
  }, []);

  const checkLose = useCallback(() => {
    const dinoRect = getDinoRect(dinoRef);
    return getCactusRects().some(rect => isCollision(rect, dinoRect));
  }, [isCollision]);

  const updateSpeedScale = useCallback((delta) => {
    gameStateRef.current.speedScale += delta * SPEED_SCALE_INCREASE;
  }, []);

  const updateScore = useCallback((delta) => {
    gameStateRef.current.score += delta * SCORE_MULTIPLIER;
    if (scoreRef.current) {
      scoreRef.current.textContent = Math.floor(gameStateRef.current.score);
    }
  }, []);

  const handleLose = useCallback(() => {
    gameStateRef.current.isRunning = false;
    setDinoLose(dinoRef);

    setTimeout(() => {
      if (screenRef.current) {
        screenRef.current.classList.remove("hide");
      }
    }, RESTART_DELAY_MS);
  }, []);

  const update = useCallback((time) => {
    if (!gameStateRef.current.isRunning) return;

    if (gameStateRef.current.lastTime === null) {
      gameStateRef.current.lastTime = time;
      window.requestAnimationFrame(update);
      return;
    }

    const delta = time - gameStateRef.current.lastTime;
    const { speedScale } = gameStateRef.current;

    updateGround(delta, speedScale, groundRef1, groundRef2);
    updateDino(delta, speedScale, dinoRef);
    updateCactus(delta, speedScale, worldRef);
    updateSpeedScale(delta);
    updateScore(delta);

    if (checkLose()) {
      handleLose();
      return;
    }

    gameStateRef.current.lastTime = time;
    window.requestAnimationFrame(update);
  }, [checkLose, handleLose, updateScore, updateSpeedScale]);

  const handleStart = useCallback(() => {
    gameStateRef.current = {
      lastTime: null,
      speedScale: 1,
      score: 0,
      isRunning: true,
    };

    setupGround(groundRef1, groundRef2);
    setupDino(dinoRef);
    setupCactus();

    if (screenRef.current) {
      screenRef.current.classList.add("hide");
    }

    window.requestAnimationFrame(update);
  }, [update]);

  useEffect(() => {
    const startGame = () => {
      // Don't allow starting if model is still loading
      if (isModelLoading) return;

      if (!gameStateRef.current.isRunning) {
        handleStart();
      }
    };

    const handleClick = () => startGame();

    const handleKeyDown = (e) => {
      // Start game with 'p' key (pinch gesture) or spacebar
      if (e.key === 'p' || e.key === ' ') {
        startGame();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      cleanupDino();
    };
  }, [handleStart, isModelLoading]);

  return (
    <div className="world" ref={worldRef}>
      <div className="score" ref={scoreRef}>0</div>
      <div className={`start-screen ${isModelLoading ? 'disabled' : ''}`} ref={screenRef}>
        <div className="start-title">Dino Run</div>
        <div className="start-subtitle">
          {isModelLoading
            ? 'Loading hand detection model...'
            : 'Click anywhere or pinch to start'}
        </div>
        {isModelLoading && (
          <>
            <div className="start-progress-bar">
              <div
                className="start-progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="start-progress-text">{loadingProgress}%</div>
          </>
        )}
      </div>
      <img
        alt="Ground"
        src={groundImg}
        className="ground"
        ref={groundRef1}
      />
      <img
        alt="Ground"
        src={groundImg}
        className="ground"
        ref={groundRef2}
      />
      <img
        alt="Dinosaur"
        src={dinoStationary}
        className="dino"
        ref={dinoRef}
      />
    </div>
  );
}