import React, { useEffect, useRef } from "react";
import './styles.css';
import { updateGround, setupGround } from "./ground.js"
import { updateDino, setupDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setupCactus, getCactusRects } from "./cactus.js"

const WORLD_WIDTH = 100
const WORLD_HEIGHT = 30
const SPEED_SCALE_INCREASE = 0.00001

let lastTime
let speedScale
let score

export default function Game() {
    const worldRef = useRef();
    const screenRef = useRef();
    const groundRef1 = useRef();
    const groundRef2 = useRef();
    const dinoRef = useRef();
    const scoreRef = useRef();

    function setPixelToWorldScale() {
        let worldToPixelScale
        if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
          worldToPixelScale = window.innerWidth / WORLD_WIDTH
        } else {
          worldToPixelScale = window.innerHeight / WORLD_HEIGHT
        }
        
        worldRef.current.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
        worldRef.current.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
    }
    
    function handleStart() {
        lastTime = null
        speedScale = 1
        score = 0
        setupGround(groundRef1, groundRef2)
        setupDino(dinoRef)
        setupCactus()
        screenRef.current.classList.add("hide")
        window.requestAnimationFrame(update)
    }
    
    async function update(time) {
        if (lastTime == null) {
          lastTime = time
          window.requestAnimationFrame((time) => {
              update(time)
          })
          return
        }
        const delta = time - lastTime

        console.log()
      
        updateGround(delta, speedScale, groundRef1, groundRef2)
        updateDino(delta, speedScale, dinoRef)
        updateCactus(delta, speedScale, worldRef)
        updateSpeedScale(delta)
        updateScore(delta, scoreRef)
        if (checkLose()) return handleLose(dinoRef, screenRef)
      
        lastTime = time
        window.requestAnimationFrame((time) => {
            update(time)
        })
    }
    
    function updateSpeedScale(delta) {
        speedScale += delta * SPEED_SCALE_INCREASE
    }
    
    function updateScore(delta) {
        score += delta * 0.01
        scoreRef.current.textContent = Math.floor(score)
    }
    
    function checkLose() {
        const dinoRect = getDinoRect(dinoRef)
        return getCactusRects().some(rect => isCollision(rect, dinoRect))
    }
    
    function isCollision(rect1, rect2) {
        return (
          rect1.left < rect2.right &&
          rect1.top < rect2.bottom &&
          rect1.right > rect2.left &&
          rect1.bottom > rect2.top
        )
    }
    
    function handleLose() {
        setDinoLose(dinoRef)
        setTimeout(() => {
          document.addEventListener("click", handleStart, { once: true })
          screenRef.current.classList.remove("hide")
        }, 100)
    }

    useEffect(() => {
        setPixelToWorldScale()
        window.addEventListener("resize", setPixelToWorldScale())
        document.addEventListener("click", handleStart, { once: true })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return (
        <div className="world" ref={worldRef}>
            <div className="score" ref={scoreRef}>0</div>
            <div className="start-screen" ref={screenRef}>Press Any Key To Start</div>
            <img alt="" src="imgs/ground.png" className="ground" ref={groundRef1}/>
            <img alt="" src="imgs/ground.png" className="ground" ref={groundRef2}/>
            <img alt="" src="imgs/dino-stationary.png" className="dino" ref={dinoRef}/>
            <div id="gameScript"></div>
        </div>
    );
}