import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export const UserGrowthChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  
  // Generating visual data points to match the design curve approximately
  // 3 zones:
  // 1. Old Users (Jan-Mar): Dark bars
  // 2. New Users (Apr-May): Green bars
  // 3. Visitors (Jun-Aug): Gray bars
  
  // Total bars roughly 50-60 based on visual count
  const generateBars = () => {
    const bars = [];
    
    // Zone 1: Old Users (Indices 0-25)
    for (let i = 0; i < 25; i++) {
      bars.push({ 
        height: 20 + Math.random() * 40, 
        type: 'old',
        delay: i * 0.01 
      });
    }
    
    // Zone 2: New Users (Indices 25-45)
    for (let i = 0; i < 20; i++) {
      bars.push({ 
        height: 40 + Math.random() * 50, // Higher on average
        type: 'new',
        delay: 0.25 + (i * 0.01)
      });
    }

    // Zone 3: Visitors (Indices 45-65)
    for (let i = 0; i < 20; i++) {
      bars.push({ 
        height: 15 + Math.random() * 30, 
        type: 'visitor',
        delay: 0.45 + (i * 0.01)
      });
    }
    return bars;
  };

  const data = useMemo(() => generateBars(), []);
  
  const getColor = (type: string) => {
    switch(type) {
      case 'old': return '#1F2937'; // gray-800
      case 'new': return '#4ADE80'; // green-400
      case 'visitor': return '#D1D5DB'; // gray-300
      default: return '#D1D5DB';
    }
  };

  return (
    <div className="w-full bg-white p-6 pb-2 rounded-3xl shadow-soft relative overflow-hidden">
        {/* Labels Overlay */}
        <div className="absolute top-6 left-6 text-[10px] text-gray-500 leading-tight">
            Old users<br/>
            <span className="font-semibold text-gray-900">52%</span>
        </div>
        <div className="absolute top-32 left-[38%] text-[10px] text-green-500 leading-tight">
            New users<br/>
            <span className="font-semibold">18%</span>
        </div>
        <div className="absolute top-32 left-[65%] text-[10px] text-gray-400 leading-tight">
            Visitors<br/>
            <span className="font-semibold text-gray-500">30%</span>
        </div>

      <div className="h-[200px] w-full flex items-end justify-between gap-[2px] pt-12 relative z-10">
        {data.map((d, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${d.height}%` }}
            transition={{ duration: 0.5, delay: d.delay, ease: "easeOut" }}
            className="w-[3px] rounded-t-full hover:opacity-80 transition-opacity cursor-pointer relative group"
            style={{ backgroundColor: getColor(d.type) }}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {Math.floor(d.height * 100)} users
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Highlight Rect for New Users */}
      {/* Positioned absolutely to match the green bars section */}
      <div className="absolute bottom-10 left-[38%] w-[27%] h-6 bg-green-400 opacity-90 blur-[1px]"></div>

      {/* X Axis */}
      <div className="flex justify-between mt-6 border-t border-transparent pt-2 text-[10px] text-gray-400 font-medium px-2">
         {months.map(m => (
             <span key={m}>{m}</span>
         ))}
      </div>
      
      {/* Background Decor */}
      <div className="absolute bottom-10 left-0 right-0 h-10 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none"></div>
    </div>
  );
};