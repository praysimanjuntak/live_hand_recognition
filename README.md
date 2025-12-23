# DinoPinch

A web-based recreation of the classic Chrome dinosaur game controlled by hand gestures. Instead of pressing keys, make a pinch gesture (touch thumb and index finger together) to make the dinosaur jump over obstacles.

**[Play Now](https://praysimanjuntak.github.io/dino-pinch)**

## How to Play

1. Allow camera access when prompted
2. Wait for the hand detection model to load (~15 seconds)
3. Click anywhere or pinch to start
4. Pinch your thumb and index finger together to jump
5. Avoid the cacti and try to get the highest score!

## Features

- Real-time hand tracking using TensorFlow.js and MediaPipe Hands
- Pinch gesture detection for jump control
- Full-screen gameplay with floating camera panel
- Visual hand skeleton overlay
- Responsive design for desktop and mobile
- Crisp pixel art rendering

## Tech Stack

- React 17
- TensorFlow.js 4.22
- MediaPipe Hands (via @tensorflow-models/hand-pose-detection)
- react-webcam

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm build

# Deploy to GitHub Pages
pnpm deploy
```

## License

MIT
