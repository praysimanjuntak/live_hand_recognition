/**
 * Hand landmark connections for drawing skeleton
 * Based on MediaPipe Hands keypoint indices:
 * 0: wrist, 1-4: thumb, 5-8: index, 9-12: middle, 13-16: ring, 17-20: pinky
 */
const fingerConnections = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20],
};

// Fingertip indices for special highlighting
const FINGERTIP_INDICES = new Set([4, 8, 12, 16, 20]);
const KNUCKLE_INDICES = new Set([1, 5, 9, 13, 17]);

// Joint styling
const JOINT_STYLES = {
  base: { color: '#1a1a2e', size: 12 },     // wrist
  knuckle: { color: '#16213e', size: 8 },   // base of fingers
  joint: { color: '#0f3460', size: 6 },     // middle joints
  tip: { color: '#e94560', size: 8 },       // fingertips (highlighted)
};

const LINE_COLOR = 'rgba(233, 69, 96, 0.8)';
const LINE_WIDTH = 3;

/**
 * Get the appropriate style for a keypoint based on its index
 */
const getJointStyle = (index) => {
  if (index === 0) return JOINT_STYLES.base;
  if (FINGERTIP_INDICES.has(index)) return JOINT_STYLES.tip;
  if (KNUCKLE_INDICES.has(index)) return JOINT_STYLES.knuckle;
  return JOINT_STYLES.joint;
};

/**
 * Draw detected hands on canvas
 * @param {Array} hands - Array of detected hands from hand-pose-detection
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {boolean} mirrored - Whether to mirror the drawing (for mirrored webcam)
 */
export const drawHand = (hands, ctx, mirrored = true) => {
  const canvasWidth = ctx.canvas.width;

  // Clear previous frame
  ctx.clearRect(0, 0, canvasWidth, ctx.canvas.height);

  if (hands.length === 0) return;

  // Helper to mirror x coordinate if needed
  const mirrorX = (x) => mirrored ? canvasWidth - x : x;

  for (const hand of hands) {
    const keypoints = hand.keypoints;

    // Draw finger connections
    for (const finger of Object.keys(fingerConnections)) {
      const indices = fingerConnections[finger];

      for (let k = 0; k < indices.length - 1; k++) {
        const firstPoint = keypoints[indices[k]];
        const secondPoint = keypoints[indices[k + 1]];

        ctx.beginPath();
        ctx.moveTo(mirrorX(firstPoint.x), firstPoint.y);
        ctx.lineTo(mirrorX(secondPoint.x), secondPoint.y);
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    // Draw keypoint dots
    for (let i = 0; i < keypoints.length; i++) {
      const { x, y } = keypoints[i];
      const style = getJointStyle(i);

      ctx.beginPath();
      ctx.arc(mirrorX(x), y, style.size, 0, 2 * Math.PI);
      ctx.fillStyle = style.color;
      ctx.fill();

      // Add subtle border for visibility
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Optionally show handedness label
    if (hand.handedness) {
      const wrist = keypoints[0];
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(hand.handedness, mirrorX(wrist.x) - 20, wrist.y + 30);
    }
  }
};