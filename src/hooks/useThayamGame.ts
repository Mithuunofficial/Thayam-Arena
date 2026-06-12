import { useState, useEffect, useCallback, useRef } from 'react';
import { soundManager } from '../utils/audio';
import { dbService } from '../supabase/db';
import type { RoomState } from '../supabase/db';

export const OUTER_LOOP: [number, number][] = [
  [6, 3], [6, 4], [6, 5], [6, 6], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
  [5, 0], [6, 0], [6, 1], [6, 2]
];

export const MIDDLE_LOOP: [number, number][] = [
  [5, 3], [5, 4], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5], [1, 4],
  [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [5, 2]
];

export const INNER_LOOP: [number, number][] = [
  [4, 3], [4, 4], [3, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2]
];

export const SAFE_ZONES = ['6,3', '3,0', '0,3', '3,6', '1,1', '1,5', '5,1', '5,5', '3,3'];

export const GOAL_INDEX = 48;

export interface Player {
  id: number;
  name: string;
  color: string;
  colorHex: string;
  glowColor: string;
  isAI: boolean;
  team: 'A' | 'B';
}

export interface Piece {
  id: number;
  playerId: number;
  indexInPath: number; 
}

export interface LogEntry {
  id: string;
  playerId: number;
  message: string;
  timestamp: string;
}

export function getPlayerPath(playerId: number): [number, number][] {
  const adjustedPlayerIndex = (4 - playerId) % 4;
  
  const outerStart = adjustedPlayerIndex * 6;
  const outerPath = [...OUTER_LOOP.slice(outerStart), ...OUTER_LOOP.slice(0, outerStart)];
  
  const middleStart = adjustedPlayerIndex * 4;
  const middlePath = [...MIDDLE_LOOP.slice(middleStart), ...MIDDLE_LOOP.slice(0, middleStart)];
  
  const innerStart = adjustedPlayerIndex * 2;
  const innerPath = [...INNER_LOOP.slice(innerStart), ...INNER_LOOP.slice(0, innerStart)];
  
  return [...outerPath, ...middlePath, ...innerPath, [3, 3]];
}

const INITIAL_PLAYERS: Player[] = [
  { id: 0, name: 'RED WARRIOR', color: 'red', colorHex: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.6)', isAI: false, team: 'A' },
  { id: 1, name: 'BLUE WARRIOR', color: 'blue', colorHex: '#3B82F6', glowColor: 'rgba(59, 130, 246, 0.6)', isAI: true, team: 'B' },
  { id: 2, name: 'GREEN WARRIOR', color: 'green', colorHex: '#10B981', glowColor: 'rgba(16, 185, 129, 0.6)', isAI: true, team: 'A' },
  { id: 3, name: 'YELLOW WARRIOR', color: 'yellow', colorHex: '#F5B041', glowColor: 'rgba(245, 176, 65, 0.6)', isAI: true, team: 'B' },
];

export function useThayamGame() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [rolls, setRolls] = useState<number[]>([]);
  const [rollHistory, setRollHistory] = useState<number[]>([]);
  const [turnState, setTurnState] = useState<'rolling' | 'moving' | 'game_over'>('rolling');
  const [lastShells, setLastShells] = useState<number[]>([1]); 
  const [diceValue, setDiceValue] = useState<number>(1);
  const [hasBonusTurn, setHasBonusTurn] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [winningTeam, setWinningTeam] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRollingAnimation, setIsRollingAnimation] = useState<boolean>(false);
  const [matchTime, setMatchTime] = useState<number>(0);

  // Configuration settings
  const [roomId, setRoomId] = useState<string>('');
  const [gameMode, setGameMode] = useState<'single' | 'multi'>('single');
  const [gameType, setGameType] = useState<'single' | 'team'>('single');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [localPlayerId, setLocalPlayerId] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);

  // Synchronous local state updates to database if multiplayer
  const syncToDb = useCallback(async (updates: Partial<RoomState>) => {
    if (gameMode === 'multi' && roomId) {
      await dbService.updateRoom(roomId, updates);
    }
  }, [gameMode, roomId]);

  const addLog = useCallback((playerId: number, message: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog = { id: Math.random().toString(), playerId, message, timestamp: timeStr };
    
    setLogs((l) => [newLog, ...l.slice(0, 49)]);

    if (gameMode === 'multi' && roomId) {
      dbService.addChatMessage(roomId, {
        id: newLog.id,
        senderName: players[playerId]?.name || `Player ${playerId + 1}`,
        message: newLog.message,
        timestamp: newLog.timestamp
      });
    }
  }, [gameMode, roomId, players]);

  // Coordinates formatting
  const getCellKey = (coord: [number, number]) => `${coord[0]},${coord[1]}`;

  const getBoardPiecesLayout = useCallback(() => {
    const layout: Record<string, Piece[]> = {};
    pieces.forEach((p) => {
      if (p.indexInPath >= 0 && p.indexInPath < GOAL_INDEX) {
        const path = getPlayerPath(p.playerId);
        const cell = path[p.indexInPath];
        const key = getCellKey(cell);
        if (!layout[key]) layout[key] = [];
        layout[key].push(p);
      }
    });
    return layout;
  }, [pieces]);

  const isCellBlockaded = useCallback((coord: [number, number], activePlayerId: number) => {
    const key = getCellKey(coord);
    const layout = getBoardPiecesLayout();
    const piecesOnCell = layout[key] || [];
    if (piecesOnCell.length >= 2) {
      if (piecesOnCell[0].playerId !== activePlayerId) {
        // If team mode, partners do NOT blockade each other
        if (gameType === 'team') {
          const activeTeam = activePlayerId === 0 || activePlayerId === 2 ? 'A' : 'B';
          const cellTeam = piecesOnCell[0].playerId === 0 || piecesOnCell[0].playerId === 2 ? 'A' : 'B';
          if (activeTeam === cellTeam) return false;
        }
        return true;
      }
    }
    return false;
  }, [getBoardPiecesLayout, gameType]);

  const getValidMovesForPiece = useCallback((piece: Piece, rollValue: number): { targetIndex: number; captures: boolean; pathCoords: [number, number][] } | null => {
    if (piece.playerId !== currentTurn) return null;
    if (piece.indexInPath === GOAL_INDEX) return null; 

    const path = getPlayerPath(piece.playerId);

    if (piece.indexInPath === -1) {
      if (rollValue !== 1) return null; // Must roll 1 (Thayam) to enter board
      const targetCell = path[0];
      if (isCellBlockaded(targetCell, piece.playerId)) return null;
      return { targetIndex: 0, captures: false, pathCoords: [targetCell] };
    }

    const targetIndex = piece.indexInPath + rollValue;
    if (targetIndex > GOAL_INDEX) return null; 

    const pathCoords: [number, number][] = [];
    for (let idx = piece.indexInPath + 1; idx <= targetIndex; idx++) {
      const cell = path[idx];
      pathCoords.push(cell);
      
      if (isCellBlockaded(cell, piece.playerId)) return null;
    }

    const targetCell = path[targetIndex];
    const targetCellKey = getCellKey(targetCell);

    let captures = false;
    if (!SAFE_ZONES.includes(targetCellKey)) {
      const layout = getBoardPiecesLayout();
      const enemiesOnTarget = (layout[targetCellKey] || []).filter((p) => {
        if (gameType === 'team') {
          const activeTeam = piece.playerId === 0 || piece.playerId === 2 ? 'A' : 'B';
          const enemyTeam = p.playerId === 0 || p.playerId === 2 ? 'A' : 'B';
          return activeTeam !== enemyTeam;
        }
        return p.playerId !== piece.playerId;
      });

      if (enemiesOnTarget.length === 1) {
        captures = true;
      }
    }

    return { targetIndex, captures, pathCoords };
  }, [currentTurn, isCellBlockaded, getBoardPiecesLayout, gameType]);

  const getActiveValidMoves = useCallback(() => {
    const valid: { pieceId: number; rollValue: number; targetIndex: number; captures: boolean; pathCoords: [number, number][] }[] = [];
    const playerPieces = pieces.filter((p) => p.playerId === currentTurn);
    const uniqueRolls = Array.from(new Set(rolls));

    playerPieces.forEach((piece) => {
      uniqueRolls.forEach((r) => {
        const move = getValidMovesForPiece(piece, r);
        if (move) {
          valid.push({
            pieceId: piece.id,
            rollValue: r,
            ...move
          });
        }
      });
    });

    return valid;
  }, [pieces, currentTurn, rolls, getValidMovesForPiece]);

  // Check Team Victory
  const checkTeamVictory = useCallback((statePieces: Piece[]) => {
    if (gameType === 'team') {
      const teamAPieces = statePieces.filter((p) => p.playerId === 0 || p.playerId === 2);
      const teamBPieces = statePieces.filter((p) => p.playerId === 1 || p.playerId === 3);

      const teamAHome = teamAPieces.every((p) => p.indexInPath === GOAL_INDEX);
      const teamBHome = teamBPieces.every((p) => p.indexInPath === GOAL_INDEX);

      if (teamAHome) {
        setWinner(0);
        setWinningTeam("Team A (Red & Green)");
        setTurnState('game_over');
        soundManager.playVictory();
        return true;
      }
      if (teamBHome) {
        setWinner(1);
        setWinningTeam("Team B (Blue & Yellow)");
        setTurnState('game_over');
        soundManager.playVictory();
        return true;
      }
    } else {
      for (let p = 0; p < 4; p++) {
        const pPieces = statePieces.filter((pc) => pc.playerId === p);
        if (pPieces.every((pc) => pc.indexInPath === GOAL_INDEX)) {
          setWinner(p);
          setWinningTeam(null);
          setTurnState('game_over');
          soundManager.playVictory();
          return true;
        }
      }
    }
    return false;
  }, [gameType]);

  const passTurn = useCallback((nextPlayerOverride?: number, currentPiecesState?: Piece[]) => {
    let nextPlayer = nextPlayerOverride !== undefined ? nextPlayerOverride : (currentTurn + 1) % 4;
    const activePieces = currentPiecesState || pieces;

    if (checkTeamVictory(activePieces)) {
      syncToDb({
        winner: 0,
        turnState: 'game_over'
      });
      return;
    }

    setRolls([]);
    setRollHistory([]);
    setTurnState('rolling');
    setCurrentTurn(nextPlayer);
    setHasBonusTurn(false);
    addLog(nextPlayer, `🎮 Turn passed. Awaiting dice roll.`);

    syncToDb({
      currentTurn: nextPlayer,
      rolls: [],
      rollHistory: [],
      turnState: 'rolling',
      hasBonusTurn: false
    });
  }, [currentTurn, pieces, addLog, checkTeamVictory, syncToDb]);

  const checkTurnProgress = useCallback((updatedRolls: number[], updatedPieces: Piece[], currentBonus: boolean) => {
    if (checkTeamVictory(updatedPieces)) {
      syncToDb({
        winner: currentTurn,
        turnState: 'game_over'
      });
      return;
    }

    if (updatedRolls.length === 0) {
      if (currentBonus) {
        setRolls([]);
        setRollHistory([]);
        setTurnState('rolling');
        setHasBonusTurn(false);
        addLog(currentTurn, `🔥 Bonus turn granted from cutting! Roll dice again.`);
        
        syncToDb({
          rolls: [],
          rollHistory: [],
          turnState: 'rolling',
          hasBonusTurn: false
        });
      } else {
        passTurn(undefined, updatedPieces);
      }
    } else {
      // stuck detection
      const validMovesLeft: any[] = [];
      const activePieces = updatedPieces.filter((p) => p.playerId === currentTurn);
      const uniqueRolls = Array.from(new Set(updatedRolls));

      activePieces.forEach((piece) => {
        uniqueRolls.forEach((r) => {
          const move = getValidMovesForPiece(piece, r);
          if (move) validMovesLeft.push(piece.id);
        });
      });

      if (validMovesLeft.length === 0) {
        addLog(currentTurn, `⚠️ No valid moves remaining for rolls [${updatedRolls.join(', ')}]. Turn forfeited.`);
        if (currentBonus) {
          setRolls([]);
          setRollHistory([]);
          setTurnState('rolling');
          setHasBonusTurn(false);
          addLog(currentTurn, `🔥 Bonus turn granted from cutting! Roll dice again.`);
          
          syncToDb({
            rolls: [],
            rollHistory: [],
            turnState: 'rolling',
            hasBonusTurn: false
          });
        } else {
          passTurn(undefined, updatedPieces);
        }
      }
    }
  }, [currentTurn, passTurn, addLog, getValidMovesForPiece, checkTeamVictory, syncToDb]);

  const movePiece = useCallback((pieceId: number, rollValue: number) => {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece) return;

    const move = getValidMovesForPiece(piece, rollValue);
    if (!move) return;

    soundManager.playMove();

    const rollIdx = rolls.indexOf(rollValue);
    let nextRolls = [...rolls];
    if (rollIdx !== -1) {
      nextRolls.splice(rollIdx, 1);
    }
    setRolls(nextRolls);

    let nextBonus = hasBonusTurn;

    const nextPieces = pieces.map((p) => {
      if (p.id === pieceId) {
        return { ...p, indexInPath: move.targetIndex };
      }
      return p;
    });

    const path = getPlayerPath(piece.playerId);
    const targetCell = path[move.targetIndex];
    const targetCellKey = getCellKey(targetCell);

    let capturedPieceName = '';
    const resolvedPieces = nextPieces.map((p) => {
      // Capture check: must not be teammate or own piece
      let isEnemy = p.playerId !== piece.playerId;
      if (gameType === 'team') {
        const activeTeam = piece.playerId === 0 || piece.playerId === 2 ? 'A' : 'B';
        const targetTeam = p.playerId === 0 || p.playerId === 2 ? 'A' : 'B';
        isEnemy = activeTeam !== targetTeam;
      }

      if (isEnemy && p.indexInPath >= 0 && p.indexInPath < GOAL_INDEX) {
        const enemyPath = getPlayerPath(p.playerId);
        const enemyCell = enemyPath[p.indexInPath];
        if (getCellKey(enemyCell) === targetCellKey && !SAFE_ZONES.includes(targetCellKey)) {
          capturedPieceName = `${players[p.playerId].name}`;
          nextBonus = true;
          return { ...p, indexInPath: -1 }; // sent to base
        }
      }
      return p;
    });

    setPieces(resolvedPieces);
    setHasBonusTurn(nextBonus);

    const destName = move.targetIndex === GOAL_INDEX ? 'HOME 🏆' : `Cell (${targetCell[0]},${targetCell[1]})`;
    if (capturedPieceName) {
      addLog(piece.playerId, `💥 CUT! Captured ${capturedPieceName} at (${targetCell[0]},${targetCell[1]})! Extra turn earned.`);
      soundManager.playCut();
    } else {
      const spawnText = piece.indexInPath === -1 ? 'entered the board' : `moved ${rollValue} steps`;
      addLog(piece.playerId, `Moved piece to ${destName} (${spawnText}).`);
      if (SAFE_ZONES.includes(targetCellKey)) {
        soundManager.playSafe();
      }
    }

    // sync state
    syncToDb({
      pieces: resolvedPieces,
      rolls: nextRolls,
      hasBonusTurn: nextBonus
    });

    checkTurnProgress(nextRolls, resolvedPieces, nextBonus);
  }, [pieces, rolls, hasBonusTurn, getValidMovesForPiece, addLog, checkTurnProgress, gameType, players, syncToDb]);

  // Roll cubical 3D dice (1-6)
  const rollDice = useCallback(() => {
    if (turnState !== 'rolling' || isRollingAnimation) return;

    setIsRollingAnimation(true);
    soundManager.playRoll();

    // Sync animation start
    syncToDb({
      turnState: 'rolling'
    });

    setTimeout(() => {
      // 1-6 standard dice value
      const score = Math.floor(Math.random() * 6) + 1;
      setDiceValue(score);

      // 1 or 6 awards extra throw in our adapted Thayam rules
      const isExtra = score === 1 || score === 6;
      const nextRolls = [...rolls, score];
      const nextRollHistory = [...rollHistory, score];

      setRolls(nextRolls);
      setRollHistory(nextRollHistory);
      setIsRollingAnimation(false);

      const rollName = score === 1 ? 'THAYAM (1) 🌟' : `${score}`;
      addLog(currentTurn, `🎲 Rolled dice: ${rollName}`);

      let nextTurnState: 'rolling' | 'moving' = 'moving';

      if (isExtra) {
        addLog(currentTurn, `✨ Rolled ${score}! Earned extra throw.`);
        nextTurnState = 'rolling';
        setTurnState('rolling');
      } else {
        setTurnState('moving');
        nextTurnState = 'moving';

        // stuck evaluation
        const activePieces = pieces.filter((p) => p.playerId === currentTurn);
        const uniqueRolls = Array.from(new Set(nextRolls));
        const hasValidMoves = activePieces.some((piece) =>
          uniqueRolls.some((r) => getValidMovesForPiece(piece, r) !== null)
        );

        if (!hasValidMoves) {
          addLog(currentTurn, `⚠️ No valid moves available for rolls [${nextRolls.join(', ')}]. Turn forfeited.`);
          if (hasBonusTurn) {
            setRolls([]);
            setRollHistory([]);
            setTurnState('rolling');
            setHasBonusTurn(false);
            addLog(currentTurn, `🔥 Bonus turn granted from cutting! Roll dice again.`);
            
            syncToDb({
              rolls: [],
              rollHistory: [],
              turnState: 'rolling',
              hasBonusTurn: false,
              diceValue: score
            });
            return;
          } else {
            setTimeout(() => {
              passTurn();
            }, 1500);
            return;
          }
        }
      }

      syncToDb({
        rolls: nextRolls,
        rollHistory: nextRollHistory,
        turnState: nextTurnState,
        diceValue: score
      });

    }, 850);
  }, [turnState, rolls, rollHistory, currentTurn, pieces, hasBonusTurn, isRollingAnimation, getValidMovesForPiece, passTurn, addLog, syncToDb]);

  // AI Decision Engine with Heuristic Scorer for Easy, Medium, Hard bots
  const makeAIMove = useCallback(() => {
    if (turnState !== 'moving' || isRollingAnimation) return;

    const validMoves = getActiveValidMoves();
    if (validMoves.length === 0) {
      if (hasBonusTurn) {
        setRolls([]);
        setRollHistory([]);
        setTurnState('rolling');
        setHasBonusTurn(false);
        addLog(currentTurn, `🔥 Bonus turn granted from cutting! Roll dice again.`);
        syncToDb({
          rolls: [],
          rollHistory: [],
          turnState: 'rolling',
          hasBonusTurn: false
        });
      } else {
        passTurn();
      }
      return;
    }

    let bestMove: any = null;

    if (difficulty === 'easy') {
      // Easy Bot: randomly select any move
      bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
      // Medium / Hard Bot scoring
      let highestScore = -99999;

      validMoves.forEach((move) => {
        let score = 0;
        const piece = pieces.find((p) => p.id === move.pieceId)!;

        // Reach Goal
        if (move.targetIndex === GOAL_INDEX) {
          score += difficulty === 'hard' ? 6000 : 5000;
        }

        // Capture check
        if (move.captures) {
          const path = getPlayerPath(piece.playerId);
          const targetCell = path[move.targetIndex];
          const targetCellKey = getCellKey(targetCell);
          
          let enemyProgress = 0;
          pieces.forEach((p) => {
            if (p.playerId !== currentTurn && p.indexInPath >= 0 && p.indexInPath < GOAL_INDEX) {
              const enemyPath = getPlayerPath(p.playerId);
              const enemyCell = enemyPath[p.indexInPath];
              if (getCellKey(enemyCell) === targetCellKey) {
                enemyProgress = p.indexInPath;
              }
            }
          });

          if (difficulty === 'hard') {
            score += 1500 + enemyProgress * 30; // Aggressive target progress destruction
          } else {
            score += 1000 + enemyProgress * 15;
          }
        }

        // Spawn out of base
        if (piece.indexInPath === -1 && move.targetIndex === 0) {
          score += difficulty === 'hard' ? 800 : 600;
        }

        // Safe zone landing
        const path = getPlayerPath(piece.playerId);
        const targetCell = path[move.targetIndex];
        if (SAFE_ZONES.includes(getCellKey(targetCell))) {
          score += difficulty === 'hard' ? 350 : 250;
        }

        // Blockade potential
        const layout = getBoardPiecesLayout();
        const friendlyOnTarget = (layout[getCellKey(targetCell)] || []).filter((p) => p.playerId === currentTurn);
        if (friendlyOnTarget.length === 1) {
          score += difficulty === 'hard' ? 400 : 150; 
        }

        // Progress score
        score += move.targetIndex * (difficulty === 'hard' ? 20 : 15);

        // Unsafe exposure checks (Hard Bot only)
        if (difficulty === 'hard') {
          // Disincentive to break a blockade
          const currentCellKey = piece.indexInPath >= 0 ? getCellKey(path[piece.indexInPath]) : '';
          if (currentCellKey) {
            const friendlyOnCurrent = (layout[currentCellKey] || []).filter((p) => p.playerId === currentTurn);
            if (friendlyOnCurrent.length >= 2) {
              score -= 150; 
            }
          }

          // Leave Safe Zone penalty
          if (piece.indexInPath >= 0 && SAFE_ZONES.includes(getCellKey(path[piece.indexInPath]))) {
            score -= 150;
          }
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMove = move;
        }
      });
    }

    if (bestMove) {
      const bm = bestMove;
      setTimeout(() => {
        movePiece(bm.pieceId, bm.rollValue);
      }, 1000);
    }
  }, [turnState, getActiveValidMoves, pieces, currentTurn, hasBonusTurn, getBoardPiecesLayout, isRollingAnimation, movePiece, passTurn, addLog, difficulty, syncToDb]);

  // AI Handler Loop
  useEffect(() => {
    const activePlayer = players.find((p) => p.id === currentTurn);
    if (!activePlayer || !activePlayer.isAI || winner !== null) return;

    // Multiplayer bot turns are driven solely by the host client
    if (gameMode === 'multi' && !isHost) return;

    if (turnState === 'rolling' && !isRollingAnimation) {
      const rollTimeout = setTimeout(() => {
        rollDice();
      }, 1200);
      return () => clearTimeout(rollTimeout);
    } else if (turnState === 'moving' && !isRollingAnimation) {
      const moveTimeout = setTimeout(() => {
        makeAIMove();
      }, 800);
      return () => clearTimeout(moveTimeout);
    }
  }, [currentTurn, turnState, players, isRollingAnimation, winner, rollDice, makeAIMove, gameMode, isHost]);

  // Initialize Game settings from Lobby
  const initGame = useCallback((config: {
    roomId: string;
    mode: 'single' | 'multi';
    gameType: 'single' | 'team';
    difficulty?: 'easy' | 'medium' | 'hard';
    players: Player[];
    localPlayerId: number;
    isMultiplayerHost: boolean;
  }) => {
    setRoomId(config.roomId);
    setGameMode(config.mode);
    setGameType(config.gameType);
    if (config.difficulty) setDifficulty(config.difficulty);
    setPlayers(config.players);
    setLocalPlayerId(config.localPlayerId);
    setIsHost(config.isMultiplayerHost);

    // Initial pieces placement
    const initialPieces: Piece[] = [];
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 4; i++) {
        initialPieces.push({ id: p * 4 + i, playerId: p, indexInPath: -1 });
      }
    }
    setPieces(initialPieces);
    
    setRolls([]);
    setRollHistory([]);
    setCurrentTurn(0);
    setTurnState('rolling');
    setLastShells([1]);
    setDiceValue(1);
    setHasBonusTurn(false);
    setWinner(null);
    setWinningTeam(null);
    setMatchTime(0);
    setLogs([]);

    addLog(0, `⚔️ Match initialized. Welcome to Thayam Arena! Red rolls first.`);
  }, [addLog]);

  // Listen to remote room changes in Multiplayer mode
  useEffect(() => {
    if (gameMode !== 'multi' || !roomId) return;

    const unsubscribe = dbService.subscribeToRoom(roomId, (room) => {
      if (!room) return;

      // Sync state from Database
      if (room.currentTurn !== undefined) setCurrentTurn(room.currentTurn);
      if (room.rolls !== undefined) setRolls(room.rolls || []);
      if (room.rollHistory !== undefined) setRollHistory(room.rollHistory || []);
      if (room.turnState !== undefined) setTurnState(room.turnState);
      if (room.diceValue !== undefined) setDiceValue(room.diceValue);
      if (room.hasBonusTurn !== undefined) setHasBonusTurn(room.hasBonusTurn);
      if (room.winner !== undefined) {
        setWinner(room.winner);
        // compute winning team string if team game
        if (room.winner !== null && gameType === 'team') {
          setWinningTeam(room.winner === 0 ? "Team A (Red & Green)" : "Team B (Blue & Yellow)");
        }
      }
      if (room.pieces !== undefined) setPieces(room.pieces || []);
      
      // Load chat messages as logs
      if (room.chat !== undefined && room.chat.length > 0) {
        const syncLogs = room.chat.map((c) => ({
          id: c.id,
          playerId: 0, // generic display
          message: c.message,
          timestamp: c.timestamp
        }));
        // set logs keeping order
        setLogs(syncLogs.reverse());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameMode, roomId, gameType]);

  // Game timer clock
  useEffect(() => {
    if (winner !== null) return;
    
    timerRef.current = window.setInterval(() => {
      setMatchTime((t) => t + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [winner]);

  const resetGame = useCallback((aiSettings?: boolean[]) => {
    const initial: Piece[] = [];
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 4; i++) {
        initial.push({ id: p * 4 + i, playerId: p, indexInPath: -1 });
      }
    }
    setPieces(initial);
    setRolls([]);
    setRollHistory([]);
    setCurrentTurn(0);
    setTurnState('rolling');
    setLastShells([1]);
    setDiceValue(1);
    setHasBonusTurn(false);
    setWinner(null);
    setWinningTeam(null);
    setMatchTime(0);
    setLogs([]);

    if (aiSettings) {
      setPlayers((prev) =>
        prev.map((p, idx) => ({ ...p, isAI: aiSettings[idx] }))
      );
    }

    addLog(0, '⚔️ New Match initialized. Red rolls first.');

    syncToDb({
      currentTurn: 0,
      rolls: [],
      rollHistory: [],
      turnState: 'rolling',
      pieces: initial,
      winner: null,
      hasBonusTurn: false,
      diceValue: 1
    });
  }, [addLog, syncToDb]);

  return {
    players,
    pieces,
    currentTurn,
    rolls,
    rollHistory,
    turnState,
    lastShells,
    diceValue,
    hasBonusTurn,
    winner,
    winningTeam,
    logs,
    isRollingAnimation,
    matchTime,
    localPlayerId,
    gameMode,
    gameType,
    difficulty,
    isHost,
    roomId,
    getBoardPiecesLayout,
    getValidMovesForPiece,
    getActiveValidMoves,
    movePiece,
    rollDice,
    resetGame,
    setPlayers,
    addLog,
    initGame
  };
}
