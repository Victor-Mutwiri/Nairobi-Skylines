import React, { useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for React 18 / TypeScript: Augment React.JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      gridHelper: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      mesh: any;
      group: any;
    }
  }
}

// Global augmentation as backup
declare global {
  namespace JSX {
    interface IntrinsicElements {
      gridHelper: any;
      planeGeometry: any;
      meshBasicMaterial: any;
      mesh: any;
      group: any;
    }
  }
}

// Grid Configuration
export const TILE_SIZE = 4; // Physical size of one tile in the world
export const GRID_SIZE = 20; // Number of tiles along one axis (20x20 grid)

export const GridSystem: React.FC = () => {
  const cursorRef = useRef<THREE.Mesh>(null);

  // Handle Mouse Movement (Hover Effect)
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation(); // Stop raycast from hitting the ground plane below
    
    if (!cursorRef.current) return;

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
      cursorRef.current.visible = true;
      // Snap to tile center
      cursorRef.current.position.set(
        xIndex * TILE_SIZE + TILE_SIZE / 2,
        0.1, // Slightly elevated to prevent z-fighting with grid/ground
        zIndex * TILE_SIZE + TILE_SIZE / 2
      );
    } else {
      cursorRef.current.visible = false;
    }
  };

  // Handle Click (Placement/Selection)
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    const xIndex = Math.floor(e.point.x / TILE_SIZE);
    const zIndex = Math.floor(e.point.z / TILE_SIZE);
    
    const halfGrid = GRID_SIZE / 2;
    const isValidTile = 
      xIndex >= -halfGrid && 
      xIndex < halfGrid && 
      zIndex >= -halfGrid && 
      zIndex < halfGrid;

    if (isValidTile) {
      console.log(`Grid Clicked: [${xIndex}, ${zIndex}]`);
    }
  };

  const handlePointerLeave = () => {
    if (cursorRef.current) {
      cursorRef.current.visible = false;
    }
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

      {/* Ghost Cursor (The Highlight) */}
      <mesh 
        ref={cursorRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        visible={false}
      >
        <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
        <meshBasicMaterial color="white" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};