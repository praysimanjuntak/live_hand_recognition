import { render, screen } from '@testing-library/react';
import App from './App';

// Mock TensorFlow backends
jest.mock('@tensorflow/tfjs-core', () => ({}));
jest.mock('@tensorflow/tfjs-backend-webgl', () => ({}));

// Mock hand-pose-detection
jest.mock('@tensorflow-models/hand-pose-detection', () => ({
  SupportedModels: {
    MediaPipeHands: 'MediaPipeHands',
  },
  createDetector: jest.fn().mockResolvedValue({
    estimateHands: jest.fn().mockResolvedValue([]),
    dispose: jest.fn(),
  }),
}));

// Mock react-webcam
jest.mock('react-webcam', () => {
  return function MockWebcam() {
    return <video data-testid="webcam" />;
  };
});

describe('App', () => {
  test('renders landscape hint on load', () => {
    render(<App />);
    const hintElement = screen.getByText(/landscape mode/i);
    expect(hintElement).toBeInTheDocument();
  });

  test('renders webcam component', () => {
    render(<App />);
    const webcam = screen.getByTestId('webcam');
    expect(webcam).toBeInTheDocument();
  });
});
