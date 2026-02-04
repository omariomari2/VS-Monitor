import React from 'react';
import { motion } from 'framer-motion';

export const DeviceTrafficChart: React.FC = () => {
    // SVG Geometry
    const radius = 80;
    const stroke = 18;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    // We only want semi-circle, so perimeter is half circumference
    const arcLength = circumference / 2;
    
    // Segments logic
    // Total is 100%. We map this to the semi-circle (0 to 180 degrees)
    // Black: ~20%
    // Green: ~45%
    // Gray: Remainder ~35%
    
    // In stroke-dasharray for a circle: "dash gap"
    // To fill partial: "filledLength totalLength"
    // But we have multiple segments. Easier to stack paths.

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-[260px] flex flex-col justify-between relative overflow-hidden">
             {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Device Traffic</h3>
                <div className="flex gap-2">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400"><span className="text-lg leading-none -mt-2 block">...</span></button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </button>
                </div>
            </div>

            {/* Gauge */}
            <div className="flex-1 flex items-center justify-center relative mt-4">
                 <div className="relative w-[220px] h-[110px] overflow-hidden">
                     <svg width="220" height="220" viewBox="0 0 220 220" className="rotate-[180deg]">
                        {/* Track Background */}
                        <circle
                            cx="110"
                            cy="110"
                            r={normalizedRadius}
                            fill="transparent"
                            stroke="#E5E7EB"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            style={{ strokeDasharray: circumference, strokeDashoffset: circumference * 0.5 }} // Half circle
                            className="opacity-50"
                        />
                        
                         {/* Black Segment (Left) - represents ~25% of the 180 deg */}
                         <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - (arcLength * 0.25) }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            cx="110"
                            cy="110"
                            r={normalizedRadius}
                            fill="transparent"
                            stroke="#000000"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            style={{ strokeDasharray: circumference }}
                            transform="rotate(0, 110, 110)"
                        />

                         {/* Green Segment (Top/Right) - represents ~45% of the 180 deg. Starts after Black. */}
                         {/* To stack, we rotate this segment to start where black ended. 
                             Black is 25% of 180deg = 45deg. 
                             Wait, simple way: Overlap them but utilize z-index or specific dashoffsets. 
                             Better: Use separate paths with specific start/end angles if strict.
                             Or just rotate the whole circle.
                             Let's try dashoffset from opposite side for the green part.
                         */}
                         <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: circumference - (arcLength * 0.45) }}
                            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                            cx="110"
                            cy="110"
                            r={normalizedRadius}
                            fill="transparent"
                            stroke="#4ADE80"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            style={{ strokeDasharray: circumference }}
                            // Rotate to start after the black segment. 
                            // Black covers ~45 degrees.
                            transform="rotate(45, 110, 110)" 
                        />
                     </svg>
                     
                     {/* Text Content - Absolute positioned in the "hole" */}
                     <div className="absolute bottom-0 left-0 w-full text-center pb-2">
                         <div className="text-3xl font-bold text-gray-900">45%</div>
                         <div className="text-xs text-gray-400 font-medium">Windows</div>
                     </div>
                 </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-[10px] font-medium text-gray-500 mt-2">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> Windows
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> MacOS
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span> Other
                </div>
            </div>
        </div>
    );
}