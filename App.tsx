import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { Controls } from './components/UI/Controls';
import { WeatherParams, SnowConfig } from './types';
import { DEFAULT_WEATHER, SNOW_CONFIG } from './constants';

const App: React.FC = () => {
  const [weather, setWeather] = useState<WeatherParams>(DEFAULT_WEATHER);
  // Using a key to force re-mount of Scene on reset
  const [sceneKey, setSceneKey] = useState(0);

  const resetSimulation = () => {
    setWeather(DEFAULT_WEATHER);
    setSceneKey(prev => prev + 1);
  };

  return (
    <div className="relative w-full h-full font-sans">
      <div className="absolute top-0 left-0 w-full h-full">
        <Scene 
            key={sceneKey} 
            weather={weather} 
            config={SNOW_CONFIG} 
        />
      </div>
      
      <Controls 
        weather={weather} 
        setWeather={setWeather} 
        config={SNOW_CONFIG}
        resetSimulation={resetSimulation}
      />

      <div className="absolute bottom-4 left-4 text-slate-500 text-xs pointer-events-none select-none">
        <h1 className="text-xl font-bold text-slate-300">FrostFrame</h1>
        <p>Three.js + Cannon.js Physics Engine</p>
      </div>
    </div>
  );
};

export default App;
