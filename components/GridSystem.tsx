
import React, { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useCityStore } from '../store/useCityStore';
import { BuildingRenderer } from './BuildingRenderer';

// Grid Configuration
export const TILE_SIZE = 4; // Physical size of one tile in the world
export const GRID_SIZE = 20; // Number of tiles along one axis (20x20 grid)

export const GridSystem: React.FC = () => {
  const activeTool = useCityStore((state) => state.activeTool);
  const addBuilding = useCityStore((state) => state.addBuilding);
  const removeBuilding = useCityStore((state) => state.removeBuilding);

  // Use State for rendering the Ghost Building
  const [hoveredTile, setHoveredTile] = useState<{ x: number, z: number } | null>(null);

  // Handle Mouse Movement (Hover Effect)
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // Stop raycast from hitting the ground plane below
    
    // Convert world intersection point to grid indices
    const xIndex = Math.floor(e.point.x / TILE_SIZE);
    const zIndex = Math.floor(e.point.z / TILE_SIZE);

    // Grid Bounds Calculation (Centered at 0,0)
    // For a size of 20, indices go from -10 to 9
    const halfGrid = GRID_SIZE / 2;
    
    const isValidTile = 
      xIndex >= -halfGrid && 
      xIndex < halfGrid && 
      zIndex >= -halfGrid && 
      zIndex < halfGrid;

    if (isValidTile) {
       // Only update state if tile changed to avoid React trashing
       if (!hoveredTile || hoveredTile.x !== xIndex || hoveredTile.z !== zIndex) {
           setHoveredTile({ x: xIndex, z: zIndex });
       }
    } else {
       if (hoveredTile) setHoveredTile(null);
    }
  };

  // Handle Click (Placement/Selection)
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    if (hoveredTile) {
      if (activeTool === 'bulldozer') {
        removeBuilding(hoveredTile.x, hoveredTile.z);
      } else if (activeTool) {
        addBuilding(hoveredTile.x, hoveredTile.z, activeTool);
      }
    }
  };

  const handlePointerLeave = () => {
    setHoveredTile(null);
  };

  return (
    <group>
      {/* Visual Grid Lines */}
      {/* Size is Total Width, Divisions is Number of Tiles */}
      <gridHelper 
        args={[GRID_SIZE * TILE_SIZE, GRID_SIZE, 0xffffff, 0xffffff]} 
        position={[0, 0.02, 0]}
      >
        <meshBasicMaterial attach="material" color="white" transparent opacity={0.15} />
      </gridHelper>

      {/* Invisible Interaction Plane */}
      {/* This sits exactly on top of the grid to capture mouse events efficiently */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* GHOST PREVIEW / CURSOR */}
      {hoveredTile && (
        <group position={[
            hoveredTile.x * TILE_SIZE + TILE_SIZE / 2,
            0.1,
            hoveredTile.z * TILE_SIZE + TILE_SIZE / 2
        ]}>
            {activeTool && activeTool !== 'bulldozer' ? (
                // 3D Ghost Building
                <BuildingRenderer type={activeTool} isGhost />
            ) : (
                // Simple Cursor for Inspection / Bulldozer
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
                    <meshBasicMaterial 
                        color={activeTool === 'bulldozer' ? '#ef4444' : 'white'} 
                        transparent 
                        opacity={0.3} 
                        side={THREE.DoubleSide} 
                    />
                </mesh>
            )}
        </group>
      )}
    </group>
  );
};
