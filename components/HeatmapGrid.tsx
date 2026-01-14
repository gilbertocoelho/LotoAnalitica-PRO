import React from 'react';
import { NumberStat } from '../types';

interface HeatmapGridProps {
  stats: NumberStat[];
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({ stats }) => {
  // Sort by number ID 1-25
  const sortedStats = [...stats].sort((a, b) => a.number - b.number);
  
  // Find min and max for color scaling
  const maxFreq = Math.max(...stats.map(s => s.frequency));
  const minFreq = Math.min(...stats.map(s => s.frequency));

  const getOpacity = (freq: number) => {
     // Normalize between 0.3 and 1
     return 0.3 + ((freq - minFreq) / (maxFreq - minFreq)) * 0.7;
  };

  return (
    <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
      {sortedStats.map((stat) => (
        <div
          key={stat.number}
          className="relative aspect-square rounded-xl flex flex-col items-center justify-center border border-purple-200 shadow-sm transition-transform hover:scale-105 group cursor-default"
          style={{
            backgroundColor: `rgba(147, 51, 234, ${getOpacity(stat.frequency)})`,
          }}
        >
          <span className="text-2xl font-bold text-white drop-shadow-md">
            {stat.number}
          </span>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
            Saiu {stat.frequency}x
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeatmapGrid;
