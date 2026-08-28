/* eslint-disable react/no-unknown-property */
'use client'

import React, { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type LabelRect = {
  label: string
  x: number
  y: number
  w: number
  h: number
}

const FONT_URL = '/fonts/monaspace-krypton.typeface.json'

// ---- Environment setup: RoomEnvironment via PMREMGenerator, set as
// scene.environment so every MeshStandardMaterial in the scene auto-uses
// it for PBR reflections. No network fetch, no HDR file, fully local.
function EnvironmentSetup() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    pmrem.compileEquirectangularShader()
    const roomEnv = new RoomEnvironment()
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture
    scene.environment = envTex
    pmrem.dispose()
    return () => {
      scene.environment = null
      envTex.dispose()
    }
  }, [gl, scene])
  return null
}

// ---- Inner R3F scene: text meshes, rotation, hover animation ----

type SceneProps = {
  positions: LabelRect[]
  wrapperSize: { w: number; h: number }
  mouseRef: React.MutableRefObject<{ x: number; y: number }>
}

function ChromeScene({ positions, wrapperSize, mouseRef }: SceneProps) {
  const cursorLightRef = useRef<THREE.PointLight>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const hoverScalesRef = useRef<number[]>(positions.map(() => 1))
  // Uniform scale applied to ALL labels so they're the same visual height
  // but the widest one still fits its DOM button. Computed from onCentered.
  const uniformScaleRef = useRef(1)
  const measuredWidths = useRef<number[]>([])

  useFrame((_, delta) => {
    const { w, h } = wrapperSize
    if (w <= 0 || h <= 0) return

    const ease = 1 - Math.pow(0.00001, delta)

    // Position the cursor point light in world space to follow the mouse
    if (cursorLightRef.current) {
      const lx = mouseRef.current.x - w / 2
      const ly = -(mouseRef.current.y - h / 2)
      cursorLightRef.current.position.set(lx, ly, 28)
    }

    // Hit-test for hover
    let hoveredIdx = -1
    const mxPx = mouseRef.current.x
    const myPx = mouseRef.current.y
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i]
      if (mxPx >= p.x && mxPx <= p.x + p.w && myPx >= p.y && myPx <= p.y + p.h) {
        hoveredIdx = i
        break
      }
    }

    const scaleEase = 1 - Math.pow(0.0001, delta)
    for (let i = 0; i < positions.length; i++) {
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      // --- Per-label independent rotation based on mouse proximity ---
      // Each label tilts toward the cursor; closer labels tilt more.
      const labelCx = (positions[i].x + positions[i].w / 2) / w
      const labelCy = (positions[i].y + positions[i].h / 2) / h
      const toMouseX = (mxPx / w) - labelCx
      const toMouseY = (myPx / h) - labelCy
      const dist = Math.sqrt(toMouseX * toMouseX + toMouseY * toMouseY)
      const influence = 1 / (1 + dist * dist * 12)

      const targetRotY = toMouseX * influence * 0.7
      const targetRotX = -toMouseY * influence * 0.5
      mesh.rotation.y += (targetRotY - mesh.rotation.y) * ease
      mesh.rotation.x += (targetRotX - mesh.rotation.x) * ease

      // --- Hover scale ---
      const hoverTarget = i === hoveredIdx ? 1.08 : 1.0
      hoverScalesRef.current[i] += (hoverTarget - hoverScalesRef.current[i]) * scaleEase
      mesh.scale.setScalar(uniformScaleRef.current * hoverScalesRef.current[i])
    }
  })

  useEffect(() => {
    hoverScalesRef.current = positions.map((_, i) => hoverScalesRef.current[i] ?? 1)
    meshRefs.current = meshRefs.current.slice(0, positions.length)
  }, [positions])

  return (
    <>
      {/* PBR environment: scene.environment reflects into every material */}
      <EnvironmentSetup />

      {/* Base fill + hero key light */}
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[40, 60, 40]}
        intensity={1.6}
        color={'#ffffff'}
      />
      {/* Secondary rim from the opposite side */}
      <directionalLight
        position={[-40, -20, 30]}
        intensity={0.5}
        color={'#a8c0ff'}
      />
      {/* Cursor-following orange point light — the interactive glow */}
      <pointLight
        ref={cursorLightRef}
        color={'#ff6b1f'}
        intensity={2200}
        distance={500}
        decay={1.5}
      />

      <group>
        <Suspense fallback={null}>
          {positions.map((pos, i) => {
            const cx = pos.x + pos.w / 2 - wrapperSize.w / 2
            const cy = -(pos.y + pos.h / 2 - wrapperSize.h / 2)
            return (
              <Center
                key={`${pos.label}-${i}`}
                position={[cx, cy, 0]}
                cacheKey={pos.label}
                onCentered={({ width }) => {
                  // Track each label's 3D width. Once all are measured,
                  // compute the tightest uniform scale that makes the
                  // widest label fit its DOM button (with 15% margin).
                  measuredWidths.current[i] = width
                  if (measuredWidths.current.filter(Boolean).length === positions.length) {
                    let minFit = 1
                    for (let j = 0; j < positions.length; j++) {
                      const fit = (positions[j].w * 0.85) / (measuredWidths.current[j] || 1)
                      if (fit < minFit) minFit = fit
                    }
                    uniformScaleRef.current = Math.min(1, minFit)
                  }
                }}
              >
                <Text3D
                  ref={(el) => {
                    meshRefs.current[i] = el
                  }}
                  font={FONT_URL}
                  size={22}
                  height={6}
                  curveSegments={8}
                  bevelEnabled
                  bevelThickness={0.4}
                  bevelSize={0.8}
                  bevelOffset={0}
                  bevelSegments={3}
                >
                  {pos.label}
                  <meshStandardMaterial
                    color={'#f5f7ff'}
                    metalness={1}
                    roughness={0.18}
                    envMapIntensity={1.4}
                  />
                </Text3D>
              </Center>
            )
          })}
        </Suspense>
      </group>
    </>
  )
}

// ---- Canvas mount: dynamically imported by ChromeNav so three.js never
// lands in the bundle for visitors (mobile) who never see the 3D nav. ----

type ChromeNavCanvasProps = SceneProps

export default function ChromeNavCanvas({
  positions,
  wrapperSize,
  mouseRef,
}: ChromeNavCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{
        left: -wrapperSize.w / 2 - 30,
        right: wrapperSize.w / 2 + 30,
        top: wrapperSize.h / 2 + 20,
        bottom: -wrapperSize.h / 2 - 20,
        near: -200,
        far: 200,
        position: [0, 0, 100],
      }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <ChromeScene
        positions={positions}
        wrapperSize={wrapperSize}
        mouseRef={mouseRef}
      />
    </Canvas>
  )
}
