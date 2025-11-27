import 'react';

export interface WeatherParams {
  windSpeed: number;
  windDirection: number; // in degrees
  gravity: number;
  turbulence: number; // Random noise intensity
  temperature: number; // Affects melt rate (simulated)
  snowRate: number;
}

export interface SnowConfig {
  maxFallingParticles: number;
  maxAccumulatedParticles: number;
  particleSize: number;
  dragCoefficient: number;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      instancedMesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      planeGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      torusKnotGeometry: any;
      fog: any;
      color: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      [elemName: string]: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      instancedMesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      planeGeometry: any;
      boxGeometry: any;
      cylinderGeometry: any;
      coneGeometry: any;
      torusKnotGeometry: any;
      fog: any;
      color: any;
      ambientLight: any;
      directionalLight: any;
      orthographicCamera: any;
      [elemName: string]: any;
    }
  }
}
