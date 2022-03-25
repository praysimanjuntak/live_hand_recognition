import {
  incrementCustomProperty,
  setCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js"
import dinoLose from './imgs/dino-lose.png';
import dinoRun0 from './imgs/dino-run-0.png';
import dinoRun1 from './imgs/dino-run-1.png';
import dinoStationary from './imgs/dino-stationary.png';

const JUMP_SPEED = 0.45
const GRAVITY = 0.0015
const DINO_FRAME_COUNT = 2
const FRAME_TIME = 100

let isJumping
let dinoFrame
let currentFrameTime
let yVelocity

export function setupDino(dinoRef) {
  isJumping = false
  dinoFrame = 0
  currentFrameTime = 0
  yVelocity = 0
  setCustomProperty(dinoRef, "--bottom", 0)
  document.removeEventListener("keydown", onJump)
  document.addEventListener("keydown", onJump)
}

export function updateDino(delta, speedScale, dinoRef) {
  handleRun(delta, speedScale, dinoRef)
  handleJump(delta, dinoRef)
}

export function getDinoRect(dinoRef) {
  return dinoRef.current.getBoundingClientRect()
}

export function setDinoLose(dinoRef) {
  dinoRef.current.src = dinoLose;
}

function handleRun(delta, speedScale, dinoRef) {
  if (isJumping) {
    dinoRef.current.src = dinoStationary;
    return
  }

  if (currentFrameTime >= FRAME_TIME) {
    dinoFrame = (dinoFrame + 1) % DINO_FRAME_COUNT
    dinoRef.current.src = (dinoFrame === 0) ? dinoRun0 : dinoRun1;
    currentFrameTime -= FRAME_TIME
  }
  currentFrameTime += delta * speedScale
}

function handleJump(delta, dinoRef) {
  if (!isJumping) return

  incrementCustomProperty(dinoRef, "--bottom", yVelocity * delta)

  if (getCustomProperty(dinoRef, "--bottom") <= 0) {
    setCustomProperty(dinoRef, "--bottom", 0)
    isJumping = false
  }

  yVelocity -= GRAVITY * delta
}

function onJump(e) {
  if (e.key !== "p" || isJumping) return

  yVelocity = JUMP_SPEED
  isJumping = true
}