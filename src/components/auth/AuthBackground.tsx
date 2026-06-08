import React from 'react';
import { motion } from 'framer-motion';

// Ancient Tamil cyber runes representing tactical terms in the game
const TAMIL_RUNES = [
  { char: 'த', label: 'Thayam (One)', x: '10%', y: '15%', delay: 0 },
  { char: 'ய', label: 'Yaam (Dice)', x: '80%', y: '20%', delay: 1.5 },
  { char: 'ம', label: 'Maan (Home)', x: '25%', y: '75%', delay: 3 },
  { char: 'வெ', label: 'Vetri (Victory)', x: '75%', y: '80%', delay: 0.8 },
  { char: '⚔️', label: 'Battle', x: '45%', y: '12%', delay: 2.2 },
  { char: '🛡️', label: 'Defense', x: '85%', y: '65%', delay: 1.7 },
];

export const AuthBackground: React.FC = () => {
  // Generate random values for 20 embers to avoid static look
  const embers = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    xStart: Math.random() * 100,
    xEnd: Math.random() * 100 + (Math.random() * 20 - 10),
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0B0F1A] overflow-hidden select-none pointer-events-none z-0">
      
      {/* 1. Cyber Ambient Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00C2FF]/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#FF6B00]/5 blur-[140px]" />
      <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-[#F5B041]/3 blur-[100px]" />

      {/* 2. Tactical Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3. Glowing Cyber Tamil Runes */}
      {TAMIL_RUNES.map((rune, index) => (
        <motion.div
          key={index}
          className="absolute font-sans font-black text-2xl md:text-3xl text-amber-500/10 hover:text-amber-400/35 transition-colors duration-500 select-none flex flex-col items-center"
          style={{ left: rune.x, top: rune.y }}
          initial={{ opacity: 0.02, scale: 0.9 }}
          animate={{ 
            opacity: [0.03, 0.18, 0.03],
            scale: [0.95, 1.05, 0.95],
            textShadow: [
              '0 0 4px rgba(245, 176, 65, 0.1)',
              '0 0 12px rgba(245, 176, 65, 0.4)',
              '0 0 4px rgba(245, 176, 65, 0.1)'
            ]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: rune.delay,
            ease: "easeInOut"
          }}
        >
          <span>{rune.char}</span>
        </motion.div>
      ))}

      {/* 4. Animated Fog Layers */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[35vh] opacity-[0.06] bg-gradient-to-t from-stone-900 to-transparent blur-md"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-[20%] left-[-20%] w-[140%] h-[30vh] opacity-[0.03] bg-gradient-to-b from-[#00C2FF] to-transparent blur-3xl pointer-events-none"
        animate={{
          x: ['-10%', '10%', '-10%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="absolute bottom-[10%] left-[-10%] w-[120%] h-[25vh] opacity-[0.03] bg-gradient-to-t from-[#FF6B00] to-transparent blur-3xl pointer-events-none"
        animate={{
          x: ['10%', '-10%', '10%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* 5. Floating Fire Ember Particles */}
      {embers.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-t from-[#FF6B00] to-[#F5B041]"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.xStart}%`,
            bottom: '-10px',
            boxShadow: '0 0 8px #FF6B00, 0 0 4px #F5B041',
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: '-105vh',
            x: [`${particle.xStart}%`, `${particle.xEnd}%`],
            opacity: [0, 0.7, 0.7, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* 6. Cinematic Lens Glow Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(11, 15, 26, 0.3) 100%)'
        }}
      />
    </div>
  );
};
