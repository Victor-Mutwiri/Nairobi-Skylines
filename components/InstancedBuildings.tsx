
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

  // Group tiles by type for instancing
  const { houses, kiosks, apartments, trees, roads, expressways, plantations, factories, malls, offices } = useMemo(() => {
    const groups = {
      houses: [] as TileData[],
      kiosks: [] as TileData[],
      apartments: [] as TileData[],
      trees: [] as TileData[],
      roads: [] as TileData[],
      expressways: [] as TileData[],
      plantations: [] as TileData[],
      factories: [] as TileData[],
      malls: [] as TileData[],
      offices: [] as TileData[]
    };
    
    Object.values(tiles).forEach((tile) => {
      if (tile.type === 'runda_house') groups.houses.push(tile);
      else if (tile.type === 'kiosk') groups.kiosks.push(tile);
      else if (tile.type === 'apartment') groups.apartments.push(tile);
      else if (tile.type === 'acacia') groups.trees.push(tile);
      else if (tile.type === 'road') groups.roads.push(tile);
      else if (tile.type === 'expressway_pillar') groups.expressways.push(tile);
      else if (tile.type === 'plantation') groups.plantations.push(tile);
      else if (tile.type === 'factory') groups.factories.push(tile);
      else if (tile.type === 'mall') groups.malls.push(tile);
      else if (tile.type === 'office') groups.offices.push(tile);
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
    if (tile.type !== 'acacia' && tile.type !== 'road' && tile.type !== 'expressway_pillar' && tile.type !== 'plantation' && tile.hasRoadAccess === false) {
         return '#f97316'; // ORANGE: No Road Access
    }

    // 3. Functional: Return normal color (or slightly dimmed)
    if (requiresPower || tile.type === 'road' || tile.type === 'expressway_pillar' || config.population || tile.type === 'plantation') {
        return defaultColor; 
    }
    
    return overlayGray; 
  };

  const roadColor = (t: TileData) => getColor("#334155", t);

  // Helper to calculate rotation array [0, Y, 0]
  const getRot = (t: TileData, extraRad: number = 0): [number, number, number] => {
      return [0, (t.rotation || 0) * (Math.PI / 2) + extraRad, 0];
  }

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


      {/* --- RUNDA HOUSES (Upgraded Visuals) --- */}
      {/* Body */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.5, 2, 2.5]}
            rotation={getRot(t)}
            color={getColor("#f8fafc", t)}
          />
        ))}
      </Instances>
      {/* Roof */}
      <Instances range={1000} geometry={coneGeo} material={whiteMat}>
        {houses.map((t) => (
          <Instance
            key={`house-roof-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.5, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.2, 1.5, 2.2]}
            rotation={getRot(t, Math.PI/4)}
            color={getColor("#334155", t)}
          />
        ))}
      </Instances>
      {/* Porch */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {houses.map((t) => {
           // Calculate relative position based on rotation
           // Local position (0, 0.5, 1.3) -> World via simple trig or group rotation simulation
           const rot = (t.rotation || 0) * (Math.PI / 2);
           const zOff = Math.cos(rot) * 1.3;
           const xOff = Math.sin(rot) * 1.3;
           
           return (
            <Instance
                key={`house-porch-${t.x}-${t.z}`}
                position={[t.x * TILE_SIZE + TILE_SIZE / 2 + xOff, 0.5, t.z * TILE_SIZE + TILE_SIZE / 2 + zOff]}
                scale={[1.5, 0.2, 1]}
                rotation={[0, rot, 0]}
                color={getColor("#cbd5e1", t)}
            />
        )})}
      </Instances>
      {/* Chimney */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
         {houses.map((t) => (
            <Instance 
                key={`house-chim-${t.x}-${t.z}`}
                position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2.5, t.z * TILE_SIZE + TILE_SIZE / 2]}
                scale={[0.4, 1, 0.4]}
                // Offset chimney slightly from center
                color={getColor("#94a3b8", t)}
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
            rotation={getRot(t)}
            color={getColor("#16a34a", t)}
          />
        ))}
      </Instances>
      {/* Awning (Rotated Box) */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {kiosks.map((t) => {
           const rot = (t.rotation || 0) * (Math.PI / 2);
           const zOff = Math.cos(rot) * 0.8;
           const xOff = Math.sin(rot) * 0.8;
           return (
              <Instance
                key={`kiosk-awn-${t.x}-${t.z}`}
                position={[t.x * TILE_SIZE + TILE_SIZE / 2 + xOff, 1.5, t.z * TILE_SIZE + TILE_SIZE / 2 + zOff]}
                scale={[1.6, 0.1, 1]}
                rotation={[0.4, rot, 0]} // Slanted
                color={getColor("#dc2626", t)}
              />
        )})}
      </Instances>


      {/* --- APARTMENTS --- */}
      <Instances range={1000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => (
          <Instance
            key={`apt-body-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 3, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[2.8, 6, 2.8]}
            rotation={getRot(t)}
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
            rotation={getRot(t)}
            color={getColor("#78350f", t)}
          />
        ))}
      </Instances>
      {/* Balconies */}
      <Instances range={2000} geometry={boxGeo} material={whiteMat}>
        {apartments.map((t) => {
           const rot = (t.rotation || 0) * (Math.PI / 2);
           const zOff = Math.cos(rot) * 1.5;
           const xOff = Math.sin(rot) * 1.5;
           
           return (
            <React.Fragment key={`apt-balc-${t.x}-${t.z}`}>
                <Instance 
                     position={[t.x * TILE_SIZE + TILE_SIZE / 2 + xOff, 4, t.z * TILE_SIZE + TILE_SIZE / 2 + zOff]}
                     scale={[2, 0.2, 0.4]}
                     rotation={[0, rot, 0]}
                     color={getColor("#b45309", t)}
                />
                <Instance 
                     position={[t.x * TILE_SIZE + TILE_SIZE / 2 + xOff, 2, t.z * TILE_SIZE + TILE_SIZE / 2 + zOff]}
                     scale={[2, 0.2, 0.4]}
                     rotation={[0, rot, 0]}
                     color={getColor("#b45309", t)}
                />
            </React.Fragment>
        )})}
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

      {/* --- FACTORIES --- */}
      <Instances range={500} geometry={boxGeo} material={whiteMat}>
         {factories.map((t) => (
             <Instance 
                key={`fact-body-${t.x}-${t.z}`}
                position={[t.x * TILE_SIZE + TILE_SIZE / 2, 2, t.z * TILE_SIZE + TILE_SIZE / 2]}
                scale={[3.5, 4, 3.5]}
                rotation={getRot(t)}
                color={getColor("#475569", t)} // Slate 600
             />
         ))}
      </Instances>
      <Instances range={1000} geometry={cylinderGeo} material={whiteMat}>
         {factories.map((t) => (
             <React.Fragment key={`fact-stacks-${t.x}-${t.z}`}>
                <Instance 
                    position={[t.x * TILE_SIZE + TILE_SIZE / 2 - 1, 5, t.z * TILE_SIZE + TILE_SIZE / 2 - 1]}
                    scale={[0.4, 3, 0.4]}
                    color={getColor("#1e293b", t)} // Dark Slate
                />
                 <Instance 
                    position={[t.x * TILE_SIZE + TILE_SIZE / 2 + 0.5, 4.5, t.z * TILE_SIZE + TILE_SIZE / 2 + 0.5]}
                    scale={[0.4, 2, 0.4]}
                    color={getColor("#1e293b", t)} 
                />
             </React.Fragment>
         ))}
      </Instances>

      {/* --- PLANTATIONS (COFFEE FARM) --- */}
      <Instances range={500} geometry={boxGeo} material={whiteMat}>
        {plantations.map((t) => (
          <Instance
            key={`plant-ground-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 0.1, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3.8, 0.2, 3.8]}
            color={getColor("#57534e", t)} // Stone Gray (Dirt)
          />
        ))}
      </Instances>
      <Instances range={2000} geometry={coneGeo} material={whiteMat}>
        {plantations.map((t) => {
           // Create 4 bushes per tile
           const offsets = [[-1, -1], [1, 1], [-1, 1], [1, -1]];
           return (
             <React.Fragment key={`plant-bushes-${t.x}-${t.z}`}>
                {offsets.map((off, i) => (
                    <Instance 
                        key={i}
                        position={[t.x * TILE_SIZE + TILE_SIZE/2 + off[0], 0.8, t.z * TILE_SIZE + TILE_SIZE/2 + off[1]]}
                        scale={[1.2, 1.2, 1.2]}
                        color={getColor("#15803d", t)} // Green
                    />
                ))}
             </React.Fragment>
           );
        })}
      </Instances>

      {/* --- MALLS --- */}
      <Instances range={200} geometry={boxGeo} material={whiteMat}>
        {malls.map((t) => (
          <Instance
            key={`mall-body-${t.x}-${t.z}`}
            // Centered on anchor tile
            position-x={(t.x + 0.5) * TILE_SIZE}
            position-y={2.5}
            position-z={(t.z + 0.5) * TILE_SIZE}
            scale={[7, 5, 7]} 
            rotation={getRot(t)}
            color={getColor("#fca5a5", t)} // Pink/Salmon
          />
        ))}
      </Instances>
      <Instances range={200} geometry={boxGeo} material={whiteMat}>
         {malls.map((t) => {
           const rot = (t.rotation || 0) * (Math.PI / 2);
           // Offset atrium towards front
           const zOff = Math.cos(rot) * 3.6;
           const xOff = Math.sin(rot) * 3.6;

           return (
            <React.Fragment key={`mall-detail-${t.x}-${t.z}`}>
                {/* Roof */}
                 <Instance 
                    position-x={(t.x + 0.5) * TILE_SIZE}
                    position-y={5.1}
                    position-z={(t.z + 0.5) * TILE_SIZE}
                    scale={[6, 0.2, 6]}
                    rotation={getRot(t)}
                    color={getColor("#be123c", t)} // Dark Red
                />
                {/* Atrium Entrance */}
                <Instance 
                    position-x={(t.x + 0.5) * TILE_SIZE + xOff}
                    position-y={1.5}
                    position-z={(t.z + 0.5) * TILE_SIZE + zOff}
                    scale={[3, 3, 1]}
                    rotation={getRot(t)}
                    color={getColor("#bae6fd", t)} // Light Blue Glass
                />
            </React.Fragment>
         )})}
      </Instances>

      {/* --- OFFICES --- */}
      <Instances range={500} geometry={boxGeo} material={whiteMat}>
        {offices.map((t) => (
          <Instance
            key={`office-glass-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 6, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3, 12, 3]}
            rotation={getRot(t)}
            color={getColor("#3b82f6", t)} // Blue glass
          />
        ))}
      </Instances>
       <Instances range={500} geometry={boxGeo} material={whiteMat}>
        {offices.map((t) => (
          <Instance
            key={`office-frame-${t.x}-${t.z}`}
            position={[t.x * TILE_SIZE + TILE_SIZE / 2, 6, t.z * TILE_SIZE + TILE_SIZE / 2]}
            scale={[3.1, 12, 0.5]} // Decorative frame (rotated with building)
            rotation={getRot(t)}
            color={getColor("#1e293b", t)} // Dark frame
          />
        ))}
      </Instances>

    </group>
  );
};
