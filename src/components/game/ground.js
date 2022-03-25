import {
  getCustomProperty,
  incrementCustomProperty,
  setCustomProperty,
} from "./updateCustomProperty.js"

const SPEED = 0.05

export function setupGround(groundRef1, groundRef2) {
  setCustomProperty(groundRef1, "--left", 0)
  setCustomProperty(groundRef2, "--left", 300)
}

export function updateGround(delta, speedScale, groundRef1, groundRef2) {
  const groundRefs = [groundRef1, groundRef2]
  groundRefs.forEach(ground => {
    incrementCustomProperty(ground, "--left", delta * speedScale * SPEED * -1)

    if (getCustomProperty(ground, "--left") <= -300) {
      incrementCustomProperty(ground, "--left", 600)
    }
  })
}
