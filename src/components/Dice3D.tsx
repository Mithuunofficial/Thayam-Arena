import React from 'react';
import { motion } from 'framer-motion';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 180, y: 0 },
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  onRoll,
  disabled
}) => {
  const currentRot = FACE_ROTATIONS[value] || { x: 0, y: 0 };

  // Generate randomized extra spins when rolling
  const rollAnimation = isRolling
    ? {
        rotateX: [currentRot.x, currentRot.x + 360, currentRot.x + 720],
        rotateY: [currentRot.y, currentRot.y + 720, currentRot.y + 1080],
        rotateZ: [0, 180, 360],
        y: [-15, -45, 0], // bouncing off the plate
      }
    : {
        rotateX: currentRot.x,
        rotateY: currentRot.y,
        rotateZ: 0,
        y: 0,
      };

  // Red dots helper matching traditional dice
  const renderDots = (num: number) => {
    const dotsMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    const activeDots = dotsMap[num] || [];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-1.5 bg-amber-50 rounded-lg border border-amber-900/30 shadow-inner">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {activeDots.includes(idx) && (
              <div 
                className={`rounded-full ${num === 1 ? 'bg-red-600 w-3 h-3' : 'bg-stone-950 w-2 h-2'} shadow-sm`} 
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Wooden rolling plate base container */}
      <div 
        onClick={() => {
          if (!disabled && !isRolling) onRoll();
        }}
        className={`relative w-24 h-24 rounded-full border-[3px] border-amber-900 bg-amber-950 flex items-center justify-center cursor-pointer shadow-lg transition-transform ${
          disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, #5c3b1e 0%, #3e2511 100%)',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6), 0 6px 12px rgba(0,0,0,0.4)',
        }}
      >
        {/* Ivory/Bone dice container with 3D perspective */}
        <div 
          className="w-12 h-12"
          style={{ perspective: '300px' }}
        >
          <motion.div
            animate={rollAnimation}
            transition={
              isRolling 
                ? { duration: 0.8, ease: 'easeInOut' } 
                : { type: 'spring', stiffness: 100, damping: 12 }
            }
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front: 1 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'translateZ(24px)' }}
            >
              {renderDots(1)}
            </div>

            {/* Back: 6 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'rotateY(180deg) translateZ(24px)' }}
            >
              {renderDots(6)}
            </div>

            {/* Left: 2 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'rotateY(-90deg) translateZ(24px)' }}
            >
              {renderDots(2)}
            </div>

            {/* Right: 5 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'rotateY(90deg) translateZ(24px)' }}
            >
              {renderDots(5)}
            </div>

            {/* Top: 3 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'rotateX(90deg) translateZ(24px)' }}
            >
              {renderDots(3)}
            </div>

            {/* Bottom: 4 */}
            <div 
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ transform: 'rotateX(-90deg) translateZ(24px)' }}
            >
              {renderDots(4)}
            </div>
          </motion.div>
        </div>

        {/* Small gold ring on plate rim */}
        <div className="absolute inset-1 rounded-full border border-amber-500/30 pointer-events-none" />
      </div>

      {/* Mini status indicator */}
      {!disabled && !isRolling && (
        <span className="text-[9px] font-extrabold text-amber-800 dark:text-amber-400 tracking-[0.2em] animate-pulse leading-none mt-1 uppercase">
          Roll Dice
        </span>
      )}
    </div>
  );
  );
};
