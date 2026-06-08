import React, { useState, useEffect } from 'react';
import { useThayamGame, getPlayerPath } from '../hooks/useThayamGame';
import { Board } from './Board';
import { Token } from './Token';
import { Dice3D } from './Dice3D';
import { Chat } from './Chat';
import { Victory } from './Victory';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import { Volume2, VolumeX, RotateCcw, ArrowLeft, Lightbulb, List, Cpu, User, Sun, Moon } from 'lucide-react';

interface GameClientProps {
  onBackToLanding: () => void;
  config: {
    roomId: string;
    mode: 'single' | 'multi';
    gameType: 'single' | 'team';
    difficulty?: 'easy' | 'medium' | 'hard';
    players: Array<{
      id: number;
      name: string;
      color: string;
      colorHex: string;
      glowColor: string;
      isAI: boolean;
      team: 'A' | 'B';
    }>;
    localPlayerId: number;
    isMultiplayerHost: boolean;
  };
  lang: Language;
  onLanguageToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export const GameClient: React.FC<GameClientProps> = ({ 
  onBackToLanding, 
  config, 
  lang,
  onLanguageToggle,
  theme,
  onThemeToggle
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';

  const {
    players,
    pieces,
    currentTurn,
    rolls,
    rollHistory,
    turnState,
    diceValue,
    winner,
    winningTeam,
    logs,
    isRollingAnimation,
    matchTime,
    localPlayerId,
    gameMode,
    gameType,
    isHost,
    roomId,
    getBoardPiecesLayout,
    getValidMovesForPiece,
    getActiveValidMoves,
    movePiece,
    rollDice,
    resetGame,
    initGame,
    addLog
  } = useThayamGame();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'log'>('ai');
  const [hoveredMove, setHoveredMove] = useState<{ pieceId: number; rollValue: number; path: [number, number][] } | null>(null);

  // Initialize gameplay states using config passed from Lobby/Start screen
  useEffect(() => {
    initGame(config);
  }, [config, initGame]);

  const activePlayer = players[currentTurn];
  const isMyTurn = gameMode === 'single' ? !activePlayer.isAI : currentTurn === localPlayerId;

  // Format match timer (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePieceClick = (pieceId: number) => {
    if (!isMyTurn || turnState !== 'moving') return;

    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.playerId !== currentTurn) return;

    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null);
      setHoveredMove(null);
    } else {
      setSelectedPieceId(pieceId);
    }
  };

  const executeMove = (pieceId: number, rollValue: number) => {
    movePiece(pieceId, rollValue);
    setSelectedPieceId(null);
    setHoveredMove(null);
  };

  const layout = getBoardPiecesLayout();
  const validMoves = getActiveValidMoves();

  // Score prediction scorer for HUD list helper
  const sortedHeuristicMoves = [...validMoves].map((move) => {
    let score = 0;
    const piece = pieces.find((p) => p.id === move.pieceId)!;
    if (move.targetIndex === 24) score += 5000;
    if (move.captures) score += 1000;
    if (piece.indexInPath === -1 && move.targetIndex === 0) score += 600;
    score += move.targetIndex * 15;
    return { ...move, score };
  }).sort((a, b) => b.score - a.score);

  return (
    <div 
      className="h-screen overflow-hidden flex flex-col font-sans select-none transition-colors duration-300"
      style={
        isDark
          ? {
              backgroundColor: '#120F0D',
              backgroundImage: 'radial-gradient(circle at center, #1C1714 0%, #0D0B0A 100%)'
            }
          : {
              backgroundColor: '#FAF8F5',
              backgroundImage: 'radial-gradient(circle at center, #FFFFFF 0%, #F6F2E9 100%)'
            }
      }
    >
      <header className="bg-amber-900 dark:bg-stone-950 text-amber-50 px-4 py-3 border-b-4 border-amber-900 dark:border-amber-800 flex flex-wrap items-center justify-between shadow-md gap-3 z-10 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBackToLanding}
            className="p-1.5 bg-amber-900/45 dark:bg-stone-900/40 hover:bg-amber-950 dark:hover:bg-stone-850 rounded-lg text-amber-100 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <img src="/Thayam-logo.png" alt="Thayam Logo" className="h-8 w-auto object-contain" />
          <div>
            <h1 className="font-serif font-black tracking-widest text-sm md:text-base leading-none">
              {t.title}
            </h1>
            {gameMode === 'multi' && (
              <span className="text-[9px] font-bold text-amber-200 dark:text-amber-400 tracking-wider">
                {lang === 'en' ? 'ROOM' : 'அறை'}: {roomId}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <button 
            onClick={onLanguageToggle}
            className="px-2 py-1.5 border border-amber-50/20 hover:border-amber-50 rounded-lg text-[10px] font-bold uppercase transition bg-amber-900/20 text-amber-100 hover:text-white"
          >
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onThemeToggle}
            className="p-1.5 rounded-lg border border-amber-50/20 hover:border-amber-50 text-amber-100 hover:text-white transition bg-amber-900/20"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Sound Toggle */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg border border-amber-50/20 hover:border-amber-50 text-amber-100 hover:text-white transition bg-amber-900/20"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          {isHost && (
            <button 
              onClick={() => resetGame()}
              className="p-1.5 rounded-lg border border-amber-50/20 hover:border-amber-50 text-amber-100 hover:text-white transition bg-amber-900/20"
              title="Restart Match"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>
      
      {/* 2. Main content grids */}
      <div className="h-0 flex-grow overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full items-stretch">
        
        {/* Left Column: Player Cards (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col overflow-hidden h-full">
          
          {/* Duration & Active Rolls Side-by-Side Panel */}
          <div className="grid grid-cols-2 gap-3 mb-3 flex-shrink-0">
            {/* Duration Box */}
            <div className="bg-white dark:bg-[#1E1815] border-4 border-amber-900 dark:border-amber-800 rounded-2xl p-2.5 flex items-center justify-between shadow-md transition-colors duration-300">
              <div className="flex flex-col text-left">
                <span className="text-[8px] text-stone-400 dark:text-stone-505 font-bold uppercase tracking-wider leading-none">
                  ⏱️ {t.duration}
                </span>
                <span className="text-xs font-extrabold font-mono text-amber-950 dark:text-amber-305 mt-1 leading-none">
                  {formatTime(matchTime)}
                </span>
              </div>
            </div>

            {/* Active Rolls Box */}
            <div className="bg-white dark:bg-[#1E1815] border-4 border-amber-900 dark:border-amber-800 rounded-2xl p-2.5 flex flex-col justify-center shadow-md transition-colors duration-300 text-left">
              <span className="text-[8px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block mb-1 leading-none">
                🎲 {t.activeRolls}
              </span>
              <div className="flex flex-wrap gap-0.5 items-center min-h-[16px]">
                {rolls.length === 0 ? (
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 italic">
                    {t.emptyStack}
                  </span>
                ) : (
                  rolls.map((r, idx) => (
                    <span 
                      key={idx} 
                      className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-500/30 rounded text-[8px] font-bold uppercase tracking-wider shadow-sm animate-pulse"
                    >
                      {r === 1 ? (lang === 'en' ? 'T1' : 'தா') : r}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1E1815] border-4 border-amber-900 dark:border-amber-800 rounded-2xl p-3 flex-grow flex flex-col shadow-lg transition-colors duration-300 overflow-hidden">
            <h3 className="font-serif font-bold text-amber-900 dark:text-amber-100 border-b border-stone-200 dark:border-stone-850 pb-1.5 mb-2 text-xs flex-shrink-0">
              {t.warriorsRoster}
            </h3>
            
            <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-grow overflow-hidden">
              {players.map((p) => {
                const isActive = p.id === currentTurn;
                const pPieces = pieces.filter((pc) => pc.playerId === p.id);
                const atBase = pPieces.filter((pc) => pc.indexInPath === -1).length;
                const atHome = pPieces.filter((pc) => pc.indexInPath === 24).length;
                const onBoard = pPieces.filter((pc) => pc.indexInPath >= 0 && pc.indexInPath < 24).length;

                return (
                  <div 
                    key={p.id}
                    className={`p-2 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                      isActive 
                        ? 'bg-amber-50/60 dark:bg-amber-900/20 border-amber-600 dark:border-amber-550 shadow-sm ring-1 ring-amber-500/20' 
                        : 'bg-stone-50/40 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span 
                          className="w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ 
                            backgroundColor: p.colorHex, 
                            boxShadow: `0 0 4px ${p.colorHex}` 
                          }} 
                        />
                        <span className="font-bold text-[11px] text-stone-800 dark:text-stone-200 truncate" title={p.name}>
                          {p.name}
                        </span>
                      </div>
                      
                      <div className="text-[7.5px] font-bold text-stone-450 dark:text-stone-550 flex items-center space-x-0.5 flex-shrink-0">
                        {p.isAI ? (
                          <>
                            <Cpu className="w-2 h-2" />
                            <span>{t.bot}</span>
                          </>
                        ) : (
                          <>
                            <User className="w-2 h-2 text-amber-900 dark:text-amber-400" />
                            <span>{lang === 'en' ? 'MAN' : 'மனு'}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-stone-200/40 dark:border-stone-800/40 text-center text-stone-700 dark:text-stone-300">
                      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 p-1 rounded">
                        <span className="text-[8px] text-stone-400 dark:text-stone-550 block font-semibold leading-none">{t.base}</span>
                        <span className="text-[11px] font-extrabold leading-tight">{atBase}</span>
                      </div>
                      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 p-1 rounded">
                        <span className="text-[8px] text-stone-400 dark:text-stone-550 block font-semibold leading-none">{t.board}</span>
                        <span className="text-[11px] font-extrabold text-amber-900 dark:text-amber-300 leading-tight">{onBoard}</span>
                      </div>
                      <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 p-1 rounded">
                        <span className="text-[8px] text-stone-400 dark:text-stone-550 block font-semibold leading-none">{t.home}</span>
                        <span className="text-[11px] font-extrabold text-green-650 dark:text-green-400 leading-tight">{atHome}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick reminder card */}
            <div className="mt-2 p-1.5 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-900/10 dark:border-amber-800/10 rounded-lg text-[9px] leading-tight text-amber-900/90 dark:text-amber-300 font-medium flex-shrink-0">
              <span className="font-bold">{lang === 'en' ? 'RULE:' : 'விதி:'}</span>{' '}
              {gameType === 'team' 
                ? (lang === 'en' ? 'Red & Green vs Blue & Yellow. Capture enemies.' : 'சிவப்பு & பச்சை vs நீலம் & மஞ்சள். வெட்டுங்கள்.')
                : (lang === 'en' ? 'Capture opponents and race to HOME!' : 'எதிரிகளை வெட்டி இல்லம் நோக்கி ஓடுங்கள்!')}
            </div>
          </div>
        </div>

        {/* Center Column: Board (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center overflow-hidden h-full">
          {/* Responsive board */}
          <Board
            hoveredMove={hoveredMove}
            activeColorHex={activePlayer?.colorHex}
            theme={theme}
            lang={lang}
          >
            {/* Draw active tokens on top of board SVG */}
            {Object.entries(layout).map(([cellKey, cellPieces]) => {
              const [rStr, cStr] = cellKey.split(',');
              const row = parseInt(rStr);
              const col = parseInt(cStr);

              return cellPieces.map((piece, idx) => {
                const player = players[piece.playerId];
                const isSelectable = turnState === 'moving' && piece.playerId === currentTurn && isMyTurn;
                const isSelected = selectedPieceId === piece.id;

                return (
                  <Token
                    key={piece.id}
                    id={piece.id}
                    playerId={piece.playerId}
                    row={row}
                    col={col}
                    colorHex={player.colorHex}
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    index={idx}
                    total={cellPieces.length}
                    onClick={() => handlePieceClick(piece.id)}
                  />
                );
              });
            })}
          </Board>
        </div>

        {/* Right Column: Console Log, Roll, & Chat (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-3 overflow-hidden h-full">
          
          {/* Rolling Dashboard Pad - Placed Top Right */}
          <div className="bg-white dark:bg-[#1E1815] border-4 border-amber-900 dark:border-amber-800 rounded-2xl p-2.5 flex flex-col items-center shadow-lg transition-colors duration-300 flex-shrink-0">
            <div className="flex flex-col items-center text-center w-full space-y-2">
              {/* 3D Dice */}
              <Dice3D
                value={diceValue}
                isRolling={isRollingAnimation}
                onRoll={rollDice}
                disabled={turnState !== 'rolling' || !isMyTurn}
              />

              <div className="w-full">
                <span className="text-[8px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block leading-none">
                  {t.activeWarriorTurn}
                </span>
                <span 
                  className="text-xs font-extrabold tracking-wide block uppercase mt-0.5 leading-none" 
                  style={{ color: activePlayer?.colorHex }}
                >
                  {activePlayer?.name} {isMyTurn ? `(${lang === 'en' ? 'YOU' : 'நீங்கள்'})` : ''}
                </span>
                <span className="text-[9px] text-stone-500 dark:text-stone-400 font-semibold block mt-0.5 leading-none">
                  {turnState === 'rolling' 
                    ? t.awaitingDiceRoll 
                    : t.selectHighlightedToken}
                </span>
              </div>

              {/* Action/Status button */}
              <div className="w-full flex justify-center pt-0.5">
                {turnState === 'rolling' && isMyTurn && (
                  <button
                    onClick={rollDice}
                    disabled={isRollingAnimation}
                    className="w-full py-1.5 bg-amber-900 dark:bg-amber-850 hover:bg-amber-800 dark:hover:bg-amber-750 disabled:opacity-50 text-amber-50 rounded-xl font-bold text-[10px] uppercase tracking-wider transition active:scale-95 shadow-sm"
                  >
                    {isRollingAnimation ? t.throwing : t.throwDice}
                  </button>
                )}

                {turnState === 'moving' && isMyTurn && (
                  <span className="w-full text-center py-1 border border-dashed border-amber-550 text-amber-800 dark:text-amber-400 text-[8px] font-bold uppercase tracking-widest rounded-lg animate-pulse">
                    {t.selectUnitBelow}
                  </span>
                )}

                {!isMyTurn && activePlayer?.isAI && (
                  <span className="w-full text-center py-1 bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 text-[8px] font-bold uppercase tracking-wider rounded-lg">
                    {t.aiThinking}
                  </span>
                )}

                {!isMyTurn && !activePlayer?.isAI && (
                  <span className="w-full text-center py-1 bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 text-[8px] font-bold uppercase tracking-wider rounded-lg">
                    {t.waitingForPlayer}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Roster logs / AI assistance tabs */}
          <div className="bg-white dark:bg-[#1E1815] border-4 border-amber-900 dark:border-amber-800 rounded-2xl p-3 flex-shrink-0 flex flex-col h-[170px] shadow-lg transition-colors duration-300 overflow-hidden">
            
            {/* HUD Tabs */}
            <div className="flex border-b border-stone-200 dark:border-stone-800 mb-3 text-xs font-bold">
              <button 
                onClick={() => setActiveTab('ai')}
                className={`flex-1 pb-2 tracking-widest flex items-center justify-center space-x-1.5 ${
                  activeTab === 'ai' 
                    ? 'text-amber-900 dark:text-amber-100 border-b-2 border-amber-900 dark:border-amber-450' 
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{t.aiAnalysis}</span>
              </button>
              <button 
                onClick={() => setActiveTab('log')}
                className={`flex-1 pb-2 tracking-widest flex items-center justify-center space-x-1.5 ${
                  activeTab === 'log' 
                    ? 'text-amber-900 dark:text-amber-100 border-b-2 border-amber-900 dark:border-amber-450' 
                    : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{t.turnLogs}</span>
              </button>
            </div>

            {/* TAB 1: AI SUGGESTIONS HUD */}
            {activeTab === 'ai' && (
              <div className="flex-grow flex flex-col justify-between overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 text-xs text-stone-800 dark:text-stone-200">
                  
                  {/* Selected Piece Actions list */}
                  {selectedPieceId !== null ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-lg">
                        <span className="text-[9px] text-stone-400 dark:text-stone-500 block font-bold">{t.selectedUnit}</span>
                        <span className="font-bold text-amber-905 dark:text-amber-300 uppercase">
                          {lang === 'en' ? 'Piece' : 'காய்'} {(selectedPieceId % 4) + 1}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {rolls.map((r, idx) => {
                          const piece = pieces.find(p => p.id === selectedPieceId)!;
                          const move = getValidMovesForPiece(piece, r);
                          
                          if (!move) {
                            return (
                              <div key={idx} className="p-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-855 rounded-lg text-stone-450 dark:text-stone-500 text-[10px] italic flex justify-between">
                                <span>{lang === 'en' ? 'Move' : 'நகர்வு'} +{r}</span>
                                <span>{t.blocked}</span>
                              </div>
                            );
                          }
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => executeMove(selectedPieceId, r)}
                              onMouseEnter={() => setHoveredMove({ pieceId: selectedPieceId, rollValue: r, path: move.pathCoords })}
                              onMouseLeave={() => setHoveredMove(null)}
                              className="w-full text-left p-2.5 border border-amber-900/10 dark:border-amber-800/10 hover:border-amber-900 dark:hover:border-amber-600 bg-stone-50 dark:bg-stone-900 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-stone-800 dark:text-stone-250 block">{lang === 'en' ? 'Move' : 'நகர்வு'} +{r}</span>
                                <span className="text-[9px] text-stone-450 dark:text-stone-450">
                                  {move.targetIndex === 24 
                                    ? t.landExactlyInGoal 
                                    : `${t.landAtCell} (${move.pathCoords[move.pathCoords.length-1][0]},${move.pathCoords[move.pathCoords.length-1][1]})`}
                                </span>
                              </div>
                              <span className="text-[9px] font-bold text-green-605 dark:text-green-400">
                                {move.captures ? '🗡️ CUT!' : t.safe}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // General suggestions
                    <div className="space-y-3">
                      {isMyTurn && turnState === 'moving' && sortedHeuristicMoves.length > 0 ? (
                        <div className="space-y-2">
                          <span className="text-[9px] text-amber-900 dark:text-amber-305 font-bold uppercase tracking-wider block">
                            {t.recommendedVectors}
                          </span>
                          
                          {sortedHeuristicMoves.map((m, idx) => {
                            const pNum = (m.pieceId % 4) + 1;
                            const path = getPlayerPath(currentTurn);
                            const cell = path[m.targetIndex];

                            return (
                              <div
                                key={idx}
                                onMouseEnter={() => setHoveredMove({ pieceId: m.pieceId, rollValue: m.rollValue, path: m.pathCoords })}
                                onMouseLeave={() => setHoveredMove(null)}
                                className={`p-2.5 border rounded-xl flex items-center justify-between transition cursor-pointer hover:bg-amber-50/30 dark:hover:bg-amber-900/10 ${
                                  idx === 0 
                                    ? 'border-green-400 dark:border-green-800 bg-green-50/20 dark:bg-green-950/10' 
                                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/30'
                                }`}
                                onClick={() => handlePieceClick(m.pieceId)}
                              >
                                <div>
                                  <span className={`text-[9px] font-bold block ${idx === 0 ? 'text-green-600 dark:text-green-400' : 'text-stone-550 dark:text-stone-455'}`}>
                                    {idx === 0 ? `⭐ ${t.recommendedMove}` : `${t.alternativeMove}`}
                                  </span>
                                  <span className="font-bold text-stone-805 dark:text-stone-200 mt-0.5 block">
                                    {lang === 'en' ? 'Piece' : 'காய்'} {pNum} &rarr; ({cell[0]},{cell[1]})
                                  </span>
                                  <span className="text-[9px] text-stone-405 dark:text-stone-500 block font-semibold">{t.usingRoll} {m.rollValue}</span>
                                </div>
                                <span className={`text-[10px] font-bold ${idx === 0 ? 'text-green-605 dark:text-green-400' : 'text-amber-800 dark:text-amber-305'}`}>
                                  {m.captures ? '🗡️ CUT!' : t.safe}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-stone-455 dark:text-stone-505 py-8 italic leading-relaxed">
                          {t.awaitingMoveSuggestion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TURN LOGS LIST */}
            {activeTab === 'log' && (
              <div className="flex-grow flex flex-col justify-between overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-1.5 pr-1 text-[11px] font-mono text-stone-600 dark:text-stone-400">
                  {logs.length === 0 ? (
                    <div className="text-center text-stone-400 dark:text-stone-505 py-8 italic">{t.noRecordsYet}</div>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={log.id || idx} className="border-b border-stone-100 dark:border-stone-900 pb-1">
                        <span className="text-[9px] text-stone-400 dark:text-stone-555 mr-1.5">{log.timestamp}</span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Chat Widget */}
          <div className="flex-grow overflow-hidden">
            <Chat
              messages={logs.map(l => ({
                id: l.id,
                senderName: players[currentTurn]?.name || (lang === 'en' ? 'System' : 'அமைப்பு'),
                message: l.message,
                timestamp: l.timestamp
              })).slice(0, 5)}
              onSendMessage={(msg) => addLog(localPlayerId, msg)}
              senderName={players[localPlayerId]?.name || (lang === 'en' ? 'Player' : 'வீரர்')}
              lang={lang}
            />
          </div>
        </div>
      </div>

      {/* 3. Victory Screen Modal Trigger */}
      {winner !== null && (
        <Victory
          winnerName={players[winner]?.name || `${lang === 'en' ? 'Warrior' : 'வீரர்'} ${winner + 1}`}
          winningTeam={winningTeam}
          stats={{
            totalRolls: rollHistory.length,
            captures: logs.filter((l) => l.message.includes('💥 CUT!') || l.message.includes('captured')).length,
            duration: formatTime(matchTime)
          }}
          onPlayAgain={() => resetGame()}
          onReturnHome={onBackToLanding}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
};
