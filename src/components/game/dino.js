import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js";
import dinoLose from './imgs/dino-lose.png';
import dinoRun0 from './imgs/dino-run-0.png';
import dinoRun1 from './imgs/dino-run-1.png';
import dinoStationary from './imgs/dino-stationary.png';

// Physics constants (tuned to match Chrome dino game feel)
const JUMP_SPEED = 0.22;
const GRAVITY = 0.0007;

// Animation constants
const DINO_FRAME_COUNT = 2;
const FRAME_TIME = 100;

// Jump trigger key (dispatched from hand gesture detection)
const JUMP_KEY = 'p';

// State
let isJumping = false;
let dinoFrame = 0;
let currentFrameTime = 0;
let yVelocity = 0;

// Keep reference to bound handler for cleanup
let boundJumpHandler = null;

export function setupDino(dinoRef) {
  isJumping = false;
  dinoFrame = 0;
  currentFrameTime = 0;
  yVelocity = 0;
  setCustomProperty(dinoRef, "--bottom", 0);

  // Remove previous listener if exists
  if (boundJumpHandler) {
    document.removeEventListener("keydown", boundJumpHandler);
  }

  // Create and store bound handler
  boundJumpHandler = onJump;
  document.addEventListener("keydown", boundJumpHandler);
}

export function cleanupDino() {
  if (boundJumpHandler) {
    document.removeEventListener("keydown", boundJumpHandler);
    boundJumpHandler = null;
  }
}

export function updateDino(delta, speedScale, dinoRef) {
  handleRun(delta, speedScale, dinoRef);
  handleJump(delta, dinoRef);
}

export function getDinoRect(dinoRef) {
  return dinoRef.current.getBoundingClientRect();
}

export function setDinoLose(dinoRef) {
  dinoRef.current.src = dinoLose;
}

function handleRun(delta, speedScale, dinoRef) {
  if (isJumping) {
    dinoRef.current.src = dinoStationary;
    return;
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT;
    dinoRef.current.src = (dinoFrame === 0) ? dinoRun0 : dinoRun1;
    currentFrameTime -= FRAME_TIME;
  }
  currentFrameTime += delta * speedScale;
}

function handleJump(delta, dinoRef) {
  if (!isJumping) return;

  incrementCustomProperty(dinoRef, "--bottom", yVelocity * delta);

  if (getCustomProperty(dinoRef, "--bottom") <= 0) {
    setCustomProperty(dinoRef, "--bottom", 0);
    isJumping = false;
  }

  yVelocity -= GRAVITY * delta;
}

function onJump(e) {
  if (e.key !== JUMP_KEY || isJumping) return;

  yVelocity = JUMP_SPEED;
  isJumping = true;
}