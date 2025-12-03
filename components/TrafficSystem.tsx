
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCityStore, TileData } from '../store/useCityStore';
import { TILE_SIZE } from './GridSystem';

const MATATU_SPEED = 4; // World units per second

const MatatuMesh = React.forwardRef<THREE.Group>((props, ref) => (
  <group ref={ref} {...props}>
     {/* Body */}
    <mesh position={[0, 0.6, 0]} castShadow>
      <boxGeometry args={[1.2, 1.2, 2.2]} />
      <meshStandardMaterial color="#FCD116" />
    </mesh>
    {/* Stripe */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[1.25, 0.3, 2.25]} />
      <meshStandardMaterial color="#000000" />
    </mesh>
    {/* Wheels */}
    <mesh position={[0.6, 0.3, 0.6]}>
      <boxGeometry args={[0.2, 0.4, 0.4]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[-0.6, 0.3, 0.6]}>
      <boxGeometry args={[0.2, 0.4, 0.4]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[0.6, 0.3, -0.6]}>
      <boxGeometry args={[0.2, 0.4, 0.4]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[-0.6, 0.3, -0.6]}>
      <boxGeometry args={[0.2, 0.4, 0.4]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  </group>
));

interface AgentProps {
  startX: number;
  startZ: number;
}

const MatatuAgent: React.FC<AgentProps> = ({ startX, startZ }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // State refs for animation loop
  const state = useRef({
    currentX: startX,
    currentZ: startZ,
    targetX: startX,
    targetZ: startZ,
    progress: 0,
    isMoving: false,
  });

  useFrame((_state3d, delta) => {
    if (!groupRef.current) return;
    
    const s = state.current;
    
    // Movement Logic
    if (s.isMoving) {
      s.progress += (MATATU_SPEED * delta) / TILE_SIZE; // Normalize speed by tile size
      
      if (s.progress >= 1) {
        // Arrived
        s.currentX = s.targetX;
        s.currentZ = s.targetZ;
        s.progress = 0;
        s.isMoving = false;
      } else {
        // Interpolate
        const x = THREE.MathUtils.lerp(s.currentX * TILE_SIZE + TILE_SIZE/2, s.targetX * TILE_SIZE + TILE_SIZE/2, s.progress);
        const z = THREE.MathUtils.lerp(s.currentZ * TILE_SIZE + TILE_SIZE/2, s.targetZ * TILE_SIZE + TILE_SIZE/2, s.progress);
        groupRef.current.position.set(x, 0, z);
      }
    } else {
      // Decide next move
      // Explicitly cast tiles to Record<string, TileData> to avoid 'unknown' type errors
      const tiles = useCityStore.getState().tiles as Record<string, TileData>;
      
      // Check if current tile is still a road
      const currentKey = `${s.currentX},${s.currentZ}`;
      if (tiles[currentKey]?.type !== 'road') {
         // Road deleted? Shrink and hide
         groupRef.current.scale.setScalar(Math.max(0, groupRef.current.scale.x - delta * 5));
         return;
      } else {
         groupRef.current.scale.lerp(new THREE.Vector3(1,1,1), delta * 5);
      }

      // Find Neighbors
      const neighbors = [
        { x: s.currentX + 1, z: s.currentZ },
        { x: s.currentX - 1, z: s.currentZ },
        { x: s.currentX, z: s.currentZ + 1 },
        { x: s.currentX, z: s.currentZ - 1 },
      ].filter(n => tiles[`${n.x},${n.z}`]?.type === 'road');

      if (neighbors.length > 0) {
        // Pick random neighbor
        // Simple heuristic: try to avoid going backwards immediately if other options exist
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        s.targetX = next.x;
        s.targetZ = next.z;
        s.isMoving = true;

        // Rotation - Look at target
        groupRef.current.lookAt(
            next.x * TILE_SIZE + TILE_SIZE/2, 
            0, 
            next.z * TILE_SIZE + TILE_SIZE/2
        );
      }
    }
  });

  // Initial Position
  useEffect(() => {
     if(groupRef.current) {
        groupRef.current.position.set(startX * TILE_SIZE + TILE_SIZE/2, 0, startZ * TILE_SIZE + TILE_SIZE/2);
     }
  }, [startX, startZ]);

  return <MatatuMesh ref={groupRef} />;
};

export const TrafficSystem: React.FC = () => {
  // Explicitly cast tiles to Record<string, TileData> to fix inference issues
  const tiles = useCityStore((state) => state.tiles) as Record<string, TileData>;
  
  // We only track the IDs of agents to spawn. 
  // The agents themselves handle their state (position) via refs to avoid React re-renders.
  const [agents, setAgents] = useState<{id: number, x: number, z: number}[]>([]);

  // Memoize road tiles list for dependency checking
  const roadTiles = useMemo(() => {
    return Object.values(tiles).filter(t => t.type === 'road');
  }, [tiles]);

  useEffect(() => {
    // Requirements: At least 10 road tiles, spawn 5 agents.
    if (roadTiles.length >= 10 && agents.length < 5) {
      const needed = 5 - agents.length;
      const newAgents = [];
      for (let i = 0; i < needed; i++) {
        const randomRoad = roadTiles[Math.floor(Math.random() * roadTiles.length)];
        newAgents.push({
            id: Math.random(),
            x: randomRoad.x,
            z: randomRoad.z
        });
      }
      setAgents(prev => [...prev, ...newAgents]);
    }
    
    // If roads drop below 10, remove agents to reset
    if (roadTiles.length < 10 && agents.length > 0) {
        setAgents([]);
    }

  }, [roadTiles.length, agents.length]); // Check only when counts change to avoid spamming

  return (
    <group>
      {agents.map(a => (
        <MatatuAgent key={a.id} startX={a.x} startZ={a.z} />
      ))}
    </group>
  );
};
