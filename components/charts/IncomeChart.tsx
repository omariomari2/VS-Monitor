import React from 'react';
import { motion } from 'framer-motion';

export const IncomeChart: React.FC = () => {
    // Generate bars roughly matching the design
    // 35 bars
    const bars = Array.from({ length: 35 }).map((_, i) => {
        // Create a wave-like pattern manually to match image
        // Peak around index 6, dip around 12, peak around 28
        let h = 30 + Math.random() * 40;
        if (i === 6) h = 85; // Highlighted bar
        return { height: h, isHighlight: i === 6 };
    });

    return (
        <div className="bg-white p-6 rounded-3xl shadow-soft h-[260px] flex flex-col justify-between relative">
             {/* Header */}
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Income</h3>
                <div className="flex gap-2">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400"><span className="text-lg leading-none -mt-2 block">...</span></button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-400">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 flex items-end justify-between gap-[3px] relative">
                {bars.map((bar, i) => (
                    <div key={i} className="relative w-full h-full flex items-end group">
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${bar.height}%` }}
                            transition={{ duration: 0.5, delay: i * 0.02 }}
                            className={`w-full rounded-md transition-all duration-300 ${
                                bar.isHighlight ? 'bg-black' : 'bg-gray-300 group-hover:bg-gray-400'
                            }`}
                        ></motion.div>
                        
                        {/* Tooltip for highlighted bar */}
                        {bar.isHighlight && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-[10px] font-medium py-1 px-2 rounded-md whitespace-nowrap z-20 shadow-lg"
                            >
                                $234,774.55
                                {/* Triangle arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}