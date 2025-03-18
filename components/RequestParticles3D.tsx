'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface RequestParticles3DProps {
  isLoading: boolean
  onComplete: () => void
}

export default function RequestParticles3D({ isLoading, onComplete }: RequestParticles3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Object3D | null>(null)
  const frameIdRef = useRef<number>(0)

  // Add state for controls
  const [rotationX, setRotationX] = useState(-23.5)
  const [rotationY, setRotationY] = useState(80)
  const [cameraX, setCameraX] = useState(-20)
  const [cameraY, setCameraY] = useState(20)
  const [cameraZ, setCameraZ] = useState(35)
  const [scale, setScale] = useState(2)

  useEffect(() => {
    if (!containerRef.current) return

    // Store references to DOM elements at effect initialization time
    const container = containerRef.current
    
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      30,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    camera.position.set(-20, 20, 35)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Create a group to hold both the globe and base sphere
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    // Load globe model
    const loader = new GLTFLoader()
    loader.load('/models/globe.glb', 
      (gltf) => {
        const globe = gltf.scene
        
        // Reflect the globe by scaling X negatively
        globe.scale.set(-2, 2, 2)
        
        // Fixed rotation to show USA
        globe.rotation.y = THREE.MathUtils.degToRad(80)
        globe.rotation.x = THREE.MathUtils.degToRad(-23.5)

        // Base sphere grid
        const sphereGeometry = new THREE.SphereGeometry(9.9, 32, 32)
        const wireframe = new THREE.WireframeGeometry(sphereGeometry)
        const baseLine = new THREE.LineSegments(
          wireframe,
          new THREE.LineBasicMaterial({
            color: 0x7FDBFF,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false
          })
        )
        // Match globe scale including reflection
        baseLine.scale.set(-2, 2, 2)
        baseLine.rotation.copy(globe.rotation)
        
        // Add both to the group
        globeGroup.add(globe)
        globeGroup.add(baseLine)

        // NYC coordinates (adjusted for better visibility)
        const nycLat = 40.7
        const nycLong = -74
        const radius = 20
        const phi = (90 - nycLat) * (Math.PI / 180)
        const theta = (nycLong + 180) * (Math.PI / 180)
        
        // Calculate NYC point
        const nycPoint = new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )

        // Create line pointing to NYC
        const lineEnd = nycPoint.clone().multiplyScalar(1.2)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([nycPoint, lineEnd])
        const line = new THREE.Line(
          lineGeometry,
          new THREE.LineBasicMaterial({
            color: 0x7FDBFF,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
          })
        )
        scene.add(line)

        // Larger dot for NYC
        const dotGeometry = new THREE.SphereGeometry(0.3, 16, 16)
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: 0x7FDBFF,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
        })
        const dot = new THREE.Mesh(dotGeometry, dotMaterial)
        dot.position.copy(nycPoint)
        scene.add(dot)

        // Add floating text
        const labelDiv = document.createElement('div')
        labelDiv.className = 'absolute text-[#7FDBFF] text-lg font-mono bg-black/50 px-3 py-1.5 rounded whitespace-nowrap'
        labelDiv.textContent = 'api.materials.nyc'
        container.appendChild(labelDiv)

        // Apply wireframe to continents
        globe.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const wireframe = new THREE.WireframeGeometry(child.geometry)
            const line = new THREE.LineSegments(
              wireframe,
              new THREE.LineBasicMaterial({
                color: 0x7FDBFF,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false
              })
            )
            
            if (child.parent) {
              child.parent.add(line)
              child.parent.remove(child)
            }
          }
        })

        globeRef.current = globeGroup

        // Update function
        const updateScene = () => {
          if (globeRef.current && cameraRef.current) {
            // Update group rotation
            globeRef.current.rotation.x = THREE.MathUtils.degToRad(rotationX)
            globeRef.current.rotation.y = THREE.MathUtils.degToRad(rotationY)
            
            // Update camera position
            cameraRef.current.position.set(cameraX, cameraY, cameraZ)
            cameraRef.current.lookAt(0, 0, 0)
            
            // Update group scale (keeping X negative for reflection)
            globeRef.current.scale.set(-scale, scale, scale)
            
            // Render
            if (rendererRef.current && sceneRef.current) {
              rendererRef.current.render(sceneRef.current, cameraRef.current)
            }
          }
        }

        // Initial render
        updateScene()

        // Only update label position
        const updateLabel = () => {
          if (container) {
            const labelPos = lineEnd.clone()
            labelPos.project(camera)
            
            const x = (labelPos.x * 0.5 + 0.5) * container.clientWidth
            const y = (-labelPos.y * 0.5 + 0.5) * container.clientHeight
            
            labelDiv.style.transform = `translate(-50%, -50%)`
            labelDiv.style.left = `${x}px`
            labelDiv.style.top = `${y}px`
          }
          
          renderer.render(scene, camera)
          frameIdRef.current = requestAnimationFrame(updateLabel)
        }

        updateLabel()
      }
    )

    // Handle resize
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return
      
      const width = container.clientWidth
      const height = container.clientHeight
      
      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
      renderer.render(scene, camera)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
      // Use the stored container reference instead of current ref
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement)
      }
    }
  }, [cameraX, cameraY, cameraZ, rotationX, rotationY, scale])

  useEffect(() => {
    if (!isLoading && frameIdRef.current) {
      cancelAnimationFrame(frameIdRef.current)
      onComplete()
    }
  }, [isLoading, onComplete])

  useEffect(() => {
    const updateScene = () => {
      if (globeRef.current && cameraRef.current) {
        // Update globe rotation
        globeRef.current.rotation.x = THREE.MathUtils.degToRad(rotationX)
        globeRef.current.rotation.y = THREE.MathUtils.degToRad(rotationY)
        
        // Update camera position
        cameraRef.current.position.set(cameraX, cameraY, cameraZ)
        cameraRef.current.lookAt(0, 0, 0)
        
        // Update scale
        globeRef.current.scale.set(-scale, scale, scale)
        
        // Render
        if (rendererRef.current && sceneRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }
    }

    updateScene()
  }, [rotationX, rotationY, cameraX, cameraY, cameraZ, scale])

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="w-full h-[400px] relative" />
      
      {/* Controls - Added z-10 and adjusted styling */}
      <div className="space-y-2 p-4 bg-black/80 rounded font-mono text-sm relative z-10 border border-[#7FDBFF]/20">
        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Rotation X:</label>
          <input 
            type="range" 
            min="-180" 
            max="180" 
            value={rotationX} 
            onChange={(e) => setRotationX(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{rotationX}°</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Rotation Y:</label>
          <input 
            type="range" 
            min="-180" 
            max="180" 
            value={rotationY} 
            onChange={(e) => setRotationY(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{rotationY}°</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Camera X:</label>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            value={cameraX} 
            onChange={(e) => setCameraX(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{cameraX}</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Camera Y:</label>
          <input 
            type="range" 
            min="-50" 
            max="50" 
            value={cameraY} 
            onChange={(e) => setCameraY(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{cameraY}</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Camera Z:</label>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={cameraZ} 
            onChange={(e) => setCameraZ(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{cameraZ}</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-24 shrink-0">Scale:</label>
          <input 
            type="range" 
            min="0.5" 
            max="5" 
            step="0.1"
            value={scale} 
            onChange={(e) => setScale(Number(e.target.value))}
            className="flex-1 z-20 relative"
          />
          <span className="w-12 text-right shrink-0">{scale}x</span>
        </div>

        {/* Copy button */}
        <button
          onClick={() => {
            const settings = {
              rotationX, rotationY,
              cameraX, cameraY, cameraZ,
              scale
            }
            navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
          }}
          className="mt-4 px-3 py-1.5 border border-[#7FDBFF]/30 rounded hover:bg-[#7FDBFF]/10 relative z-20"
        >
          Copy Settings
        </button>
      </div>
    </div>
  )
} 