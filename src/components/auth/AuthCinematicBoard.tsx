import React from 'react';
import { motion } from 'framer-motion';

export const AuthCinematicBoard: React.FC = () => {
  // Thayam board grid size (5x5)
  const size = 5;
  const boardCells = Array.from({ length: size * size });

  // Safe zones (X marked cells in Thayam)
  const isSafeZone = (index: number) => {
    return index === 2 || index === 10 || index === 12 || index === 14 || index === 22;
  };

  // Cowrie shell dice models (represented as beautiful glowing artifacts floating around the board)
  const shells = [
    { id: 1, x: '25%', y: '25%', size: 28, delay: 0.2, rotate: 35 },
    { id: 2, x: '70%', y: '30%', size: 22, delay: 0.8, rotate: -45 },
    { id: 3, x: '35%', y: '75%', size: 24, delay: 1.4, rotate: 110 },
    { id: 4, x: '75%', y: '68%', size: 30, delay: 0.5, rotate: -15 },
  ];

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden">
      
      {/* 1. Cinematic Radial Lighting behind the Board */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-radial from-amber-500/15 via-[#FF6B00]/5 to-transparent blur-3xl" />
      
      {/* 2. Tactical Scanner Decals */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[380px] h-[380px] border border-dashed border-[#00C2FF] rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[440px] h-[440px] border border-[#F5B041]/30 rounded-full animate-[spin_90s_linear_infinite]" />
        
        {/* Cyber hud reticles */}
        <div className="absolute w-[200px] h-[1px] bg-gradient-to-r from-transparent via-[#00C2FF]/60 to-transparent" />
        <div className="absolute h-[200px] w-[1px] bg-gradient-to-b from-transparent via-[#00C2FF]/60 to-transparent" />
      </div>

      {/* 3. 3D Floating Board Container */}
      <motion.div 
        className="relative flex items-center justify-center p-8 z-10"
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateX: 45, rotateY: -10, rotateZ: -15 }}
        animate={{
          opacity: 1,
          scale: 1,
          rotateX: [35, 42, 35],
          rotateY: [-5, -12, -5],
          rotateZ: [-20, -10, -20],
          y: [-15, 15, -15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* The Board Base Shadow */}
        <div className="absolute w-[300px] h-[300px] bg-black/40 blur-xl rounded-3xl translate-y-16 translate-z-[-50px]" />

        {/* 5x5 Thayam Cyber Board */}
        <div 
          className="w-[280px] h-[280px] bg-gradient-to-br from-[#111827]/95 to-[#0F172A]/90 border-2 border-[#F5B041]/50 rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative"
          style={{
            transform: 'translateZ(0px)',
            boxShadow: '0 0 35px rgba(245, 176, 65, 0.15), inset 0 0 20px rgba(0, 194, 255, 0.05)',
          }}
        >
          {/* Decorative Corner Decals (Futuristic Temple Pillars) */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#F5B041] rounded-tl" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#F5B041] rounded-tr" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#F5B041] rounded-bl" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#F5B041] rounded-br" />

          {/* Grid Layout */}
          <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full h-full">
            {boardCells.map((_, i) => {
              const isSafe = isSafeZone(i);
              return (
                <motion.div
                  key={i}
                  className={`relative border rounded flex items-center justify-center transition-all duration-500 overflow-hidden ${
                    isSafe 
                      ? 'border-[#F5B041] bg-[#F5B041]/5 shadow-[inset_0_0_6px_rgba(245,176,65,0.1)]' 
                      : 'border-white/5 bg-white/[0.01]'
                  }`}
                  whileHover={{ 
                    borderColor: isSafe ? '#FF6B00' : 'rgba(0, 194, 255, 0.4)',
                    backgroundColor: isSafe ? 'rgba(255, 107, 0, 0.1)' : 'rgba(0, 194, 255, 0.03)',
                  }}
                >
                  {/* Grid index numbers in tiny monospace */}
                  <span className="absolute top-0.5 left-1 text-[7px] text-white/10 font-mono select-none">
                    {String(i).padStart(2, '0')}
                  </span>

                  {/* Red/Amber Safe Zone Cross Overlay */}
                  {isSafe && (
                    <svg className="w-full h-full absolute inset-0 pointer-events-none p-1.5 opacity-60" viewBox="0 0 24 24">
                      <line x1="2" y1="2" x2="22" y2="22" stroke={i === 12 ? '#FF6B00' : '#F5B041'} strokeWidth="1.5" />
                      <line x1="2" y1="22" x2="22" y2="2" stroke={i === 12 ? '#FF6B00' : '#F5B041'} strokeWidth="1.5" />
                    </svg>
                  )}

                  {/* Pulsing core in the center home cell */}
                  {i === 12 && (
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-[#FF6B00] shadow-[0_0_12px_#FF6B00]" 
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Holographic Vector Lines projecting upward */}
        <svg className="absolute w-[400px] h-[400px] pointer-events-none z-20 overflow-visible" style={{ transform: 'translateZ(30px)' }}>
          {/* Tactical spiral pathways lines connecting outer cells to inner home */}
          <motion.path 
            d="M 100,100 L 300,100 L 300,300 L 140,300 L 140,160 L 260,160 L 260,240 L 180,240 L 180,200 L 200,200"
            fill="none" 
            stroke="url(#holo-gradient)" 
            strokeWidth="2" 
            strokeDasharray="8 4"
            animate={{ strokeDashoffset: [0, -40] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <defs>
            <linearGradient id="holo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5B041" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* 4. Floating Glowing Cowrie Shells */}
      {shells.map((shell) => (
        <motion.div
          key={shell.id}
          className="absolute z-20"
          style={{
            left: shell.x,
            top: shell.y,
            width: shell.size,
            height: shell.size * 1.5,
          }}
          initial={{ y: 0, rotate: shell.rotate, opacity: 0 }}
          animate={{
            y: [-12, 12, -12],
            rotate: [shell.rotate, shell.rotate + 15, shell.rotate - 10, shell.rotate],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 6 + shell.id,
            repeat: Infinity,
            delay: shell.delay,
            ease: "easeInOut",
          }}
        >
          {/* Cowrie shell SVG rendering */}
          <svg 
            viewBox="0 0 24 36" 
            className="w-full h-full filter drop-shadow-[0_0_8px_rgba(245,176,65,0.7)]"
          >
            {/* Outer shell body */}
            <path 
              d="M12,2 C6,2 2,10 2,20 C2,29 7,34 12,34 C17,34 22,29 22,20 C22,10 18,2 12,2 Z" 
              fill="url(#gold-metallic)" 
              stroke="#F5B041" 
              strokeWidth="1.5"
            />
            {/* Shell vertical split split */}
            <path 
              d="M12,2 L12,34 M12,12 C9,14 9,22 12,24 M12,14 C15,16 15,20 12,22" 
              fill="none" 
              stroke="#C38012" 
              strokeWidth="1.5" 
            />
            {/* Runic teeth notches inside split */}
            <line x1="9.5" y1="16" x2="11.5" y2="16" stroke="#C38012" strokeWidth="1" />
            <line x1="9.5" y1="20" x2="11.5" y2="20" stroke="#C38012" strokeWidth="1" />
            <line x1="14.5" y1="17" x2="12.5" y2="17" stroke="#C38012" strokeWidth="1" />
            <line x1="14.5" y1="21" x2="12.5" y2="21" stroke="#C38012" strokeWidth="1" />
            
            <defs>
              <linearGradient id="gold-metallic" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF8E0" />
                <stop offset="40%" stopColor="#F5B041" />
                <stop offset="100%" stopColor="#875605" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}

      {/* 5. Embedded Cyber HUD Labels */}
      <div className="absolute bottom-4 left-6 font-mono text-[9px] text-[#00C2FF]/40 flex flex-col space-y-1 z-20">
        <span>BOARD: SPATIAL GRID v3.02</span>
        <span>LATENCY: SYNC LOCALHOST</span>
        <span>TACTICAL CALIBRATION: ONLINE</span>
      </div>
    </div>
  );
};
