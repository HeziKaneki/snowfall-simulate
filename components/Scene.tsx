import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, OrbitControls, Environment as DreiEnvironment, SoftShadows } from '@react-three/drei';
import { SnowManager } from './Simulation/SnowManager';
import { Environment } from './World/Environment';
import { WeatherParams, SnowConfig } from '../types';

interface SceneProps {
  weather: WeatherParams;
  config: SnowConfig;
}

export const Scene: React.FC<SceneProps> = ({ weather, config }) => {
  return (
    <Canvas shadows camera={{ position: [10, 8, 10], fov: 45 }}>
      <fog attach="fog" args={['#0f172a', 5, 40]} />
      <color attach="background" args={['#0f172a']} />
      
      <Sky sunPosition={[100, 20, 100]} turbidity={10} rayleigh={0.5} />
      <DreiEnvironment preset="night" />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      <SoftShadows size={10} focus={0} samples={10} />

      <Physics 
        gravity={[0, weather.gravity, 0]} 
        broadphase="SAP" // Sweep and Prune is best for many bodies
        iterations={10}
        tolerance={0.001}
      >
        <Environment />
        <SnowManager weather={weather} config={config} />
      </Physics>

      <OrbitControls target={[0, 1, 0]} maxPolarAngle={Math.PI / 2 - 0.1} />
    </Canvas>
  );
};
