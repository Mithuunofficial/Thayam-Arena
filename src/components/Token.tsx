import React from 'react';
import { motion } from 'framer-motion';

interface TokenProps {
  id: number;
  playerId: number;
  row: number;
  col: number;
  colorHex: string;
  isSelectable: boolean;
  isSelected: boolean;
  index: number; 
  total: number; 
  onClick?: () => void;
}

export const Token: React.FC<TokenProps> = ({
  id,
  row,
  col,
  colorHex,
  isSelectable,
  isSelected,
  index,
  total,
  onClick
}) => {
  const cellSize = 64;
  const padding = 26;

  const cx = padding + col * cellSize + cellSize / 2;
  const cy = padding + row * cellSize + cellSize / 2;

  let tx = cx;
  let ty = cy;
  if (total > 1) {
    const radius = 12;
    if (total === 2) {
      const angle = index * Math.PI; 
      tx = cx + Math.cos(angle) * radius;
      ty = cy + Math.sin(angle) * radius;
    } else if (total === 3) {
      const angle = (index * 2 * Math.PI) / 3 - Math.PI / 2; 
      tx = cx + Math.cos(angle) * radius;
      ty = cy + Math.sin(angle) * radius;
    } else {
      const angle = (index * 2 * Math.PI) / 4 - Math.PI / 4; 
      tx = cx + Math.cos(angle) * radius;
      ty = cy + Math.sin(angle) * radius;
    }
  }

  const tokenLabel = `${(id % 4) + 1}`;

  return (
    <motion.g
      initial={{ x: cx, y: cy, scale: 0.2, opacity: 0 }}
      animate={{ x: tx, y: ty, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 140, damping: 14 }}
      onClick={(e) => {
        e.stopPropagation();
        if (isSelectable) onClick?.();
      }}
      className={`cursor-pointer ${isSelectable ? 'group' : 'pointer-events-none'}`}
    >
      {/* Outer selection halo */}
      {isSelectable && (
        <circle
          cx={0}
          cy={0}
          r={isSelected ? 14 : 11}
          fill="none"
          stroke={colorHex}
          strokeWidth="2.5"
          className="animate-pulse"
          style={{ opacity: isSelected ? 1 : 0.6 }}
        />
      )}

      {/* Shadow */}
      <circle
        cx={0}
        cy={1}
        r="9"
        fill="rgba(0,0,0,0.2)"
      />

      {/* Main Wood Coin */}
      <circle
        cx={0}
        cy={0}
        r="8.5"
        fill={colorHex}
        stroke="#1E293B"
        strokeWidth="1.8"
      />

      {/* Concentric rings pattern */}
      <circle
        cx={0}
        cy={0}
        r="5.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth="1"
      />

      {/* Center detail dot */}
      <circle
        cx={0}
        cy={0}
        r="1.2"
        fill="#FFFFFF"
        opacity="0.8"
      />

      {/* Token label number */}
      <text
        x={0}
        y={2.8}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="7.5"
        fontWeight="black"
        fontFamily="sans-serif"
        className="select-none"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.6)' }}
      >
        {tokenLabel}
      </text>
    </motion.g>
  );
};
