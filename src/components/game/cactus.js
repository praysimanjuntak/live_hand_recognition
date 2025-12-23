import {
  setCustomProperty,
  incrementCustomProperty,
  getCustomProperty,
} from "./updateCustomProperty.js";
import cactusImg from './imgs/cactus.png';

// Cactus movement speed
const CACTUS_SPEED = 0.05;

// Spawn interval range (ms)
const CACTUS_INTERVAL_MIN = 500;
const CACTUS_INTERVAL_MAX = 2000;

// Position where cactus is removed (off-screen left)
const CACTUS_REMOVE_THRESHOLD = -100;

// Starting position (off-screen right)
const CACTUS_START_POSITION = 100;

// State
let nextCactusTime = CACTUS_INTERVAL_MIN;

export function setupCactus() {
  nextCactusTime = CACTUS_INTERVAL_MIN;

  // Remove all existing cacti
  const cacti = document.querySelectorAll("[data-cactus]");
  for (const cactus of cacti) {
    cactus.remove();
  }
}

export function updateCactus(delta, speedScale, worldRef) {
  // Move existing cacti
  const cacti = document.querySelectorAll("[data-cactus]");
  for (const cactus of cacti) {
    incrementCustomProperty(cactus, "--left", delta * speedScale * CACTUS_SPEED * -1);

    if (getCustomProperty(cactus, "--left") <= CACTUS_REMOVE_THRESHOLD) {
      cactus.remove();
    }
  }

  // Spawn new cactus
  if (nextCactusTime <= 0) {
    createCactus(worldRef);
    nextCactusTime = randomNumberBetween(CACTUS_INTERVAL_MIN, CACTUS_INTERVAL_MAX) / speedScale;
  }
  nextCactusTime -= delta;
}

export function getCactusRects() {
  const cacti = document.querySelectorAll("[data-cactus]");
  return Array.from(cacti).map(cactus => cactus.getBoundingClientRect());
}

function createCactus(worldRef) {
  const cactus = document.createElement("img");
  cactus.dataset.cactus = "true";
  cactus.src = cactusImg;
  cactus.alt = "Cactus obstacle";
  cactus.classList.add("cactus");
  setCustomProperty(cactus, "--left", CACTUS_START_POSITION);
  worldRef.current.append(cactus);
}

function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
