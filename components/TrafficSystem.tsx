
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
    targetRotation: new THREE.Quaternion(),
  });

  // Initialize Position
  useEffect(() => {
     if(groupRef.current) {
        groupRef.current.position.set(startX * TILE_SIZE + TILE_SIZE/2, 0, startZ * TILE_SIZE + TILE_SIZE/2);
     }
  }, [startX, startZ]);

  useFrame((_state3d, delta) => {
    if (!groupRef.current) return;
    
    const s = state.current;
    
    // Smooth Rotation constantly
    groupRef.current.quaternion.slerp(s.targetRotation, delta * 5);

    // Movement Logic
    if (s.isMoving) {
      s.progress += (MATATU_SPEED * delta) / TILE_SIZE; 
      
      if (s.progress >= 1) {
        // Arrived
        s.currentX = s.targetX;
        s.currentZ = s.targetZ;
        s.progress = 0;
        s.isMoving = false;
      } else {
        // Interpolate Position
        const startPos = new THREE.Vector3(s.currentX * TILE_SIZE + TILE_SIZE/2, 0, s.currentZ * TILE_SIZE + TILE_SIZE/2);
        const endPos = new THREE.Vector3(s.targetX * TILE_SIZE + TILE_SIZE/2, 0, s.targetZ * TILE_SIZE + TILE_SIZE/2);
        
        groupRef.current.position.lerpVectors(startPos, endPos, s.progress);
      }
    } else {
      // AI Decision Logic
      const tiles = useCityStore.getState().tiles as Record<string, TileData>;
      
      // Check if road still exists
      if (tiles[`${s.currentX},${s.currentZ}`]?.type !== 'road') {
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

      // Filter out backtracking if possible (unless dead end)
      // Note: This needs history tracking to be perfect, but simple heuristic: don't go back to targetX/targetZ 
      // is not applicable here because targetX IS currentX now.
      
      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        s.targetX = next.x;
        s.targetZ = next.z;
        s.isMoving = true;

        // Calculate Target Rotation
        const currentWorldPos = new THREE.Vector3(s.currentX * TILE_SIZE + TILE_SIZE/2, 0, s.currentZ * TILE_SIZE + TILE_SIZE/2);
        const nextWorldPos = new THREE.Vector3(next.x * TILE_SIZE + TILE_SIZE/2, 0, next.z * TILE_SIZE + TILE_SIZE/2);
        
        const dummyMatrix = new THREE.Matrix4();
        dummyMatrix.lookAt(currentWorldPos, nextWorldPos, new THREE.Vector3(0, 1, 0));
        s.targetRotation.setFromRotationMatrix(dummyMatrix);
      }
    }
  });

  return <MatatuMesh ref={groupRef} />;
};

export const TrafficSystem: React.FC = () => {
  const tiles = useCityStore((state) => state.tiles) as Record<string, TileData>;
  
  // Agents are managed by state to ensure React diffing works, but their positions are refs.
  const [agents, setAgents] = useState<{id: string, x: number, z: number}[]>([]);

  const roadTiles = useMemo(() => {
    return Object.values(tiles).filter(t => t.type === 'road');
  }, [tiles]);

  useEffect(() => {
    // Dynamic Traffic Density:
    // Spawn 1 car for every 4 road tiles, capped at 50 to save FPS
    const targetCount = Math.min(50, Math.floor(roadTiles.length / 4));
    
    if (agents.length < targetCount) {
        // Spawn more
        const needed = targetCount - agents.length;
        const newAgents = [];
        for (let i = 0; i < needed; i++) {
             const randomRoad = roadTiles[Math.floor(Math.random() * roadTiles.length)];
             if (randomRoad) {
                newAgents.push({
                    id: `${Date.now()}-${Math.random()}`,
                    x: randomRoad.x,
                    z: randomRoad.z
                });
             }
        }
        if (newAgents.length > 0) {
             setAgents(prev => [...prev, ...newAgents]);
        }
    } else if (agents.length > targetCount + 5) {
        // Despawn if way too many (e.g. roads deleted)
        setAgents(prev => prev.slice(0, targetCount));
    }

  }, [roadTiles.length, agents.length]); 

  return (
    <group>
      {agents.map(a => (
        <MatatuAgent key={a.id} startX={a.x} startZ={a.z} />
      ))}
    </group>
  );
};
