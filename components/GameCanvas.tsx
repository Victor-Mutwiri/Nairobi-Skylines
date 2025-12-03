
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GridSystem, TILE_SIZE } from './GridSystem';
import { useCityStore, TileData } from '../store/useCityStore';
import { BuildingRenderer } from './BuildingRenderer';
import { InstancedBuildings } from './InstancedBuildings';
import { TrafficSystem } from './TrafficSystem';
import { FireSystem } from './FireSystem';

const CYCLE_DURATION = 30; // Seconds

const DayNightCycle: React.FC = () => {
  const setIsNight = useCityStore((state) => state.setIsNight);
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);
  
  const dirLight = useRef<THREE.DirectionalLight>(null);
  const ambientLight = useRef<THREE.AmbientLight>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const [sunPos, setSunPos] = useState<[number, number, number]>([50, 80, 30]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() % CYCLE_DURATION;
    const progress = time / CYCLE_DURATION; // 0 to 1
    
    // Cycle: 0.25 (Noon) -> 0.75 (Midnight)
    // Shift phase so 0 = Sunrise/Morning
    const angle = (progress * Math.PI * 2) - (Math.PI / 4); 
    
    // Calculate Sun Position (Simple arc over X axis)
    const radius = 100;
    const y = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius * 0.5;
    const x = Math.cos(angle) * radius * 0.5 + 50;

    // Determine Day/Night Intensity Factor (0 to 1)
    // Used for interpolation
    const intensityFactor = Math.max(0, Math.sin(angle));

    if (dirLight.current) {
        dirLight.current.position.set(x, y, z);
        
        // Intensity mapping
        // Noon (y=100) -> High intensity
        // Night (y<0) -> Zero intensity
        const intensity = intensityFactor * 2.5;
        dirLight.current.intensity = intensity;
        
        // Update Color based on time (Golden hour vs White noon)
        if (Math.sin(angle) < 0.2 && Math.sin(angle) > 0) {
             dirLight.current.color.setHSL(0.1, 0.8, 0.5); // Orange/Red
        } else {
             dirLight.current.color.setHSL(0.1, 0.1, 0.95); // White/Yellow
        }
    }

    // Set Night State
    const isNightNow = y < 0;
    // We update store infrequently to avoid React thrashing
    if (useCityStore.getState().isNight !== isNightNow) {
        setIsNight(isNightNow);
    }

    // Update Sun Position for Sky Shader
    setSunPos([x, y, z]);

    // Ambient Light Logic
    if (ambientLight.current) {
        if (isPowerOverlay) {
             ambientLight.current.intensity = 0.4;
             ambientLight.current.color.setHex(0xcbd5e1);
        } else if (isNightNow) {
             // Night Ambient
             ambientLight.current.intensity = 0.1;
             ambientLight.current.color.setHex(0x1e1b4b); // Dark Blue
        } else {
             // Day Ambient
             ambientLight.current.intensity = 0.6;
             ambientLight.current.color.setHex(0xffffff);
        }
    }

    // Fog Logic - Simulate Nairobi Air Quality
    if (fogRef.current) {
       if (isPowerOverlay) {
          // Dark fog for overlay mode to highlight grid
          fogRef.current.color.setHex(0x111827); 
       } else {
          const dayColor = new THREE.Color("#C4B5A5"); // Brownish-Grey (Dusty/Smoggy)
          const nightColor = new THREE.Color("#0f172a"); // Dark Slate (Night)
          
          // Interpolate fog color based on sun height/intensity
          // Smooth transition
          fogRef.current.color.lerpColors(nightColor, dayColor, intensityFactor);
       }
    }
  });

  return (
    <>
      <ambientLight ref={ambientLight} intensity={0.6} color="#ffffff" />
      <directionalLight 
        ref={dirLight}
        position={[50, 80, 30]} 
        intensity={2.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
      </directionalLight>
      
      {/* Dynamic Fog for atmosphere and edge masking */}
      <fog ref={fogRef} attach="fog" args={['#C4B5A5', 30, 140]} />

      {/* Sky changes with Sun Position */}
      <Sky sunPosition={sunPos} turbidity={10} rayleigh={0.5} mieCoefficient={0.05} mieDirectionalG={0.8} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

const GameCanvas: React.FC = () => {
  const tiles = useCityStore((state) => state.tiles);
  const activeTool = useCityStore((state) => state.activeTool);
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);

  // Instanced types are handled by InstancedBuildings.tsx
  // Added 'road' to this list for performance optimization
  const isInstanced = (type: string) => 
    ['runda_house', 'kiosk', 'apartment', 'acacia', 'road'].includes(type);

  return (
    <div className="w-full h-full bg-[#87CEEB]">
      <Canvas
        shadows
        dpr={[1, 2]} // Handle pixel ratio for sharp rendering
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        {/* Camera Setup: Positioned high and angled for isometric feel */}
        <PerspectiveCamera 
          makeDefault 
          position={[50, 60, 50]} 
          fov={40} 
          near={0.1} 
          far={1000} 
        />

        {/* Controls: Restricted to keep the "City Builder" perspective */}
        {/* Rotation locked when building to prevent accidental camera moves while tapping */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={!activeTool} 
          minDistance={20}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.2} // Prevent camera from going under the ground
          minPolarAngle={0.1}
          target={[0, 0, 0]}
        />

        {/* Dynamic Lighting System */}
        <DayNightCycle />
        
        {/* The Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          receiveShadow
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color={isPowerOverlay ? "#333333" : "#4f772d"} roughness={0.8} />
        </mesh>

        {/* --- RENDERERS --- */}

        {/* 1. Instanced Buildings (High Performance for mass objects like Roads and Houses) */}
        <InstancedBuildings />

        {/* 2. Unique/Dynamic Buildings (Landmarks, Utilities) */}
        {Object.values(tiles).map((tile: TileData) => {
          if (isInstanced(tile.type)) return null;

          return (
            <BuildingRenderer 
              key={`${tile.x},${tile.z}`}
              type={tile.type}
              position={[
                tile.x * TILE_SIZE + TILE_SIZE / 2, 
                0, 
                tile.z * TILE_SIZE + TILE_SIZE / 2
              ]}
              rotation={tile.rotation}
              isOverlay={isPowerOverlay}
            />
          );
        })}

        {/* Traffic Simulation */}
        <TrafficSystem />

        {/* Fire Simulation */}
        <FireSystem />

        {/* Interactive Grid System */}
        <GridSystem />

      </Canvas>
    </div>
  );
};

export default GameCanvas;
