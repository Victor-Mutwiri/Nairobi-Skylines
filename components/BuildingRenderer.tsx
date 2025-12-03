
import React, { useMemo } from 'react';
import { BuildingType, useCityStore } from '../store/useCityStore';
import * as THREE from 'three';

// Fix for React 18 / TypeScript: Augment React.JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      sphereGeometry: any;
      planeGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

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
}

export const BuildingRenderer: React.FC<BuildingRendererProps> = React.memo(({ 
  type, 
  position = [0, 0, 0], 
  rotation = 0,
  adjacencies = { north: false, south: false, east: false, west: false },
  isOverlay = false
}) => {
  const rotationY = rotation * (Math.PI / 2);
  const isNight = useCityStore(state => state.isNight);

  const getMatColor = (color: string, isUtility: boolean = false) => {
      if (!isOverlay) return color;
      if (isUtility) return color; // Keep utilities colored in overlay for visibility
      return "#64748b"; // Grayscale/Slate for others
  };

  const getEmissive = (color: string, intensity: number, isUtility: boolean = false) => {
      if (!isOverlay) {
          // Normal mode: Emissive if night, or if utility (like Bar/Police lights)
          if (isUtility) return { emissive: color, emissiveIntensity: intensity };
          
          // Night time logic for general buildings
          if (isNight) return { emissive: color, emissiveIntensity: intensity * 0.5 };
          
          return { emissive: "#000000", emissiveIntensity: 0 };
      }
      // Overlay mode:
      if (isUtility) return { emissive: color, emissiveIntensity: intensity };
      return { emissive: "#000000", emissiveIntensity: 0 };
  };
  
  switch (type) {
    case 'road':
      const { north, south, east, west } = adjacencies;
      const hasConnection = north || south || east || west;
      const roadColor = getMatColor("#334155");
      const markColor = getMatColor("#fcd116");

      return (
        <group position={position}>
            {/* Base Asphalt */}
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <boxGeometry args={[4, 0.1, 4]} />
                <meshStandardMaterial color={roadColor} />
            </mesh>
            
            {/* Center Hub */}
            {hasConnection && (
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.6, 0.6]} />
                  <meshStandardMaterial color={markColor} />
              </mesh>
            )}

            {/* Lines */}
            {[
                { active: north, pos: [0, 0.11, -1], dims: [0.2, 2] },
                { active: south, pos: [0, 0.11, 1], dims: [0.2, 2] },
                { active: east, pos: [1, 0.11, 0], dims: [2, 0.2] },
                { active: west, pos: [-1, 0.11, 0], dims: [2, 0.2] },
            ].map((line, i) => line.active && (
                <mesh key={i} position={line.pos as any} rotation={[-Math.PI/2, 0, 0]}>
                    <planeGeometry args={line.dims as any} />
                    <meshStandardMaterial color={markColor} />
                </mesh>
            ))}

             {!hasConnection && (
               <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.2, 2]} />
                  <meshStandardMaterial color={markColor} opacity={0.5} transparent />
               </mesh>
            )}
        </group>
      );

    case 'kicc':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.5, 1, 3.5]} />
              <meshStandardMaterial color={getMatColor("#92400e")} />
            </mesh>
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[1, 1, 7, 16]} />
              <meshStandardMaterial color={getMatColor("#b45309")} /> 
            </mesh>
            <mesh position={[0, 7.5, 0]} castShadow>
              <cylinderGeometry args={[1.8, 0.2, 0.2, 16]} />
              <meshStandardMaterial color={getMatColor("#78350f")} />
            </mesh>
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
              {/* Helipad lights up slightly at night */}
              <meshStandardMaterial color={getMatColor("#475569")} {...getEmissive("#ffffff", isNight ? 0.2 : 0, false)} />
            </mesh>
          </group>
        );
  
      case 'times_tower':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0.2, 5, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial color={getMatColor("#94a3b8")} metalness={0.5} roughness={0.2} />
            </mesh>
            <mesh position={[-1, 5, 0]} castShadow>
              <boxGeometry args={[0.5, 10.5, 1.5]} />
              {/* Spine lights up white at night */}
              <meshStandardMaterial color={getMatColor("#ffffff")} {...getEmissive("#ffffff", isNight ? 0.8 : 0, false)} />
            </mesh>
          </group>
        );
  
      case 'jamia_mosque':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3, 3, 3]} />
              <meshStandardMaterial color={getMatColor("#f1f5f9")} />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={getMatColor("#15803d")} />
            </mesh>
            <mesh position={[1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial color={getMatColor("#f1f5f9")} />
            </mesh>
            <mesh position={[-1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial color={getMatColor("#f1f5f9")} />
            </mesh>
          </group>
        );
  
      case 'uhuru_park':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <boxGeometry args={[4, 0.2, 4]} />
              <meshStandardMaterial color={getMatColor("#4d7c0f")} />
            </mesh>
            <mesh position={[0.5, 0.15, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[2, 2]} />
               <meshStandardMaterial color={getMatColor("#0ea5e9")} metalness={0.1} roughness={0.1} />
            </mesh>
            <mesh position={[-1, 0.5, 1]}>
               <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
               <meshStandardMaterial color={getMatColor("#3f6212")} />
            </mesh>
            <mesh position={[-1, 1, 1]}>
               <coneGeometry args={[0.5, 1, 8]} />
               <meshStandardMaterial color={getMatColor("#3f6212")} />
            </mesh>
          </group>
        );

      case 'police_station':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 3, 2]} />
                <meshStandardMaterial color={getMatColor("#f8fafc")} />
             </mesh>
             <mesh position={[0, 1.5, 1.05]}>
                <boxGeometry args={[3.1, 0.5, 0.1]} />
                <meshStandardMaterial color={getMatColor("#2563eb")} />
             </mesh>
             <mesh position={[0, 2.5, 1.05]}>
                <boxGeometry args={[1, 0.5, 0.1]} />
                <meshStandardMaterial color={getMatColor("#1e3a8a")} />
             </mesh>
             <mesh position={[-1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial color="#dc2626" {...getEmissive("#dc2626", 0.8, true)} />
             </mesh>
             <mesh position={[1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial color="#2563eb" {...getEmissive("#2563eb", 0.8, true)} />
             </mesh>
          </group>
        );

      case 'fire_station':
        return (
            <group position={position} rotation={[0, rotationY, 0]}>
                {/* Main Body */}
                <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                    <boxGeometry args={[3, 2.5, 3]} />
                    <meshStandardMaterial color={getMatColor("#b91c1c", true)} />
                </mesh>
                {/* Garage Door */}
                <mesh position={[0, 1, 1.51]}>
                    <planeGeometry args={[2, 1.8]} />
                    <meshStandardMaterial color={getMatColor("#4b5563", true)} />
                </mesh>
                {/* Siren */}
                <mesh position={[0, 2.6, 0]}>
                    <cylinderGeometry args={[0.3, 0.4, 0.4, 8]} />
                    <meshStandardMaterial color="#ef4444" {...getEmissive("#ef4444", 1, true)} />
                </mesh>
                 <mesh position={[0, 2.8, 0]}>
                    <sphereGeometry args={[0.3]} />
                    <meshStandardMaterial color="#fca5a5" {...getEmissive("#fca5a5", 1, true)} />
                </mesh>
            </group>
        );

      case 'bar':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 2.5, 2.5]} />
                <meshStandardMaterial color={getMatColor("#1e1b4b")} />
             </mesh>
             <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[2.6, 0.1, 2.6]} />
                <meshStandardMaterial color={getMatColor("#d8b4fe")} {...getEmissive("#a855f7", 1, true)} />
             </mesh>
             <mesh position={[0, 0.8, 1.3]}>
                <boxGeometry args={[1, 1.6, 0.1]} />
                <meshStandardMaterial color={getMatColor("#000000")} />
             </mesh>
             <mesh position={[0, 1.7, 1.35]}>
                <boxGeometry args={[1.2, 0.1, 0.1]} />
                <meshStandardMaterial color={getMatColor("#f0abfc")} {...getEmissive("#e879f9", 2, true)} />
             </mesh>
          </group>
        );

      case 'power_plant':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             {/* Base Platform - Industrial Dark */}
             <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3.8, 1, 3.8]} />
                <meshStandardMaterial color={getMatColor("#374151", true)} />
             </mesh>
             {/* Main Reactor Building */}
             <mesh position={[-1, 2, -1]} castShadow>
                <boxGeometry args={[1.5, 3, 1.5]} />
                <meshStandardMaterial color={getMatColor("#4b5563", true)} />
             </mesh>
             {/* Smokestack 1 */}
             <mesh position={[1, 3, 1]}>
                <cylinderGeometry args={[0.4, 0.6, 6, 16]} />
                <meshStandardMaterial color={getMatColor("#9ca3af", true)} />
             </mesh>
             {/* Smokestack 1 Rim */}
             <mesh position={[1, 5.8, 1]}>
                <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
                <meshStandardMaterial color={getMatColor("#dc2626", true)} {...getEmissive("#dc2626", 0.5, true)} />
             </mesh>
             {/* Smokestack 2 */}
             <mesh position={[1, 2.5, -1]}>
                 <cylinderGeometry args={[0.3, 0.5, 5, 16]} />
                 <meshStandardMaterial color={getMatColor("#9ca3af", true)} />
             </mesh>
             {/* Pipes */}
             <mesh position={[0, 1.5, 0]} rotation={[0,0,Math.PI/2]}>
                 <cylinderGeometry args={[0.2, 0.2, 3]} />
                 <meshStandardMaterial color={getMatColor("#fbbf24", true)} />
             </mesh>
          </group>
        );

      case 'dumpsite':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            {/* Ground (Dirt/Mud) */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
               <boxGeometry args={[3.8, 0.2, 3.8]} />
               <meshStandardMaterial color={getMatColor("#57534e", true)} />
            </mesh>
            {/* Trash Pile 1 */}
            <mesh position={[-0.5, 0.8, -0.5]} castShadow>
               <coneGeometry args={[1.5, 1.5, 6]} />
               <meshStandardMaterial color={getMatColor("#44403c", true)} flatShading />
            </mesh>
            {/* Trash Pile 2 */}
            <mesh position={[1, 0.6, 1]} castShadow>
               <coneGeometry args={[1, 1.2, 5]} />
               <meshStandardMaterial color={getMatColor("#78716c", true)} flatShading />
            </mesh>
            {/* Debris Bits */}
            <mesh position={[0, 0.3, 1.5]}>
               <boxGeometry args={[0.5, 0.5, 0.5]} />
               <meshStandardMaterial color={getMatColor("#3b82f6", true)} />
            </mesh>
            <mesh position={[1.2, 0.3, -1]}>
               <boxGeometry args={[0.4, 0.4, 0.4]} />
               <meshStandardMaterial color={getMatColor("#ef4444", true)} />
            </mesh>
            {/* Fence Posts */}
            {[[-1.8, -1.8], [1.8, -1.8], [-1.8, 1.8], [1.8, 1.8]].map((pos, i) => (
                <mesh key={i} position={[pos[0], 0.5, pos[1]]}>
                    <boxGeometry args={[0.2, 1, 0.2]} />
                    <meshStandardMaterial color={getMatColor("#713f12", true)} />
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
                   <meshStandardMaterial color={getMatColor("#78350f")} />
                </mesh>
                
                {/* Shack 1 */}
                <mesh position={[-1, 0.5, -1]} castShadow rotation={[0, 0.1, 0]}>
                   <boxGeometry args={[1.5, 1, 1.5]} />
                   <meshStandardMaterial color={getMatColor("#7f1d1d")} />
                </mesh>
                <mesh position={[-1, 1.05, -1]} rotation={[0, 0.1, 0.1]}>
                   <boxGeometry args={[1.6, 0.1, 1.6]} />
                   <meshStandardMaterial color={getMatColor("#713f12")} />
                </mesh>

                {/* Shack 2 */}
                <mesh position={[1.2, 0.4, 0.8]} castShadow rotation={[0, -0.2, 0]}>
                   <boxGeometry args={[1.2, 0.8, 1.8]} />
                   <meshStandardMaterial color={getMatColor("#374151")} />
                </mesh>
                <mesh position={[1.2, 0.85, 0.8]} rotation={[0, -0.2, -0.1]}>
                   <boxGeometry args={[1.3, 0.1, 2]} />
                   <meshStandardMaterial color={getMatColor("#92400e")} />
                </mesh>

                {/* Shack 3 */}
                <mesh position={[0.5, 0.4, -1.2]} castShadow rotation={[0, 0.3, 0]}>
                   <boxGeometry args={[1, 0.8, 1]} />
                   <meshStandardMaterial color={getMatColor("#57534e")} />
                </mesh>
            </group>
        );

    default:
      return null;
  }
});
