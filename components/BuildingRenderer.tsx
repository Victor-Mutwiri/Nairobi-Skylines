
import React from 'react';
import { BuildingType, useCityStore } from '../store/useCityStore';
import * as THREE from 'three';

export interface AdjacencyInfo {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

interface BuildingRendererProps {
  type: BuildingType;
  position?: [number, number, number];
  rotation?: number; // 0, 1, 2, 3 (multipliers of 90 degrees)
  adjacencies?: AdjacencyInfo;
  isOverlay?: boolean; // Prop to trigger grayscale mode
  isGhost?: boolean; // Prop for placement preview
}

export const BuildingRenderer: React.FC<BuildingRendererProps> = React.memo(({ 
  type, 
  position = [0, 0, 0], 
  rotation = 0,
  adjacencies = { north: false, south: false, east: false, west: false },
  isOverlay = false,
  isGhost = false
}) => {
  const rotationY = rotation * (Math.PI / 2);
  const isNight = useCityStore(state => state.isNight);

  // Helper to handle Material Properties for Ghost/Overlay/Normal modes
  const getMatStyle = (color: string, isUtility: boolean = false, emissiveIntensity: number = 0) => {
      const props: any = {};
      
      // GHOST MODE: Transparent Yellow/Holographic
      if (isGhost) {
          props.color = "#FCD116"; // Nairobi Yellow
          props.transparent = true;
          props.opacity = 0.6;
          props.emissive = "#FCD116";
          props.emissiveIntensity = 0.5;
          return props;
      }

      // OVERLAY MODE: Grayscale unless utility
      if (isOverlay) {
         if (isUtility) {
             props.color = color;
             props.emissive = color;
             props.emissiveIntensity = emissiveIntensity || 0.5;
         } else {
             props.color = "#64748b"; // Slate
             props.emissive = "#000000";
             props.emissiveIntensity = 0;
         }
         return props;
      }

      // NORMAL MODE
      props.color = color;
      
      // Night Time Emissive Logic
      if (emissiveIntensity > 0) {
         // If it has natural emission (lights), use it
         // Reduce intensity slightly if it's night to make it pop, or 0 if day (unless always on)
         const effectiveIntensity = isNight ? emissiveIntensity : (isUtility ? emissiveIntensity : 0);
         props.emissive = color;
         props.emissiveIntensity = effectiveIntensity;
      } else {
          // Standard ambient reflection
          props.emissive = "#000000";
          props.emissiveIntensity = 0;
      }

      return props;
  };
  
  switch (type) {
    // --- INSTANCED TYPES (Added for Ghost Preview) ---
    case 'road':
        return (
             <group position={position} rotation={[0, rotationY, 0]}>
                <mesh position={[0, 0.05, 0]}>
                   <boxGeometry args={[4, 0.1, 4]} />
                   <meshStandardMaterial {...getMatStyle("#334155")} />
                </mesh>
             </group>
        );
    case 'runda_house':
        return (
            <group position={position} rotation={[0, rotationY, 0]}>
                <mesh position={[0, 1, 0]}>
                   <boxGeometry args={[2.5, 2, 2.5]} />
                   <meshStandardMaterial {...getMatStyle("#f8fafc")} />
                </mesh>
                <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]}>
                   <coneGeometry args={[2.2, 1.5, 4]} />
                   <meshStandardMaterial {...getMatStyle("#334155")} />
                </mesh>
            </group>
        );
    case 'kiosk':
         return (
             <group position={position} rotation={[0, rotationY, 0]}>
                 <mesh position={[0, 0.75, 0]}>
                    <boxGeometry args={[1.5, 1.5, 1.5]} />
                    <meshStandardMaterial {...getMatStyle("#16a34a")} />
                 </mesh>
                 <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[1.55, 0.3, 1.55]} />
                    <meshStandardMaterial {...getMatStyle("#dc2626")} />
                 </mesh>
             </group>
         );
    case 'apartment':
        return (
            <group position={position} rotation={[0, rotationY, 0]}>
                <mesh position={[0, 3, 0]}>
                   <boxGeometry args={[2.8, 6, 2.8]} />
                   <meshStandardMaterial {...getMatStyle("#fef3c7")} />
                </mesh>
                <mesh position={[0, 6.1, 0]}>
                   <boxGeometry args={[3, 0.2, 3]} />
                   <meshStandardMaterial {...getMatStyle("#78350f")} />
                </mesh>
            </group>
        );
    case 'acacia':
        return (
             <group position={position} rotation={[0, rotationY, 0]}>
                <mesh position={[0, 1, 0]}>
                   <cylinderGeometry args={[0.15, 0.15, 2]} />
                   <meshStandardMaterial {...getMatStyle("#451a03")} />
                </mesh>
                <mesh position={[0, 2.2, 0]}>
                   <cylinderGeometry args={[1.8, 1.8, 0.8]} />
                   <meshStandardMaterial {...getMatStyle("#3f6212")} />
                </mesh>
             </group>
        );

    // --- UNIQUE TYPES ---
    case 'kicc':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.5, 1, 3.5]} />
              <meshStandardMaterial {...getMatStyle("#92400e")} />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[1, 1, 7, 16]} />
              <meshStandardMaterial {...getMatStyle("#b45309")} /> 
            </mesh>
            <mesh position={[0, 7.5, 0]} castShadow>
              <cylinderGeometry args={[1.8, 0.2, 0.2, 16]} />
              <meshStandardMaterial {...getMatStyle("#78350f")} />
            </mesh>
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
              <meshStandardMaterial {...getMatStyle("#475569", false, isNight ? 0.2 : 0)} />
            </mesh>
          </group>
        );
  
      case 'times_tower':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0.2, 5, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial {...getMatStyle("#94a3b8")} metalness={0.5} roughness={0.2} />
            </mesh>
            <mesh position={[-1, 5, 0]} castShadow>
              <boxGeometry args={[0.5, 10.5, 1.5]} />
              <meshStandardMaterial {...getMatStyle("#ffffff", false, isNight ? 0.8 : 0)} />
            </mesh>
          </group>
        );
  
      case 'jamia_mosque':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3, 3, 3]} />
              <meshStandardMaterial {...getMatStyle("#f1f5f9")} />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial {...getMatStyle("#15803d")} />
            </mesh>
            <mesh position={[1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial {...getMatStyle("#f1f5f9")} />
            </mesh>
            <mesh position={[-1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial {...getMatStyle("#f1f5f9")} />
            </mesh>
          </group>
        );
  
      case 'uhuru_park':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <boxGeometry args={[4, 0.2, 4]} />
              <meshStandardMaterial {...getMatStyle("#4d7c0f")} />
            </mesh>
            <mesh position={[0.5, 0.15, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[2, 2]} />
               <meshStandardMaterial {...getMatStyle("#0ea5e9")} metalness={0.1} roughness={0.1} />
            </mesh>
            <mesh position={[-1, 0.5, 1]}>
               <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
               <meshStandardMaterial {...getMatStyle("#3f6212")} />
            </mesh>
            <mesh position={[-1, 1, 1]}>
               <coneGeometry args={[0.5, 1, 8]} />
               <meshStandardMaterial {...getMatStyle("#3f6212")} />
            </mesh>
          </group>
        );

      case 'police_station':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 3, 2]} />
                <meshStandardMaterial {...getMatStyle("#f8fafc")} />
             </mesh>
             <mesh position={[0, 1.5, 1.05]}>
                <boxGeometry args={[3.1, 0.5, 0.1]} />
                <meshStandardMaterial {...getMatStyle("#2563eb")} />
             </mesh>
             <mesh position={[0, 2.5, 1.05]}>
                <boxGeometry args={[1, 0.5, 0.1]} />
                <meshStandardMaterial {...getMatStyle("#1e3a8a")} />
             </mesh>
             <mesh position={[-1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial {...getMatStyle("#dc2626", true, 0.8)} />
             </mesh>
             <mesh position={[1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial {...getMatStyle("#2563eb", true, 0.8)} />
             </mesh>
          </group>
        );

      case 'fire_station':
        return (
            <group position={position} rotation={[0, rotationY, 0]}>
                {/* Main Body */}
                <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3, 2.5, 3]} />
                    <meshStandardMaterial {...getMatStyle("#b91c1c", true)} />
                </mesh>
                {/* Garage Door */}
                <mesh position={[0, 1, 1.51]}>
                    <planeGeometry args={[2, 1.8]} />
                    <meshStandardMaterial {...getMatStyle("#4b5563", true)} />
                </mesh>
                {/* Siren */}
                <mesh position={[0, 2.6, 0]}>
                    <cylinderGeometry args={[0.3, 0.4, 0.4, 8]} />
                    <meshStandardMaterial {...getMatStyle("#ef4444", true, 1)} />
                </mesh>
                 <mesh position={[0, 2.8, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial {...getMatStyle("#fca5a5", true, 1)} />
                </mesh>
            </group>
        );

      case 'bar':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 2.5, 2.5]} />
                <meshStandardMaterial {...getMatStyle("#1e1b4b")} />
             </mesh>
             <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[2.6, 0.1, 2.6]} />
                <meshStandardMaterial {...getMatStyle("#d8b4fe", true, 1)} />
             </mesh>
             <mesh position={[0, 0.8, 1.3]}>
                <boxGeometry args={[1, 1.6, 0.1]} />
                <meshStandardMaterial {...getMatStyle("#000000")} />
             </mesh>
             <mesh position={[0, 1.7, 1.35]}>
                <boxGeometry args={[1.2, 0.1, 0.1]} />
                <meshStandardMaterial {...getMatStyle("#f0abfc", true, 2)} />
             </mesh>
          </group>
        );

      case 'power_plant':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             {/* Base Platform - Industrial Dark */}
             <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.8, 1, 3.8]} />
                <meshStandardMaterial {...getMatStyle("#374151", true)} />
             </mesh>
             {/* Main Reactor Building */}
             <mesh position={[-1, 2, -1]} castShadow>
                <boxGeometry args={[1.5, 3, 1.5]} />
                <meshStandardMaterial {...getMatStyle("#4b5563", true)} />
             </mesh>
             {/* Smokestack 1 */}
             <mesh position={[1, 3, 1]}>
                <cylinderGeometry args={[0.4, 0.6, 6, 16]} />
                <meshStandardMaterial {...getMatStyle("#9ca3af", true)} />
             </mesh>
             {/* Smokestack 1 Rim */}
             <mesh position={[1, 5.8, 1]}>
                <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
                <meshStandardMaterial {...getMatStyle("#dc2626", true, 0.5)} />
             </mesh>
             {/* Smokestack 2 */}
             <mesh position={[1, 2.5, -1]}>
                 <cylinderGeometry args={[0.3, 0.5, 5, 16]} />
                 <meshStandardMaterial {...getMatStyle("#9ca3af", true)} />
             </mesh>
             {/* Pipes */}
             <mesh position={[0, 1.5, 0]} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.2, 0.2, 3]} />
                 <meshStandardMaterial {...getMatStyle("#fbbf24", true)} />
             </mesh>
          </group>
        );

      case 'dumpsite':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            {/* Ground (Dirt/Mud) */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
               <boxGeometry args={[3.8, 0.2, 3.8]} />
               <meshStandardMaterial {...getMatStyle("#57534e", true)} />
            </mesh>
            {/* Trash Pile 1 */}
            <mesh position={[-0.5, 0.8, -0.5]} castShadow>
               <coneGeometry args={[1.5, 1.5, 6]} />
               <meshStandardMaterial {...getMatStyle("#44403c", true)} flatShading />
            </mesh>
            {/* Trash Pile 2 */}
            <mesh position={[1, 0.6, 1]} castShadow>
               <coneGeometry args={[1, 1.2, 5]} />
               <meshStandardMaterial {...getMatStyle("#78716c", true)} flatShading />
            </mesh>
            {/* Debris Bits */}
            <mesh position={[0, 0.3, 1.5]}>
               <boxGeometry args={[0.5, 0.5, 0.5]} />
               <meshStandardMaterial {...getMatStyle("#3b82f6", true)} />
            </mesh>
            <mesh position={[1.2, 0.3, -1]}>
               <boxGeometry args={[0.4, 0.4, 0.4]} />
               <meshStandardMaterial {...getMatStyle("#ef4444", true)} />
            </mesh>
            {/* Fence Posts */}
            {[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.5, pos[1]]}>
                    <boxGeometry args={[0.2, 1, 0.2]} />
                    <meshStandardMaterial {...getMatStyle("#713f12", true)} />
                </mesh>
            ))}
          </group>
        );

    case 'informal_settlement':
        return (
            <group position={position} rotation={[0, rotationY, 0]}>
                {/* Mud Base */}
                <mesh position={[0, 0.05, 0]} receiveShadow>
                   <boxGeometry args={[3.8, 0.1, 3.8]} />
                   <meshStandardMaterial {...getMatStyle("#78350f")} />
                </mesh>
                
                {/* Shack 1 */}
                <mesh position={[-1, 0.5, -1]} castShadow rotation={[0, 0.1, 0]}>
                   <boxGeometry args={[1.5, 1, 1.5]} />
                   <meshStandardMaterial {...getMatStyle("#7f1d1d")} />
                </mesh>
                <mesh position={[-1, 1.05, -1]} rotation={[0, 0.1, 0.1]}>
                   <boxGeometry args={[1.6, 0.1, 1.6]} />
                   <meshStandardMaterial {...getMatStyle("#713f12")} />
                </mesh>

                {/* Shack 2 */}
                <mesh position={[1.2, 0.4, 0.8]} castShadow rotation={[0, -0.2, 0]}>
                   <boxGeometry args={[1.2, 0.8, 1.8]} />
                   <meshStandardMaterial {...getMatStyle("#374151")} />
                </mesh>
                <mesh position={[1.2, 0.85, 0.8]} rotation={[0, -0.2, -0.1]}>
                   <boxGeometry args={[1.3, 0.1, 2]} />
                   <meshStandardMaterial {...getMatStyle("#92400e")} />
                </mesh>

                {/* Shack 3 */}
                <mesh position={[0.5, 0.4, -1.2]} castShadow rotation={[0, 0.3, 0]}>
                   <boxGeometry args={[1, 0.8, 1]} />
                   <meshStandardMaterial {...getMatStyle("#57534e")} />
                </mesh>
            </group>
        );

    case 'nbk_tower':
        return (
          // Visuals offset to center over 2x2 grid. 
          // 2x2 means total width 8 units. Center is +2, +2 from anchor corner.
          // Since this renderer is placed at center of Anchor Tile (0,0 relative), we need to shift it x+2, z+2
          <group position={[position[0] + 2, position[1], position[2] + 2]} rotation={[0, rotationY, 0]}>
            {/* Main Tower Block */}
            <mesh position={[0, 6, 0]} castShadow receiveShadow>
              <boxGeometry args={[5, 12, 5]} />
              <meshStandardMaterial {...getMatStyle("#065f46")} metalness={0.6} roughness={0.1} />
            </mesh>
            {/* Gold Accents */}
            <mesh position={[2.6, 6, 0]}>
               <boxGeometry args={[0.2, 12, 1]} />
               <meshStandardMaterial {...getMatStyle("#fbbf24", true, isNight ? 0.3 : 0)} metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[-2.6, 6, 0]}>
               <boxGeometry args={[0.2, 12, 1]} />
               <meshStandardMaterial {...getMatStyle("#fbbf24", true, isNight ? 0.3 : 0)} metalness={1} roughness={0.2} />
            </mesh>
            {/* Top Crown */}
            <mesh position={[0, 12.5, 0]}>
               <boxGeometry args={[5.2, 1, 5.2]} />
               <meshStandardMaterial {...getMatStyle("#047857")} />
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 14, 0]}>
               <cylinderGeometry args={[0.1, 0.2, 3]} />
               <meshStandardMaterial {...getMatStyle("#ef4444", true, 1)} />
            </mesh>
          </group>
        );

    case 'reserved':
        // Filler tile, render nothing
        return null;

    default:
      return null;
  }
});
