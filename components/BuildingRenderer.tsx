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
      meshStandardMaterial: any;
    }
  }
}

interface BuildingRendererProps {
  type: BuildingType;
  position?: [number, number, number];
  rotation?: number; // 0, 1, 2, 3 (multipliers of 90 degrees)
}

export const BuildingRenderer: React.FC<BuildingRendererProps> = ({ type, position = [0, 0, 0], rotation = 0 }) => {
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
      return (
        <group position={position} rotation={[0, rotationY, 0]}>
            {/* Asphalt */}
            <mesh position={[0, 0.05, 0]} receiveShadow>
                <boxGeometry args={[4, 0.1, 4]} />
                <meshStandardMaterial color="#334155" />
            </mesh>
            {/* Lane Markings */}
            <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.2, 2]} />
                <meshStandardMaterial color="#fcd116" />
            </mesh>
        </group>
      );

    default:
      return null;
  }
};
