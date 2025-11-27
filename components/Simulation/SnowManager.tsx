import React, { useMemo, useEffect, useRef } from 'react';
import { InstancedMesh, Object3D, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { WeatherParams, SnowConfig } from '../../types';

interface SnowManagerProps {
  weather: WeatherParams;
  config: SnowConfig;
}

// Grid size affects how easily separate piles merge. 
// Smaller = more detailed piles, Larger = easier merging.
const GRID_SIZE = 1.0; 
const getSpatialKey = (x: number, y: number, z: number) => {
  const kx = Math.round(x / GRID_SIZE);
  const ky = Math.round(y / GRID_SIZE);
  const kz = Math.round(z / GRID_SIZE);
  return `${kx}:${ky}:${kz}`;
};

const dummy = new Object3D();
const windVector = new Vector3();

export const SnowManager: React.FC<SnowManagerProps> = ({ weather, config }) => {
  // Track accumulation data: mapping grid key to instance index and volume
  const spatialMap = useRef<Map<string, { index: number; volume: number }>>(new Map());
  
  // Track next available slot in the instanced mesh
  const nextInstanceIndex = useRef(0);
  
  // Track which particles have collided
  const collisionStates = useRef(new Array(config.maxFallingParticles).fill(false));

  // --- Falling Snow (Physics) ---
  const [ref, api] = useSphere((index) => ({
    mass: 0.05,
    args: [config.particleSize],
    position: [
      (Math.random() - 0.5) * 20, 
      10 + Math.random() * 10, 
      (Math.random() - 0.5) * 20
    ],
    linearDamping: 0.9,
    material: { friction: 0.1, restitution: 0.0 },
    collisionFilterGroup: 1,
    collisionFilterMask: 2, 
    onCollide: (e) => {
        collisionStates.current[index] = true;
    }
  }), useRef<InstancedMesh>(null));

  // --- Accumulation (Static Visuals) ---
  const accumulationRef = useRef<InstancedMesh>(null);
  
  // Store live positions for physics sync
  const positions = useMemo(() => new Float32Array(config.maxFallingParticles * 3), [config.maxFallingParticles]);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];
    for (let i = 0; i < config.maxFallingParticles; i++) {
      const unsubPos = api.at(i).position.subscribe((v) => {
        positions[i * 3] = v[0];
        positions[i * 3 + 1] = v[1];
        positions[i * 3 + 2] = v[2];
      });
      unsubscribes.push(unsubPos);
    }
    return () => {
      unsubscribes.forEach((u) => u());
    };
  }, [api, config.maxFallingParticles, positions]);

  useFrame((state) => {
    if (!ref.current || !accumulationRef.current) return;

    const time = state.clock.getElapsedTime();
    const angleRad = (weather.windDirection * Math.PI) / 180;
    
    windVector.set(
      Math.sin(angleRad) * weather.windSpeed,
      0,
      Math.cos(angleRad) * weather.windSpeed
    );

    let meshNeedsUpdate = false;

    for (let i = 0; i < config.maxFallingParticles; i++) {
      const px = positions[i * 3];
      const py = positions[i * 3 + 1];
      const pz = positions[i * 3 + 2];

      // A. Apply Forces
      const turbulenceX = Math.sin(time * 2 + px) * weather.turbulence;
      const turbulenceZ = Math.cos(time * 1.5 + pz) * weather.turbulence;
      
      api.at(i).applyForce(
        [
            (windVector.x + turbulenceX) * 0.05, 
            -0.01, 
            (windVector.z + turbulenceZ) * 0.05
        ],
        [0, 0, 0]
      );

      // B. Collision & Merging Logic
      const hasCollided = collisionStates.current[i];
      const isBelowGround = py < -5;

      if (hasCollided || isBelowGround) {
        
        // Only accumulate if it hit valid ground (not void) and isn't glitching too low
        if (hasCollided && py > -2) {
            const key = getSpatialKey(px, py, pz);
            const existing = spatialMap.current.get(key);

            if (existing) {
                // --- MERGE CASE ---
                // Add significant volume per flake to speed up visual growth
                existing.volume += 8; 
                
                // Scale grows with cube root of volume. 
                // We boost the width multiplier to ensure piles overlap and "merge" visually.
                const growthFactor = Math.pow(existing.volume, 0.4); 
                
                accumulationRef.current.getMatrixAt(existing.index, dummy.matrix);
                dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
                
                dummy.scale.set(
                    1.5 * growthFactor,       // Width
                    0.3 * growthFactor,       // Height (grow taller too)
                    1.5 * growthFactor        // Depth
                );
                
                dummy.updateMatrix();
                accumulationRef.current.setMatrixAt(existing.index, dummy.matrix);
                meshNeedsUpdate = true;

            } else if (nextInstanceIndex.current < config.maxAccumulatedParticles) {
                // --- NEW PATCH CASE ---
                const idx = nextInstanceIndex.current;
                
                dummy.position.set(px, py, pz);
                // Random rotation for organic look
                dummy.rotation.set(0, Math.random() * Math.PI, 0);
                
                // Initial Volume = 10 (starts as a small mound, not a dot)
                dummy.scale.set(2, 0.5, 2); 
                
                dummy.updateMatrix();
                accumulationRef.current.setMatrixAt(idx, dummy.matrix);
                
                spatialMap.current.set(key, { index: idx, volume: 10 });
                
                nextInstanceIndex.current++;
                accumulationRef.current.count = nextInstanceIndex.current;
                meshNeedsUpdate = true;
            }
        }

        // --- RECYCLE PARTICLE ---
        const resetY = 15 + Math.random() * 5;
        // Reset around current wind direction to keep flow natural
        const resetX = (Math.random() - 0.5) * 30 - (windVector.x * 1.5); 
        const resetZ = (Math.random() - 0.5) * 30 - (windVector.z * 1.5);

        api.at(i).position.set(resetX, resetY, resetZ);
        api.at(i).velocity.set(0, -2, 0);
        api.at(i).angularVelocity.set(0, 0, 0);
        collisionStates.current[i] = false;
      }
    }

    if (meshNeedsUpdate) {
      accumulationRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Falling Snow */}
      <instancedMesh 
        ref={ref} 
        args={[undefined, undefined, config.maxFallingParticles]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[config.particleSize, 6, 6]} />
        <meshStandardMaterial color="#ffffff" roughness={1} metalness={0} />
      </instancedMesh>

      {/* Accumulated Snow (Static) */}
      <instancedMesh 
        ref={accumulationRef} 
        args={[undefined, undefined, config.maxAccumulatedParticles]}
        receiveShadow
        castShadow
        // Disable frustum culling so large merged piles don't disappear when camera moves
        frustumCulled={false} 
      >
        <sphereGeometry args={[config.particleSize, 8, 6]} />
        <meshStandardMaterial 
            color="#f1f5f9" 
            roughness={0.5} 
            metalness={0.1}
            emissive="#ffffff"
            emissiveIntensity={0.1}
        />
      </instancedMesh>
    </group>
  );
};