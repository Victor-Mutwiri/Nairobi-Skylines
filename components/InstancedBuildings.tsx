
import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useCityStore, TileData } from '../store/useCityStore';
import { TILE_SIZE } from './GridSystem';

// Reusable Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 4);

// Reusable Material (White base to allow tinting via Instance color prop)
const whiteMat = new THREE.MeshStandardMaterial({ color: "#ffffff" });
const windowMat = new THREE.MeshBasicMaterial({ color: "#FCD116" }); // Emissive Yellow

export const InstancedBuildings: React.FC = () => {
  // Explicitly cast tiles to Record<string, TileData> to fix inference issues
  const tiles = useCityStore((state) => state.tiles) as Record<string, TileData>;
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);
  const powerCapacity = useCityStore((state) => state.powerCapacity);
  const powerDemand = useCityStore((state) => state.powerDemand);
  const isNight = useCityStore((state) => state.isNight);

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

  // Overlay Logic Helper
  // If overlay is ON:
  // - Unpowered residential -> RED (Flash effect handled via color prop if possible, else just static red)
  // - Powered residential -> Normal color
  // - Other stuff -> Gray
  const isPowered = powerCapacity >= powerDemand;
  const overlayGray = '#64748b'; // Slate 500

  const getColor = (defaultColor: string, isResidential: boolean) => {
    if (!isPowerOverlay) return defaultColor;
    
    if (isResidential) {
        if (!isPowered) return '#dc2626'; // Red warning
        return defaultColor; // Normal color if powered
    }
    
    return overlayGray; // Gray out everything else
  };

  // Window Logic: Visible only at night and if powered
  const showWindows = isNight && isPowered;

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
            color={getColor("#f8fafc", true)}
          />
        ))}
      </Instances>
      {/* Roof: Grey Cone */}
      <Instances range={1000} geometry={coneGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.5, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.2, 1.5, 2.2]}
            rotation={[0, Math.PI / 4, 0]}
            color={getColor("#334155", true)}
          />
        ))}
      </Instances>
       {/* Door: Dark Grey Box */}
       <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-door-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.5, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.3]}
            scale={[0.6, 1, 0.1]}
            color={getColor("#475569", true)}
          />
        ))}
      </Instances>
      
      {/* House Windows (Lit at Night) */}
      {showWindows && (
        <Instances range={1000} geometry={boxGeo} material={windowMat}>
            {houses.map((t) => (
            <Instance
                key={`house-win-${t.x}-${t.z}`}
                position={[t.x * TILE_SIZE + TILE_SIZE / 2 + 0.5, 1.2, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.3]}
                scale={[0.8, 0.8, 0.1]}
            />
            ))}
        </Instances>
      )}


      {/* --- KIOSKS --- */}
      {/* Body: Green Box */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.75, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.5, 1.5, 1.5]}
            color={getColor("#16a34a", false)}
          />
        ))}
      </Instances>
      {/* Stripe: Red Box */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-stripe-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.55, 0.3, 1.55]}
            color={getColor("#dc2626", false)}
          />
        ))}
      </Instances>


      {/* --- APARTMENTS --- */}
      {/* Body: Cream Box */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 3, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.8, 6, 2.8]}
            color={getColor("#fef3c7", true)}
          />
        ))}
      </Instances>
      {/* Roof Edge: Brown Box */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 6.1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3, 0.2, 3]}
            color={getColor("#78350f", true)}
          />
        ))}
      </Instances>
      
      {/* Apartment Windows (Lit at Night) */}
      {showWindows && (
        <Instances range={3000} geometry={boxGeo} material={windowMat}>
            {apartments.flatMap((t) => [
                // Front Row Top
                <Instance
                    key={`apt-win-1-${t.x}-${t.z}`}
                    position={[t.x * TILE_SIZE + TILE_SIZE / 2, 5, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.45]}
                    scale={[2, 0.8, 0.1]}
                />,
                // Front Row Mid
                <Instance
                    key={`apt-win-2-${t.x}-${t.z}`}
                    position={[t.x * TILE_SIZE + TILE_SIZE / 2, 3, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.45]}
                    scale={[2, 0.8, 0.1]}
                />,
                // Front Row Low
                <Instance
                    key={`apt-win-3-${t.x}-${t.z}`}
                    position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.45]}
                    scale={[2, 0.8, 0.1]}
                />
            ])}
        </Instances>
      )}


      {/* --- TREES --- */}
      {/* Trunk: Brown Cylinder */}
      <Instances range={1000} geometry={cylinderGeo} material={whiteMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-trunk-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[0.15, 2, 0.15]}
            color={getColor("#451a03", false)}
          />
        ))}
      </Instances>
      {/* Canopy: Green Cylinder */}
      <Instances range={1000} geometry={cylinderGeo} material={whiteMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-canopy-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.2, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.8, 0.8, 1.8]}
            color={getColor("#3f6212", false)}
          />
        ))}
      </Instances>

    </group>
  );
};
