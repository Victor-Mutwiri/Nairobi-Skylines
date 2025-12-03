import React from 'react';
import { BuildingType } from '../store/useCityStore';

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
}

export const BuildingRenderer: React.FC<BuildingRendererProps> = ({ 
  type, 
  position = [0, 0, 0], 
  rotation = 0,
  adjacencies = { north: false, south: false, east: false, west: false }
}) => {
  const rotationY = rotation * (Math.PI / 2);

  switch (type) {
    case 'runda_house':
      return (
        <group position={position} rotation={[0, rotationY, 0]}>
          {/* Base House - White Box */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 2, 2.5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Pitched Roof - Grey Cone (4 sides = Pyramid) */}
          <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[2.2, 1.5, 4]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Door */}
          <mesh position={[0, 0.5, 1.3]}>
            <boxGeometry args={[0.6, 1, 0.1]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      );

    case 'kiosk':
      return (
        <group position={position} rotation={[0, rotationY, 0]}>
          {/* Main Structure - Green */}
          <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshStandardMaterial color="#16a34a" /> {/* Safaricom/Kiosk Green */}
          </mesh>
          {/* Red Stripe / Branding */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1.55, 0.3, 1.55]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {/* Service Window */}
          <mesh position={[0, 0.8, 0.8]}>
            <boxGeometry args={[1, 0.6, 0.1]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      );

    case 'apartment':
      return (
        <group position={position} rotation={[0, rotationY, 0]}>
          {/* Main Tower - Cream */}
          <mesh position={[0, 3, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.8, 6, 2.8]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
          {/* Roof Edge */}
          <mesh position={[0, 6.1, 0]}>
             <boxGeometry args={[3, 0.2, 3]} />
             <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Windows (Blue Squares) - Front Face */}
          <group position={[0, 0, 1.41]}>
            {[-1.5, 0, 1.5].map((y, i) => (
              <React.Fragment key={i}>
                <mesh position={[-0.8, y + 3, 0]}>
                  <boxGeometry args={[0.6, 0.6, 0.05]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.2} />
                </mesh>
                <mesh position={[0.8, y + 3, 0]}>
                  <boxGeometry args={[0.6, 0.6, 0.05]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.2} />
                </mesh>
              </React.Fragment>
            ))}
          </group>
        </group>
      );

    case 'acacia':
      return (
        <group position={position} rotation={[0, rotationY, 0]}>
          {/* Trunk - Thin Brown Cylinder */}
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.15, 0.25, 2, 8]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          {/* Canopy - Flat Wide Green Cylinder */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[1.8, 1.2, 0.8, 12]} />
            <meshStandardMaterial color="#3f6212" roughness={1} />
          </mesh>
          {/* Second small layer */}
          <mesh position={[0.5, 2.6, 0.2]} castShadow>
            <cylinderGeometry args={[0.8, 0.5, 0.5, 8]} />
            <meshStandardMaterial color="#3f6212" roughness={1} />
          </mesh>
        </group>
      );
      
    case 'road':
      const { north, south, east, west } = adjacencies;
      const hasConnection = north || south || east || west;
      
      return (
        <group position={position}>
            {/* Base Asphalt */}
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <boxGeometry args={[4, 0.1, 4]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            
            {/* Lane Markings - Only if connected, or render a simple dot/line if isolated? 
                Let's render lines towards connections. */}
            
            {/* Center Hub (Intersection point) */}
            {hasConnection && (
              <mesh position={[0, 0.12, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.6, 0.6]} />
                  <meshStandardMaterial color="#fcd116" />
              </mesh>
            )}

            {/* North Line */}
            {north && (
               <mesh position={[0, 0.11, -1]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.2, 2]} />
                  <meshStandardMaterial color="#fcd116" />
               </mesh>
            )}

            {/* South Line */}
            {south && (
               <mesh position={[0, 0.11, 1]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.2, 2]} />
                  <meshStandardMaterial color="#fcd116" />
               </mesh>
            )}

            {/* East Line */}
            {east && (
               <mesh position={[1, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[2, 0.2]} />
                  <meshStandardMaterial color="#fcd116" />
               </mesh>
            )}

            {/* West Line */}
            {west && (
               <mesh position={[-1, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[2, 0.2]} />
                  <meshStandardMaterial color="#fcd116" />
               </mesh>
            )}

            {/* If no connections, maybe just a default vertical line? */}
            {!hasConnection && (
               <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                  <planeGeometry args={[0.2, 2]} />
                  <meshStandardMaterial color="#fcd116" opacity={0.5} transparent />
               </mesh>
            )}
        </group>
      );

    case 'kicc':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            {/* Podium */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.5, 1, 3.5]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            {/* Main Cylinder Tower */}
            <mesh position={[0, 4, 0]} castShadow>
              <cylinderGeometry args={[1, 1, 7, 16]} />
              <meshStandardMaterial color="#b45309" /> {/* Terracotta */}
            </mesh>
            {/* Top Saucer (Helipad) */}
            <mesh position={[0, 7.5, 0]} castShadow>
              <cylinderGeometry args={[1.8, 0.2, 0.2, 16]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            {/* Antenna */}
            <mesh position={[0, 8, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          </group>
        );
  
      case 'times_tower':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            {/* Main Glass Monolith */}
            <mesh position={[0.2, 5, 0]} castShadow receiveShadow>
              <boxGeometry args={[2, 10, 2]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.2} />
            </mesh>
            {/* White Spine */}
            <mesh position={[-1, 5, 0]} castShadow>
              <boxGeometry args={[0.5, 10.5, 1.5]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
  
      case 'jamia_mosque':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
            {/* Main Building */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3, 3, 3]} />
              <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            {/* Green Dome (Hemisphere) */}
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
            {/* Minarets */}
            <mesh position={[1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial color="#f1f5f9" />
            </mesh>
            <mesh position={[-1.3, 2.5, 1.3]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 5, 8]} />
              <meshStandardMaterial color="#f1f5f9" />
            </mesh>
          </group>
        );
  
      case 'uhuru_park':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             {/* Grass Base */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
              <boxGeometry args={[4, 0.2, 4]} />
              <meshStandardMaterial color="#4d7c0f" />
            </mesh>
            {/* Lake */}
            <mesh position={[0.5, 0.15, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
               <planeGeometry args={[2, 2]} />
               <meshStandardMaterial color="#0ea5e9" metalness={0.1} roughness={0.1} />
            </mesh>
            {/* A couple of small trees */}
            <mesh position={[-1, 0.5, 1]}>
               <cylinderGeometry args={[0.1, 0.1, 0.8, 8]} />
               <meshStandardMaterial color="#3f6212" />
            </mesh>
            <mesh position={[-1, 1, 1]}>
               <coneGeometry args={[0.5, 1, 8]} />
               <meshStandardMaterial color="#3f6212" />
            </mesh>
          </group>
        );

      case 'police_station':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             {/* Main Building - White */}
             <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[3, 3, 2]} />
                <meshStandardMaterial color="#f8fafc" />
             </mesh>
             {/* Blue Stripe */}
             <mesh position={[0, 1.5, 1.05]}>
                <boxGeometry args={[3.1, 0.5, 0.1]} />
                <meshStandardMaterial color="#2563eb" />
             </mesh>
             {/* Sign */}
             <mesh position={[0, 2.5, 1.05]}>
                <boxGeometry args={[1, 0.5, 0.1]} />
                <meshStandardMaterial color="#1e3a8a" />
             </mesh>
             {/* Siren Lights */}
             <mesh position={[-1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.5} />
             </mesh>
             <mesh position={[1, 3.1, 0]}>
                <boxGeometry args={[0.5, 0.2, 0.5]} />
                <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.5} />
             </mesh>
          </group>
        );

      case 'bar':
        return (
          <group position={position} rotation={[0, rotationY, 0]}>
             {/* Dark Building */}
             <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                <boxGeometry args={[2.5, 2.5, 2.5]} />
                <meshStandardMaterial color="#1e1b4b" />
             </mesh>
             {/* Neon Trim */}
             <mesh position={[0, 2.5, 0]}>
                <boxGeometry args={[2.6, 0.1, 2.6]} />
                <meshStandardMaterial color="#d8b4fe" emissive="#a855f7" emissiveIntensity={1} />
             </mesh>
             {/* Entrance with Neon */}
             <mesh position={[0, 0.8, 1.3]}>
                <boxGeometry args={[1, 1.6, 0.1]} />
                <meshStandardMaterial color="#000000" />
             </mesh>
             <mesh position={[0, 1.7, 1.35]}>
                <boxGeometry args={[1.2, 0.1, 0.1]} />
                <meshStandardMaterial color="#f0abfc" emissive="#e879f9" emissiveIntensity={2} />
             </mesh>
          </group>
        );

    default:
      return null;
  }
};