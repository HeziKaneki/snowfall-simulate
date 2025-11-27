import React from 'react';
import { WeatherParams, SnowConfig } from '../../types';

interface ControlsProps {
  weather: WeatherParams;
  setWeather: React.Dispatch<React.SetStateAction<WeatherParams>>;
  config: SnowConfig;
  resetSimulation: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ weather, setWeather, config, resetSimulation }) => {
  const handleChange = (key: keyof WeatherParams, value: number) => {
    setWeather(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/80 backdrop-blur-md p-6 rounded-xl border border-slate-700 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Simulation Control
        </h2>
        <div className="flex gap-2 text-xs">
           <span className="px-2 py-1 bg-blue-500/20 rounded border border-blue-500/50">{config.maxFallingParticles} active</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Wind Speed */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <label>Wind Speed</label>
            <span>{weather.windSpeed.toFixed(1)} m/s</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={weather.windSpeed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('windSpeed', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Wind Direction */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <label>Wind Direction</label>
            <span>{weather.windDirection}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={weather.windDirection}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('windDirection', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Turbulence */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <label>Turbulence</label>
            <span>{(weather.turbulence * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={weather.turbulence}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('turbulence', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Gravity */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <label>Gravity</label>
            <span>{weather.gravity.toFixed(2)} m/s²</span>
          </div>
          <input
            type="range"
            min="-20"
            max="-1"
            step="0.5"
            value={weather.gravity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('gravity', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-700">
           <button 
             onClick={resetSimulation}
             className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg transition-colors text-sm font-medium"
           >
             Reset Simulation
           </button>
        </div>
      </div>
      
      <div className="mt-6 text-xs text-slate-500 leading-relaxed">
        <p><strong>Physics:</strong> Cannon.js (SAP Broadphase)</p>
        <p><strong>Rendering:</strong> Three.js InstancedMesh</p>
        <p><strong>Accumulation:</strong> Hybrid recycling system</p>
      </div>
    </div>
  );
};