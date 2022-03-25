import React, { useEffect, useRef, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
// eslint-disable-next-line no-unused-vars
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import { drawHand } from './utilities';
import Game from './components/game/Game';

function App() {
  const [isTouching, setIsTouching] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log('Handpose model loaded.');
    // Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100)
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hand = await net.estimateHands(video);

      const ctx = canvasRef.current.getContext('2d');
      await drawHand(hand, ctx);
      await handleDistance(hand);
    }
  }

  const handleDistance = (predictions) => {
    if (predictions.length > 0) {
      predictions.forEach(async (prediction) => {
        const landmarks = prediction.landmarks;
        const thumbTipPoint = landmarks[4]
        const indexFingerTipPoint = landmarks[8]
        const xDiff = thumbTipPoint[0] - indexFingerTipPoint[0]
        const yDiff = thumbTipPoint[1] - indexFingerTipPoint[1]
        const dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff)
    
        if (dist < 30) {
            setIsTouching(true);
        } else {
            setIsTouching(false);
        }
      })
    }
  }

  useEffect(() => {
    document.dispatchEvent(new KeyboardEvent('keydown',{key:'p'}))
  }, [isTouching])

  useEffect(() => {
    runHandpose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
    <div className="App">
      <div className="App-header"> 
        <Webcam ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: '0',
          right: '0',
          textAlign: 'center',
          zIndex: '9',
          width: 'auto',
          height: '60vh'
        }} />
        <canvas ref={canvasRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: '0',
          right: '0',
          textAlign: 'center',
          zIndex: '9',
          width: 'auto',
          height: '60vh'
        }} />
      </div>
      {/* <h3 style={{width: '100%', background: 'white'}}>Depending on your device, usually it takes about 20 seconds for the program to run.</h3> */}
    </div>
    <Game/>
    </>
  );
}

export default App;
