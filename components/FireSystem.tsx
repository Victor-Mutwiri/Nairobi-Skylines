
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../store/useCityStore';
import { TILE_SIZE } from './GridSystem';
import * as THREE from 'three';

const FireMesh: React.FC<{ x: number, z: number }> = ({ x, z }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Simple pulse animation
      const t = clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 10) * 0.2;
      meshRef.current.scale.set(scale, scale, scale);
      meshRef.current.rotation.y = t * 2;
    }
  });

  return (
    <group ref={meshRef} position={[x * TILE_SIZE + TILE_SIZE / 2, 2, z * TILE_SIZE + TILE_SIZE / 2]}>
      {/* Core */}
      <mesh>
        <coneGeometry args={[1, 2, 6]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>
      {/* Outer Flame */}
      <mesh position={[0, -0.5, 0]} scale={[1.5, 0.8, 1.5]}>
        <coneGeometry args={[1, 2, 6]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

export const FireSystem: React.FC = () => {
  const fires = useCityStore((state) => state.fires);

  return (
    <group>
      {Object.keys(fires).map((key) => {
        const [x, z] = key.split(',').map(Number);
        return <FireMesh key={key} x={x} z={z} />;
      })}
    </group>
  );
};
