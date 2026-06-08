import React from 'react';
import { SAFE_ZONES } from '../hooks/useThayamGame';
import type { Language } from '../utils/i18n';

interface BoardProps {
  children?: React.ReactNode;
  hoveredMove: { pieceId: number; rollValue: number; path: [number, number][] } | null;
  activeColorHex?: string;
  onCellClick?: (row: number, col: number) => void;
  theme?: 'light' | 'dark';
  lang?: Language;
}

export const Board: React.FC<BoardProps> = ({
  children,
  hoveredMove,
  activeColorHex = '#D97706',
  onCellClick,
  theme = 'light',
  lang = 'en'
}) => {
  const cellSize = 64;
  const padding = 26; 
  const isDark = theme === 'dark';

  const getCellPixelCoords = (row: number, col: number): { x: number; y: number } => {
    return {
      x: padding + col * cellSize + cellSize / 2,
      y: padding + row * cellSize + cellSize / 2,
    };
  };

  return (
    <div 
      className="relative w-full aspect-square max-w-[520px] rounded-2xl p-5 shadow-2xl border-[12px] border-amber-900 dark:border-amber-800 bg-orange-50 dark:bg-[#2A211C] flex items-center justify-center select-none transition-colors duration-300"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(120, 53, 4, 0.25)',
      }}
    >
      {/* Wooden corner accents */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-[6px] border-l-[6px] border-amber-500 rounded-tl-sm opacity-80" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-[6px] border-r-[6px] border-amber-500 rounded-tr-sm opacity-80" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[6px] border-l-[6px] border-amber-500 rounded-bl-sm opacity-80" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[6px] border-r-[6px] border-amber-500 rounded-br-sm opacity-80" />

      {/* Rangoli style kolam pattern in outer canvas corners */}
      <div className="absolute top-3 left-3 text-[10px] text-amber-900/10 dark:text-amber-200/10 pointer-events-none font-serif select-none">𑿀</div>
      <div className="absolute top-3 right-3 text-[10px] text-amber-900/10 dark:text-amber-200/10 pointer-events-none font-serif select-none">𑿀</div>
      <div className="absolute bottom-3 left-3 text-[10px] text-amber-900/10 dark:text-amber-200/10 pointer-events-none font-serif select-none">𑿀</div>
      <div className="absolute bottom-3 right-3 text-[10px] text-amber-900/10 dark:text-amber-200/10 pointer-events-none font-serif select-none">𑿀</div>

      <svg 
        className="w-full h-full filter drop-shadow-sm"
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Draw Board Grid */}
        {Array.from({ length: 7 }).map((_, r) =>
          Array.from({ length: 7 }).map((_, c) => {
            const x = padding + c * cellSize;
            const y = padding + r * cellSize;
            const key = `${r},${c}`;
            const isSafe = SAFE_ZONES.includes(key);
            const isCenter = r === 3 && c === 3;

            const cellFill = isCenter 
              ? (isDark ? "#3A2C21" : "#FFF9E6") 
              : isSafe 
                ? (isDark ? "#31231D" : "#FFFBF0") 
                : (isDark ? "#231B17" : "#FFFFFF");
            const strokeColor = isDark ? "#4D3A2F" : "#1C1917";
            const coordColor = isDark ? "#A16207" : "#B45309";

            return (
              <g 
                key={key} 
                onClick={() => onCellClick?.(r, c)}
                className="cursor-pointer"
              >
                {/* Cell Base */}
                <rect 
                  x={x} 
                  y={y} 
                  width={cellSize} 
                  height={cellSize} 
                  fill={cellFill} 
                  stroke={strokeColor} 
                  strokeWidth="2.5"
                />

                {/* Grid coordinate helper */}
                <text x={x+4} y={y+10} fill={coordColor} fontSize="6.5" fontWeight="bold" opacity="0.35" fontFamily="Courier">
                  {r},{c}
                </text>
                
                {/* Safe cell traditional cross design */}
                {isSafe && !isCenter && (
                  <g>
                    {/* Diagonal crosses */}
                    <line x1={x} y1={y} x2={x + cellSize} y2={y + cellSize} stroke="#DC2626" strokeWidth="2" />
                    <line x1={x + cellSize} y1={y} x2={x} y2={y + cellSize} stroke="#DC2626" strokeWidth="2" />
                    <rect x={x+4} y={y+4} width={cellSize-8} height={cellSize-8} fill="none" stroke="#D97706" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4" />
                  </g>
                )}

                {/* Center Home Rangoli detail */}
                {isCenter && (
                  <g>
                    <line x1={x} y1={y} x2={x + cellSize} y2={y + cellSize} stroke="#D97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                    <line x1={x + cellSize} y1={y} x2={x} y2={y + cellSize} stroke="#D97706" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                    
                    <circle cx={x + cellSize/2} cy={y + cellSize/2} r="22" fill="none" stroke="#D97706" strokeWidth="2" />
                    <circle cx={x + cellSize/2} cy={y + cellSize/2} r="17" fill={isDark ? "#3F3024" : "#FEF3C7"} stroke="#B45309" strokeWidth="1.2" />
                    
                    <circle cx={x + cellSize/2} cy={y + cellSize/2} r="6" fill="#B45309" />
                    
                    {/* Petals */}
                    <path d={`M ${x+cellSize/2} ${y+8} Q ${x+cellSize/2 - 4} ${y+13} ${x+cellSize/2} ${y+16} Q ${x+cellSize/2 + 4} ${y+13} ${x+cellSize/2} ${y+8}`} fill="#DC2626" />
                    <path d={`M ${x+cellSize/2} ${y+cellSize-8} Q ${x+cellSize/2 - 4} ${y+cellSize-13} ${x+cellSize/2} ${y+cellSize-16} Q ${x+cellSize/2 + 4} ${y+cellSize-13} ${x+cellSize/2} ${y+cellSize-8}`} fill="#DC2626" />
                    <path d={`M ${x+8} ${y+cellSize/2} Q ${x+13} ${y+cellSize/2 - 4} ${x+16} ${y+cellSize/2} Q ${x+13} ${y+cellSize/2 + 4} ${x+8} ${y+cellSize/2}`} fill="#DC2626" />
                    <path d={`M ${x+cellSize-8} ${y+cellSize/2} Q ${x+cellSize-13} ${y+cellSize/2 - 4} ${x+cellSize-16} ${y+cellSize/2} Q ${x+cellSize-13} ${y+cellSize/2 + 4} ${x+cellSize-8} ${y+cellSize/2}`} fill="#DC2626" />

                    <text 
                      x={x + cellSize/2} 
                      y={y + cellSize/2 + 3} 
                      textAnchor="middle" 
                      fill="#FFFFFF" 
                      fontSize="7" 
                      fontWeight="black" 
                      fontFamily="sans-serif"
                    >
                      {lang === 'en' ? 'HOME' : 'இல்லம்'}
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}

        {/* Highlight start quadrants indicators */}
        <path d="M 218 474 L 282 474" stroke="#EF4444" strokeWidth="4.5" />
        <path d="M 26 218 L 26 282" stroke="#3B82F6" strokeWidth="4.5" />
        <path d="M 218 26 L 282 26" stroke="#10B981" strokeWidth="4.5" />
        <path d="M 474 218 L 474 282" stroke="#F5B041" strokeWidth="4.5" />

        {/* Hovered Path Preview overlay */}
        {hoveredMove && hoveredMove.path && (
          <g>
            {hoveredMove.path.map((coord, idx) => {
              const prevCoord = idx === 0 ? null : hoveredMove.path[idx - 1];
              const startPixel = prevCoord ? getCellPixelCoords(prevCoord[0], prevCoord[1]) : null;
              const endPixel = getCellPixelCoords(coord[0], coord[1]);

              return (
                <g key={idx}>
                  {startPixel && (
                    <line 
                      x1={startPixel.x} 
                      y1={startPixel.y} 
                      x2={endPixel.x} 
                      y2={endPixel.y} 
                      stroke={activeColorHex} 
                      strokeWidth="4" 
                      strokeLinecap="round"
                      strokeDasharray="3, 4"
                      opacity="0.8"
                    />
                  )}
                  <circle 
                    cx={endPixel.x} 
                    cy={endPixel.y} 
                    r="4" 
                    fill={activeColorHex} 
                    stroke="#FFFFFF" 
                    strokeWidth="1.2"
                    opacity="0.95"
                  />
                </g>
              );
            })}
          </g>
        )}

        {children}
      </svg>
    </div>
  );
};
