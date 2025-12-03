
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GridSystem, TILE_SIZE } from './GridSystem';
import { useCityStore, TileData } from '../store/useCityStore';
import { BuildingRenderer, AdjacencyInfo } from './BuildingRenderer';

// Fix for React 18 / TypeScript: Augment React.JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      fog: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      gridHelper: any;
      meshBasicMaterial: any;
      boxGeometry: any;
      group: any;
    }
  }
}

// Global augmentation as backup
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      fog: any;
      mesh: any;
      planeGeometry: any;
      meshStandardMaterial: any;
      gridHelper: any;
      meshBasicMaterial: any;
      boxGeometry: any;
      group: any;
    }
  }
}

const GameCanvas: React.FC = () => {
  const tiles = useCityStore((state) => state.tiles);

  // Helper to calculate road adjacencies efficiently during render
  const getRoadAdjacency = (x: number, z: number): AdjacencyInfo => {
    const isRoad = (tx: number, tz: number) => tiles[`${tx},${tz}`]?.type === 'road';
    return {
      north: isRoad(x, z - 1),
      south: isRoad(x, z + 1),
      east: isRoad(x + 1, z),
      west: isRoad(x - 1, z),
    };
  };

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
          enableRotate={true}
          minDistance={20}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.2} // Prevent camera from going under the ground
          minPolarAngle={0.1}
          target={[0, 0, 0]}
        />

        {/* Environment / Lighting */}
        <ambientLight intensity={0.7} color="#cbd5e1" />
        <directionalLight 
          position={[50, 80, 30]} 
          intensity={2.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        >
          <orthographicCamera attach="shadow-camera" args={[-100, 100, 100, -100]} />
        </directionalLight>

        {/* Skybox */}
        <Sky sunPosition={[50, 80, 30]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Fog for depth and to hide chunk edges */}
        <fog attach="fog" args={['#87CEEB', 30, 180]} />

        {/* The Ground */}
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.1, 0]} 
          receiveShadow
        >
          <planeGeometry args={[1000, 1000]} />
          <meshStandardMaterial color="#4f772d" roughness={0.8} />
        </mesh>

        {/* Placed Buildings */}
        {Object.values(tiles).map((tile: TileData) => {
          const adjacencies = tile.type === 'road' ? getRoadAdjacency(tile.x, tile.z) : undefined;
          
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
              adjacencies={adjacencies}
            />
          );
        })}

        {/* Interactive Grid System */}
        <GridSystem />

      </Canvas>
    </div>
  );
};

export default GameCanvas;
