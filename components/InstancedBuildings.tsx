
import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useCityStore, TileData } from '../store/useCityStore';
import { TILE_SIZE } from './GridSystem';

// Reusable Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 4);

// Reusable Materials
const whiteMat = new THREE.MeshStandardMaterial({ color: "#f8fafc" });
const greyMat = new THREE.MeshStandardMaterial({ color: "#334155" });
const darkGreyMat = new THREE.MeshStandardMaterial({ color: "#475569" });
const greenMat = new THREE.MeshStandardMaterial({ color: "#16a34a" });
const redMat = new THREE.MeshStandardMaterial({ color: "#dc2626" });
const creamMat = new THREE.MeshStandardMaterial({ color: "#fef3c7" });
const brownMat = new THREE.MeshStandardMaterial({ color: "#78350f" });
const trunkMat = new THREE.MeshStandardMaterial({ color: "#451a03" });
const canopyMat = new THREE.MeshStandardMaterial({ color: "#3f6212" });

export const InstancedBuildings: React.FC = () => {
  // Explicitly cast tiles to Record<string, TileData> to fix inference issues where tiles are treated as unknown
  const tiles = useCityStore((state) => state.tiles) as Record<string, TileData>;
  
  // Group tiles by type for instancing
  const { houses, kiosks, apartments, trees } = useMemo(() => {
    const groups: Record<string, TileData[]> = {
      houses: [],
      kiosks: [],
      apartments: [],
      trees: []
    };
    
    Object.values(tiles).forEach((tile) => {
      if (tile.type === 'runda_house') groups.houses.push(tile);
      else if (tile.type === 'kiosk') groups.kiosks.push(tile);
      else if (tile.type === 'apartment') groups.apartments.push(tile);
      else if (tile.type === 'acacia') groups.trees.push(tile);
    });

    return groups;
  }, [tiles]);

  return (
    <group>
      {/* --- RUNDA HOUSES --- */}
      {/* Body: White Box */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.5, 2, 2.5]}
          />
        ))}
      </Instances>
      {/* Roof: Grey Cone */}
      <Instances range={1000} geometry={coneGeo} material={greyMat}>
        {houses.map((t) => (
          <Instance
            key={`house-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.5, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.2, 1.5, 2.2]}
            rotation={[0, Math.PI / 4, 0]}
          />
        ))}
      </Instances>
       {/* Door: Dark Grey Box */}
       <Instances range={1000} geometry={boxGeo} material={darkGreyMat}>
        {houses.map((t) => (
          <Instance
            key={`house-door-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.5, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.3]}
            scale={[0.6, 1, 0.1]}
          />
        ))}
      </Instances>


      {/* --- KIOSKS --- */}
      {/* Body: Green Box */}
      <Instances range={1000} geometry={boxGeo} material={greenMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.75, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.5, 1.5, 1.5]}
          />
        ))}
      </Instances>
      {/* Stripe: Red Box */}
      <Instances range={1000} geometry={boxGeo} material={redMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-stripe-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.55, 0.3, 1.55]}
          />
        ))}
      </Instances>


      {/* --- APARTMENTS --- */}
      {/* Body: Cream Box */}
      <Instances range={1000} geometry={boxGeo} material={creamMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 3, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.8, 6, 2.8]}
          />
        ))}
      </Instances>
      {/* Roof Edge: Brown Box */}
      <Instances range={1000} geometry={boxGeo} material={brownMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 6.1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3, 0.2, 3]}
          />
        ))}
      </Instances>


      {/* --- TREES --- */}
      {/* Trunk: Brown Cylinder */}
      <Instances range={1000} geometry={cylinderGeo} material={trunkMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-trunk-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[0.15, 2, 0.15]}
          />
        ))}
      </Instances>
      {/* Canopy: Green Cylinder */}
      <Instances range={1000} geometry={cylinderGeo} material={canopyMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-canopy-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.2, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.8, 0.8, 1.8]}
          />
        ))}
      </Instances>

    </group>
  );
};
