import React, { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useCityStore, TileData, BUILDING_COSTS } from '../store/useCityStore';
import { TILE_SIZE } from './GridSystem';

// Reusable Geometries
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 4);

// Road Geometries
const roadBaseGeo = new THREE.BoxGeometry(4, 0.1, 4);
const roadHubGeo = new THREE.PlaneGeometry(0.6, 0.6);
// Road Line (Vertical Strip): 0.2 wide, 2 long.
const roadLineGeo = new THREE.PlaneGeometry(0.2, 2);

// Reusable Material (White base to allow tinting via Instance color prop)
const whiteMat = new THREE.MeshStandardMaterial({ color: "#ffffff" });

export const InstancedBuildings: React.FC = () => {
  // Explicitly cast tiles to Record<string, TileData> to fix inference issues
  const tiles = useCityStore((state) => state.tiles) as Record<string, TileData>;
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);
  const powerCapacity = useCityStore((state) => state.powerCapacity);
  const powerDemand = useCityStore((state) => state.powerDemand);
  // Removed isNight hook

  // Group tiles by type for instancing
  const { houses, kiosks, apartments, trees, roads, expressways } = useMemo(() => {
    const groups = {
      houses: [] as TileData[],
      kiosks: [] as TileData[],
      apartments: [] as TileData[],
      trees: [] as TileData[],
      roads: [] as TileData[],
      expressways: [] as TileData[]
    };
    
    Object.values(tiles).forEach((tile) => {
      if (tile.type === 'runda_house') groups.houses.push(tile);
      else if (tile.type === 'kiosk') groups.kiosks.push(tile);
      else if (tile.type === 'apartment') groups.apartments.push(tile);
      else if (tile.type === 'acacia') groups.trees.push(tile);
      else if (tile.type === 'road') groups.roads.push(tile);
      else if (tile.type === 'expressway_pillar') groups.expressways.push(tile);
    });

    return groups;
  }, [tiles]);

  // Road Adjacency & Instancing Calculation
  const { roadHubs, roadLines } = useMemo(() => {
    const hubs: { x: number, z: number }[] = [];
    // Stores position and rotation for every line marking
    const lines: { x: number, z: number, rotation: [number, number, number] }[] = [];
    
    // Create a Set for fast O(1) lookups of road positions
    const roadSet = new Set(roads.map(t => `${t.x},${t.z}`));

    roads.forEach(t => {
       const n = roadSet.has(`${t.x},${t.z-1}`);
       const s = roadSet.has(`${t.x},${t.z+1}`);
       const e = roadSet.has(`${t.x+1},${t.z}`);
       const w = roadSet.has(`${t.x-1},${t.z}`);
       const hasConnection = n || s || e || w;
       
       const cx = t.x * TILE_SIZE + TILE_SIZE/2;
       const cz = t.z * TILE_SIZE + TILE_SIZE/2;
       
       if (hasConnection) {
          // Hubs raised to 0.13 to clear road base (0.10)
          hubs.push({ x: cx, z: cz });
          
          // Lines raised to 0.14
          if (n) lines.push({ x: cx, z: cz - 1, rotation: [-Math.PI/2, 0, 0] });
          if (s) lines.push({ x: cx, z: cz + 1, rotation: [-Math.PI/2, 0, 0] });
          if (e) lines.push({ x: cx + 1, z: cz, rotation: [-Math.PI/2, 0, Math.PI/2] });
          if (w) lines.push({ x: cx - 1, z: cz, rotation: [-Math.PI/2, 0, Math.PI/2] });

       } else {
          // Isolated road
          lines.push({ x: cx, z: cz, rotation: [-Math.PI/2, 0, 0] });
       }
    });

    return { roadHubs: hubs, roadLines: lines };
  }, [roads]);

  // Overlay Logic Helper
  const isGlobalPowerSufficient = powerCapacity >= powerDemand;
  const overlayGray = '#64748b'; // Slate 500

  const getColor = (defaultColor: string, tile: TileData) => {
    if (!isPowerOverlay) return defaultColor;
    
    const config = BUILDING_COSTS[tile.type];
    if (!config) return overlayGray;

    const requiresPower = !!config.powerConsumption;
    
    // 1. Power Check: Needs power + Global Capacity + Local Connection
    if (requiresPower) {
         // Default to true if undefined (newly placed)
         const isGridConnected = tile.isPowered !== false; 
         
         if (!isGlobalPowerSufficient || !isGridConnected) {
             return '#dc2626'; // RED: Unpowered
         }
    }
    
    // 2. Road Check: Needs road + has access
    // Trees don't need roads
    if (tile.type !== 'acacia' && tile.type !== 'road' && tile.type !== 'expressway_pillar' && tile.hasRoadAccess === false) {
         return '#f97316'; // ORANGE: No Road Access
    }

    // 3. Functional: Return normal color (or slightly dimmed)
    if (requiresPower || tile.type === 'road' || tile.type === 'expressway_pillar' || config.population) {
        return defaultColor; 
    }
    
    return overlayGray; 
  };

  const roadColor = (t: TileData) => getColor("#334155", t);

  return (
    <group>
      {/* --- ROADS --- */}
      <Instances range={1000} geometry={roadBaseGeo} material={whiteMat}>
        {roads.map((t) => (
           <Instance 
             key={`road-base-${t.x}-${t.z}`}
             position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.05, t.z * TILE_SIZE + TILE_SIZE / 2]}
             color={roadColor(t)}
           />
        ))}
      </Instances>
      
      <Instances range={1000} geometry={roadHubGeo} material={whiteMat}>
         {roadHubs.map((h, i) => (
            <Instance 
              key={`road-hub-${i}`}
              position={[h.x, 0.13, h.z]}
              rotation={[-Math.PI/2, 0, 0]}
              color="#fcd116"
            />
         ))}
      </Instances>

      <Instances range={4000} geometry={roadLineGeo} material={whiteMat}>
         {roadLines.map((l, i) => (
            <Instance 
              key={`road-line-${i}`}
              position={[l.x, 0.14, l.z]}
              rotation={l.rotation as any}
              color="#fcd116"
            />
         ))}
      </Instances>

      {/* --- EXPRESSWAY PILLARS --- */}
      <Instances range={50} geometry={boxGeo} material={whiteMat}>
        {expressways.map((t) => (
           <Instance 
             key={`exp-pillar-${t.x}-${t.z}`}
             position={[t.x * TILE_SIZE + TILE_SIZE / 2, 4, t.z * TILE_SIZE + TILE_SIZE / 2]}
             scale={[1.5, 8, 1.5]}
             color={getColor("#94a3b8", t)}
           />
        ))}
      </Instances>
       <Instances range={50} geometry={boxGeo} material={whiteMat}>
        {expressways.map((t) => (
           <Instance 
             key={`exp-top-${t.x}-${t.z}`}
             position={[t.x * TILE_SIZE + TILE_SIZE / 2, 8, t.z * TILE_SIZE + TILE_SIZE / 2]}
             scale={[6, 0.2, 3]} // Wide T-beam
             color={getColor("#334155", t)}
           />
        ))}
      </Instances>
      <Instances range={50} geometry={roadLineGeo} material={whiteMat}>
        {expressways.map((t) => (
           <Instance 
             key={`exp-line-${t.x}-${t.z}`}
             position={[t.x * TILE_SIZE + TILE_SIZE / 2, 8.11, t.z * TILE_SIZE + TILE_SIZE / 2]}
             rotation={[-Math.PI/2, 0, Math.PI/2]} // Horizontal line
             color="#fcd116"
           />
        ))}
      </Instances>


      {/* --- RUNDA HOUSES --- */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.5, 2, 2.5]}
            color={getColor("#f8fafc", t)}
          />
        ))}
      </Instances>
      <Instances range={1000} geometry={coneGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.5, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.2, 1.5, 2.2]}
            rotation={[0, Math.PI / 4, 0]}
            color={getColor("#334155", t)}
          />
        ))}
      </Instances>
       <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-door-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.5, t.z * TILE_SIZE + TILE_SIZE / 2 + 1.3]}
            scale={[0.6, 1, 0.1]}
            color={getColor("#475569", t)}
          />
        ))}
      </Instances>
      
      {/* --- KIOSKS --- */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.75, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.5, 1.5, 1.5]}
            color={getColor("#16a34a", t)}
          />
        ))}
      </Instances>
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {kiosks.map((t) => (
          <Instance
            key={`kiosk-stripe-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.55, 0.3, 1.55]}
            color={getColor("#dc2626", t)}
          />
        ))}
      </Instances>


      {/* --- APARTMENTS --- */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 3, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.8, 6, 2.8]}
            color={getColor("#fef3c7", t)}
          />
        ))}
      </Instances>
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 6.1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3, 0.2, 3]}
            color={getColor("#78350f", t)}
          />
        ))}
      </Instances>
      
      {/* --- TREES --- */}
      <Instances range={1000} geometry={cylinderGeo} material={whiteMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-trunk-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[0.15, 2, 0.15]}
            color={getColor("#451a03", t)}
          />
        ))}
      </Instances>
      <Instances range={1000} geometry={cylinderGeo} material={whiteMat}>
        {trees.map((t) => (
          <Instance
            key={`tree-canopy-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.2, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[1.8, 0.8, 1.8]}
            color={getColor("#3f6212", t)}
          />
        ))}
      </Instances>

    </group>
  );
};