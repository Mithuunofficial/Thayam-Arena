import React from 'react';
import { motion } from 'framer-motion';

interface AuthLoadingOverlayProps {
  status?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({ 
  status = "Preparing Battlefield..." 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F1A]/95 backdrop-blur-md flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* Cinematic ambient highlights */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#F5B041]/10 blur-[80px] pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-[#00C2FF]/5 blur-[60px] pointer-events-none translate-x-12 translate-y-12" />

      {/* Runic loading circles */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-6">
        {/* Outer dotted scanning ring */}
        <motion.div 
          className="absolute inset-0 border border-dashed border-[#F5B041]/40 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Inner solid tactical cyan ring */}
        <motion.div 
          className="absolute inset-2 border-2 border-r-transparent border-l-transparent border-[#00C2FF]/60 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Central Rotating Emblem */}
        <motion.div
          className="absolute w-20 h-20 flex items-center justify-center"
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {/* Cyber Thayam Gold Crown/Emblem SVG */}
          <svg viewBox="0 0 48 48" className="w-full h-full filter drop-shadow-[0_0_8px_#F5B041]">
            <path 
              d="M24,4 L36,16 L44,8 L40,32 L24,44 L8,32 L4,8 L12,16 Z" 
              fill="url(#gold-grad)" 
              stroke="#F5B041" 
              strokeWidth="2" 
            />
            {/* Center grid diamond icon */}
            <rect x="20" y="20" width="8" height="8" transform="rotate(45 24 24)" fill="#FF6B00" />
            <defs>
              <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE8A3" />
                <stop offset="50%" stopColor="#F5B041" />
                <stop offset="100%" stopColor="#C38012" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Loading Status Text */}
      <div className="text-center space-y-3 relative z-10 px-4 max-w-sm">
        <h3 className="font-orbitron text-sm font-bold tracking-[0.25em] text-[#F5B041] uppercase animate-pulse">
          {status}
        </h3>
        
        <p className="font-sans text-[10px] text-white/40 tracking-wider uppercase font-semibold">
          Securing tactical grid connection...
        </p>

        {/* Progress simulator bar */}
        <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden relative border border-white/10">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#FF6B00] via-[#F5B041] to-[#00C2FF]"
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-6 left-6 font-mono text-[8px] text-white/20 select-none hidden md:block">
        AUTHENTICATION SERVICE SECURE // SSL ENABLED
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[8px] text-white/20 select-none hidden md:block">
        THAYAM ARENA CLIENT v1.0.0
      </div>
    </div>
  );
};
