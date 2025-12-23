import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty,
} from "./updateCustomProperty.js";

// Ground scroll speed
const GROUND_SPEED = 0.05;

// Ground wrapping thresholds (percentage based)
const GROUND_WRAP_THRESHOLD = -300;
const GROUND_WRAP_OFFSET = 600;

export function setupGround(groundRef1, groundRef2) {
  setCustomProperty(groundRef1, "--left", 0);
  setCustomProperty(groundRef2, "--left", 300);
}

export function updateGround(delta, speedScale, groundRef1, groundRef2) {
  const groundRefs = [groundRef1, groundRef2];

  for (const ground of groundRefs) {
    incrementCustomProperty(ground, "--left", delta * speedScale * GROUND_SPEED * -1);

    if (getCustomProperty(ground, "--left") <= GROUND_WRAP_THRESHOLD) {
      incrementCustomProperty(ground, "--left", GROUND_WRAP_OFFSET);
    }
  }
}
