import React from 'react';
import { usePlane, useCompoundBody } from '@react-three/cannon';
import { Float } from '@react-three/drei';
import '../../types';

interface PropParams {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const House: React.FC<PropParams> = ({ position, rotation = [0, 0, 0] }) => {
  // Compound body: Box for base, 4-sided Cylinder (Pyramid) for roof
  const [ref] = useCompoundBody(() => ({
    mass: 0,
    type: 'Static',
    position,
    rotation,
    shapes: [
      // Base: width 2, height 1.5, depth 2. Center is at y=0.75
      { type: 'Box', args: [2, 1.5, 2], position: [0, 0.75, 0] },
      // Roof: Pyramid. RadiusTop=0, RadiusBottom=1.6, Height=1.5, Segments=4
      { type: 'Cylinder', args: [0, 1.6, 1.5, 4], position: [0, 2.25, 0], rotation: [0, Math.PI / 4, 0] }
    ],
    material: { friction: 0.3, restitution: 0 },
    collisionFilterGroup: 2
  }));

  return (
    <group ref={ref as any}>
      {/* Base Structure */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.6, 1.01]} receiveShadow>
         <planeGeometry args={[0.5, 1]} />
         <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Window */}
      <mesh position={[0.6, 0.9, 1.01]} receiveShadow>
         <planeGeometry args={[0.4, 0.4]} />
         <meshStandardMaterial color="#94a3b8" emissive="#fef08a" emissiveIntensity={0.5} />
      </mesh>

      {/* Roof Visual */}
      <mesh position={[0, 2.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0, 1.6, 1.5, 4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.5, 2.6, 0.5]} castShadow>
         <boxGeometry args={[0.3, 0.8, 0.3]} />
         <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
};

const Tree: React.FC<PropParams> = ({ position, scale = 1 }) => {
  // Compound body: Cylinder for trunk, Cones for leaves
  const [ref] = useCompoundBody(() => ({
    mass: 0,
    type: 'Static',
    position,
    shapes: [
      // Trunk
      { type: 'Cylinder', args: [0.2 * scale, 0.3 * scale, 1 * scale, 8], position: [0, 0.5 * scale, 0] },
      // Bottom Foliage
      { type: 'Cylinder', args: [0, 1.2 * scale, 1.5 * scale, 8], position: [0, 1.5 * scale, 0] },
      // Top Foliage
      { type: 'Cylinder', args: [0, 0.9 * scale, 1.2 * scale, 8], position: [0, 2.4 * scale, 0] }
    ],
    collisionFilterGroup: 2
  }));

  return (
    <group ref={ref as any}>
      {/* Trunk */}
      <mesh position={[0, 0.5 * scale, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2 * scale, 0.3 * scale, 1 * scale, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>

      {/* Foliage Bottom */}
      <mesh position={[0, 1.5 * scale, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2 * scale, 1.5 * scale, 8]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>

      {/* Foliage Top */}
      <mesh position={[0, 2.4 * scale, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.9 * scale, 1.2 * scale, 8]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
    </group>
  );
};

export const Environment: React.FC = () => {
  // Ground
  const [groundRef] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.5, 0],
    material: { friction: 0.3, restitution: 0.1 },
    collisionFilterGroup: 2
  }));

  return (
    <group>
      {/* Ground Visual */}
      <mesh ref={groundRef} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Village Layout - Moved to Y=-0.5 to sit on ground */}
      <House position={[-4, -0.5, -2]} rotation={[0, 0.2, 0]} />
      <House position={[5, -0.5, 1]} rotation={[0, -0.4, 0]} />
      <House position={[0, -0.5, 6]} rotation={[0, Math.PI, 0]} />

      {/* Forest Layout - Moved to Y=-0.5 */}
      <Tree position={[-7, -0.5, 4]} scale={1.2} />
      <Tree position={[-8, -0.5, -5]} scale={1.5} />
      <Tree position={[7, -0.5, -4]} scale={1.3} />
      <Tree position={[2, -0.5, -6]} scale={1.6} />
      <Tree position={[-2, -0.5, 3]} scale={0.8} />
      <Tree position={[8, -0.5, 5]} scale={1.1} />
    </group>
  );
};