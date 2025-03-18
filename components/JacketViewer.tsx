'use client'

import React, { useState, Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { Selection, EffectComposer, Outline } from '@react-three/postprocessing'
import Link from 'next/link'

type Item = {
  id: string;
  name: string;
  model: string;
  status: string;
  details: string[];
  config?: ModelConfig;
}

// Add configuration type
type ModelConfig = {
  scale: number;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  fov: number;
}

// Add type for model stats
type ModelStats = {
  triangles: number;
  vertices: number;
  materials: number;
}

const ITEMS: (Item & { config?: ModelConfig })[] = [
  {
    id: 'jacket-v1',
    name: 'UMI CHORE JACKET V1',
    model: '/models/jacket.glb',
    status: 'PROTOTYPE',
    details: [
      'MATERIAL: VINTAGE QUILTED COTTON',
      'COLOR: OLIVE',
      'SIZING: OVERSIZED',
      'RELEASE: TBD'
    ],
    config: {
      scale: 1.8,
      position: [0, -1.8, 0],
      cameraPosition: [3.0, 0.0, 3.0],
      fov: 50.0
    }
  },
  {
    id: 'dress-v0',
    name: 'EVENING GOWN V0',
    model: '/models/dress.glb',
    status: 'CONCEPT',
    details: [
      'MATERIAL: MULTILAYER SILK',
      'COLOR: BLACK',
      'SIZING: FITTED',
      'LAYERS: 3',
      'RELEASE: TBD'
    ],
    config: {
      scale: 2.0,
      position: [0, -1.8, 0],
      cameraPosition: [3.0, 0.0, 3.0],
      fov: 50.0
    }
  }
]

function Model({ 
  wireframe, 
  modelPath, 
  config,
  onStatsCalculated
}: { 
  wireframe: boolean; 
  modelPath: string;
  config: ModelConfig;
  onStatsCalculated: (stats: ModelStats) => void;
}) {
  const gltf = useGLTF(modelPath)
  const materialsRef = React.useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map())
  const initializedRef = React.useRef(false)

  // Calculate model statistics
  React.useEffect(() => {
    let triangles = 0
    let vertices = 0
    const materials = new Set()

    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          // Count triangles
          const geometry = child.geometry
          if (geometry.index !== null) {
            triangles += geometry.index.count / 3
          } else {
            triangles += geometry.attributes.position.count / 3
          }
          // Count vertices
          vertices += geometry.attributes.position.count
        }
        // Count unique materials
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => materials.add(mat))
        } else {
          materials.add(child.material)
        }
      }
    })

    onStatsCalculated({
      triangles: Math.round(triangles),
      vertices: vertices,
      materials: materials.size
    })
  }, [gltf, onStatsCalculated])

  // Initialize materials only once when the model first loads
  React.useEffect(() => {
    materialsRef.current.clear()
    initializedRef.current = false
  }, [modelPath])

  React.useEffect(() => {
    if (!initializedRef.current) {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          try {
            if (Array.isArray(child.material)) {
              const materials = child.material.map(mat => {
                if (!mat) return new THREE.MeshStandardMaterial({ side: THREE.DoubleSide })
                const newMat = new THREE.MeshStandardMaterial({
                  map: mat.map || null,
                  normalMap: mat.normalMap || null,
                  roughnessMap: mat.roughnessMap || null,
                  metalnessMap: mat.metalnessMap || null,
                  color: mat.color || '#ffffff',
                  side: THREE.DoubleSide
                })
                return newMat
              })
              materialsRef.current.set(child, materials)
            } else {
              const newMat = new THREE.MeshStandardMaterial({
                map: child.material.map || null,
                normalMap: child.material.normalMap || null,
                roughnessMap: child.material.roughnessMap || null,
                metalnessMap: child.material.metalnessMap || null,
                color: child.material.color || '#ffffff',
                side: THREE.DoubleSide
              })
              materialsRef.current.set(child, newMat)
            }
          } catch (error) {
            console.warn('Error copying material:', error)
            materialsRef.current.set(child, new THREE.MeshStandardMaterial({ 
              side: THREE.DoubleSide
            }))
          }
        }
      })
      initializedRef.current = true
    }
  }, [gltf, modelPath])

  // Handle wireframe toggle
  React.useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (wireframe) {
          child.material = new THREE.MeshBasicMaterial({
            color: '#00ffff',
            wireframe: true,
            wireframeLinewidth: 1,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8, // Make wireframe more visible
          });
        } else {
          const originalMaterial = materialsRef.current.get(child)
          if (originalMaterial) {
            child.material = Array.isArray(originalMaterial) 
              ? originalMaterial.map(mat => mat.clone())
              : originalMaterial.clone()
          }
        }
      }
    })
  }, [wireframe, gltf, modelPath])

  return (
    <group>
      <primitive 
        object={gltf.scene} 
        scale={config.scale}
        position={config.position}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  )
}

function Lights({ modelPath }: { modelPath: string }) {
  const isDress = modelPath.includes('dress')
  const intensity = isDress ? 0.5 : 1.0
  const spotIntensity = isDress ? 2 : 4

  return (
    <>
      <ambientLight intensity={intensity} />
      <spotLight
        position={[4, 4, 2]}
        angle={0.4}
        penumbra={1}
        intensity={spotIntensity}
        distance={10}
        color="#ffffff"
        castShadow
      />
      <spotLight
        position={[-3, 2, -3]}
        angle={0.3}
        penumbra={1}
        intensity={spotIntensity * 0.6}
        distance={8}
        color="#b0c4de"
      />
      <spotLight
        position={[0, 3, 5]}
        angle={Math.PI / 4}
        penumbra={0.8}
        intensity={spotIntensity * 0.75}
        distance={15}
        color="#ffffff"
      />
    </>
  )
}

function TerminalUI({ 
  selectedItem, 
  wireframe, 
  setWireframe,
  setSelectedItem,
  modelStats
}: { 
  selectedItem: Item;
  wireframe: boolean;
  setWireframe: (value: boolean) => void;
  setSelectedItem: (item: Item) => void;
  modelStats: ModelStats | null;
}) {
  return (
    <div className="font-receipt-narrow text-[#00ffff] p-4 h-full">
      <div className="mb-4 text-[#4488ff]">
        {`>`} ORBIT INSERTION: MODEL_VIEWER v1.0
      </div>
      
      <div className="mb-4">
        {`>`} SELECT MODEL:
        {ITEMS.map((item) => (
          <button 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`block ml-2 ${
              selectedItem.id === item.id 
                ? 'text-[#00ffff]' 
                : 'text-[#4488ff] hover:text-[#00ffff]'
            } transition-colors`}
          >
            {`>`} {item.name}
          </button>
        ))}
      </div>

      <div className="mb-4">
        {`>`} LOADING MODEL: {selectedItem.name}
        <br />
        {`>`} STATUS: {selectedItem.status}
      </div>

      <div className="mb-4">
        {`>`} SPECIFICATIONS:
        {selectedItem.details.map((detail, index) => (
          <div key={index} className="ml-2">
            {detail}
          </div>
        ))}
      </div>

      {modelStats && (
        <div className="mb-4">
          {`>`} MODEL STATISTICS:
          <div className="ml-2">
            TRIANGLES: {modelStats.triangles.toLocaleString()}
            <br />
            VERTICES: {modelStats.vertices.toLocaleString()}
            <br />
            MATERIALS: {modelStats.materials}
          </div>
        </div>
      )}

      <div className="mb-4">
        {`>`} DISPLAY MODE: {wireframe ? 'WIREFRAME' : 'SOLID'}
        <br />
        <button 
          onClick={() => setWireframe(!wireframe)}
          className="ml-2 text-[#4488ff] hover:text-[#00ffff] transition-colors"
        >
          {`>`} TOGGLE_WIREFRAME
        </button>
      </div>

      <div className="animate-pulse">
        {`>`} _
      </div>
    </div>
  )
}

function Scene({ wireframe, modelPath, config, onStatsCalculated }: { 
  wireframe: boolean; 
  modelPath: string;
  config: ModelConfig;
  onStatsCalculated: (stats: ModelStats) => void;
}) {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(
      config.cameraPosition[0],
      config.cameraPosition[1],
      config.cameraPosition[2]
    )
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera, config.cameraPosition])

  return (
    <>
      <color attach="background" args={['#000033']} />
      <Lights modelPath={modelPath} />
      <Environment preset="warehouse" />
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline 
            visibleEdgeColor={0x00ffff}
            hiddenEdgeColor={0x4488ff}
            blur
            edgeStrength={wireframe ? 3 : 0}
          />
        </EffectComposer>
        <Suspense fallback={null}>
          <Model 
            wireframe={wireframe} 
            modelPath={modelPath} 
            config={config}
            onStatsCalculated={onStatsCalculated}
          />
        </Suspense>
      </Selection>
      <OrbitControls 
        autoRotate
        autoRotateSpeed={1.0}
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI * 2/3}
        target={[0, 0, 0]}
        makeDefault
      />
    </>
  )
}

const defaultConfig: ModelConfig = {
  scale: 1.0,
  position: [0, 0, 0],
  cameraPosition: [3, 0, 3],
  fov: 50
}

export default function JacketViewer() {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0])
  const [wireframe, setWireframe] = useState(true)
  const [config, setConfig] = useState<ModelConfig>(selectedItem.config ?? ITEMS[0].config ?? defaultConfig)
  const [modelStats, setModelStats] = useState<ModelStats | null>(null)

  useEffect(() => {
    setConfig(selectedItem.config ?? ITEMS[0].config ?? defaultConfig)
  }, [selectedItem])

  return (
    <div className="fixed inset-0 bg-[#000033] p-8">
      <Link 
        href="/"
        className="absolute top-8 right-8 z-30 px-4 py-2 font-receipt-narrow text-[#00ffff] 
                 hover:bg-[#4488ff]/20 transition-colors duration-200 flex items-center gap-2"
      >
        {`<`} RETURN_HOME
      </Link>

      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="w-full h-full animate-scanline bg-gradient-to-b from-transparent via-[#00ffff]/10 to-transparent" 
             style={{
               backgroundSize: '100% 4px',
               backgroundRepeat: 'repeat',
             }}
        />
      </div>

      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="order-1 md:order-2 border-2 border-[#4488ff] rounded-lg bg-[#000033]/80 overflow-auto max-h-[50vh] md:max-h-full">
          <TerminalUI 
            selectedItem={selectedItem} 
            wireframe={wireframe}
            setWireframe={setWireframe}
            setSelectedItem={setSelectedItem}
            modelStats={modelStats}
          />
        </div>

        <div className="order-2 md:order-1 relative border-2 border-[#4488ff] rounded-lg h-[50vh] md:h-auto">
          <div className="absolute top-0 left-0 z-10 p-2 font-receipt-narrow text-[#00ffff] text-sm bg-[#000033]/80 rounded-tl-lg border-r-2 border-b-2 border-[#4488ff]">
            ORBIT_CAM_01 {`>`} RENDERING... {wireframe ? '[WIREFRAME]' : '[SOLID]'}
          </div>

          {modelStats && (
            <div className="absolute bottom-0 left-0 z-10 p-2 font-receipt-narrow text-[#ff4444] text-sm bg-[#000033]/80">
              TRIANGLES: {modelStats.triangles.toLocaleString()} | 
              VERTICES: {modelStats.vertices.toLocaleString()} | 
              MATERIALS: {modelStats.materials}
            </div>
          )}

          <Canvas
            shadows
            camera={{ 
              position: config.cameraPosition,
              fov: config.fov,
              near: 0.1,
              far: 1000,
              up: [0, 1, 0]
            }}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              outputColorSpace: THREE.SRGBColorSpace
            }}
            onCreated={({ camera }) => {
              camera.position.set(
                config.cameraPosition[0],
                config.cameraPosition[1],
                config.cameraPosition[2]
              )
              camera.updateProjectionMatrix()
            }}
          >
            <Scene 
              wireframe={wireframe} 
              modelPath={selectedItem.model} 
              config={config}
              onStatsCalculated={setModelStats}
            />
          </Canvas>
        </div>
      </div>
    </div>
  )
}

// Preload all models
ITEMS.forEach(item => {
  useGLTF.preload(item.model)
}) 