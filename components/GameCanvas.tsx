import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GridSystem, TILE_SIZE } from './GridSystem';
import { useCityStore, TileData } from '../store/useCityStore';
import { BuildingRenderer } from './BuildingRenderer';
import { InstancedBuildings } from './InstancedBuildings';
import { TrafficSystem } from './TrafficSystem';
import { FireSystem } from './FireSystem';

const StaticLighting: React.FC = () => {
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);
  
  // Static Sun Position: High Noon / Early Afternoon for best visibility
  const sunPosition = new THREE.Vector3(50, 100, 30);

  return (
    <>
      <ambientLight 
        intensity={isPowerOverlay ? 0.4 : 0.8} 
        color={isPowerOverlay ? "#cbd5e1" : "#ffffff"} 
      />
      
      <directionalLight 
        position={sunPosition} 
        intensity={2.0} 
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
      
      <Sky sunPosition={sunPosition} turbidity={8} rayleigh={0.5} mieCoefficient={0.05} mieDirectionalG={0.8} />
      {/* Fog to hide map edges nicely */}
      <fog attach="fog" args={[isPowerOverlay ? '#111827' : '#C4B5A5', 30, 140]} />
    </>
  );
};

const GameCanvas: React.FC = () => {
  const tiles = useCityStore((state) => state.tiles);
  const activeTool = useCityStore((state) => state.activeTool);
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);

  // Instanced types are handled by InstancedBuildings.tsx
  const isInstanced = (type: string) => 
    ['runda_house', 'kiosk', 'apartment', 'acacia', 'road', 'expressway_pillar'].includes(type);

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

        {/* Lighting System */}
        <StaticLighting />
        
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