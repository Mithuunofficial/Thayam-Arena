import React, { useState, useEffect } from 'react';
import { Users, Cpu, Play, Copy, ArrowLeft, Sun, Moon, Trophy, Award } from 'lucide-react';
import { dbService } from '../supabase/db';
import type { RoomState } from '../supabase/db';
import { adminDb } from '../supabase/adminDb';
import type { AdminTournament } from '../supabase/adminDb';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';
import { useAuth } from '../supabase/AuthContext';
import { useRouter } from './Router';

interface LobbyProps {
  onGameStart: (config: {
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
  }) => void;
  lang: Language;
  onLanguageToggle: () => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const COLOR_MAP: Record<number, { name: string; hex: string; glow: string }> = {
  0: { name: 'Red', hex: '#EF4444', glow: 'rgba(239, 68, 68, 0.6)' },
  1: { name: 'Blue', hex: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' },
  2: { name: 'Green', hex: '#10B981', glow: 'rgba(16, 185, 129, 0.6)' },
  3: { name: 'Yellow', hex: '#F5B041', glow: 'rgba(245, 176, 65, 0.6)' },
};

export const Lobby: React.FC<LobbyProps> = ({ 
  onGameStart, 
  lang, 
  onLanguageToggle,
  theme,
  onThemeToggle
}) => {
  const t = translations[lang];
  const isDark = theme === 'dark';
  const { user } = useAuth();
  const { navigate } = useRouter();

  // Screen routing states
  const [step, setStep] = useState<'mode-select' | 'setup-multi' | 'lobby'>('mode-select');
  const [gameType, setGameType] = useState<'single' | 'team'>('single');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerName, setPlayerName] = useState(user?.displayName || '');
  const [roomInput, setRoomInput] = useState('');
  
  // Realtime Lobby states
  const [activeRoomId, setActiveRoomId] = useState('');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<number>(0);
  const myUid = user?.uid || 'guest-' + Math.random().toString(36).substring(2, 9);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Tournament registration states
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [isRegistering, setIsRegistering] = useState<string | null>(null);

  // Subscribe to real-time tournaments
  useEffect(() => {
    const unsubscribe = adminDb.subscribeToTournaments((data) => {
      setTournaments(data);
    });
    return () => unsubscribe();
  }, []);

  const handleRegisterTournament = async (tourney: AdminTournament) => {
    if (!user) {
      alert(lang === 'en' ? "Please register or sign in first!" : "தயவுசெய்து முதலில் பதிவு செய்யவும்!");
      return;
    }
    
    const currentCoins = user.coins ?? 1000;
    if (currentCoins < 100) {
      alert(lang === 'en' 
        ? "Insufficient coins! You need 100 coins to register for a tournament." 
        : "போதிய நாணயங்கள் இல்லை! போட்டியில் சேர 100 நாணயங்கள் தேவை."
      );
      return;
    }

    if (tourney.players.includes(user.displayName)) {
      alert(lang === 'en' ? "Already registered for this tournament!" : "ஏற்கனவே இந்த போட்டியில் இணைந்துள்ளீர்கள்!");
      return;
    }

    setIsRegistering(tourney.id);

    try {
      // Deduct 100 coins
      await adminDb.updateUser(user.uid, {
        coins: currentCoins - 100
      });

      // Update tournament players list
      await adminDb.updateTournament(tourney.id, {
        players: [...tourney.players, user.displayName]
      });

      // Log activity
      await adminDb.createAdminLog(
        'Register Tournament',
        tourney.id,
        `User ${user.displayName} registered for tournament "${tourney.name}" (deducted 100 coins).`
      );

      alert(lang === 'en' 
        ? "Successfully registered for the tournament!" 
        : "போட்டியில் வெற்றிகரமாக இணைந்துள்ளீர்கள்!"
      );
    } catch (e: any) {
      console.error(e);
      alert(lang === 'en' ? `Registration failed: ${e.message}` : `பதிவு தோல்வியடைந்தது: ${e.message}`);
    } finally {
      setIsRegistering(null);
    }
  };

  // Set default names based on local storage or randomized names
  useEffect(() => {
    if (user?.displayName) {
      setPlayerName(user.displayName);
    } else {
      const stored = localStorage.getItem('thayam_player_name');
      if (stored) {
        setPlayerName(stored);
      } else {
        const names = lang === 'en' 
          ? ['Karikalan', 'Rajarajan', 'Senguttuvan', 'Pandiyan', 'Cheran', 'Cholan']
          : ['கரிகாலன்', 'ராஜராஜன்', 'செங்குட்டுவன்', 'பாண்டியன்', 'சேரன்', 'சோழன்'];
        setPlayerName(names[Math.floor(Math.random() * names.length)]);
      }
    }
  }, [lang, user]);

  // Sync to database if inside room lobby
  useEffect(() => {
    if (!activeRoomId) return;

    const unsubscribe = dbService.subscribeToRoom(activeRoomId, (state) => {
      setRoomState(state);
      
      // Auto-start game if host started it or room state changes to active matching
      if (state && state.turnState === 'rolling' && state.players && Object.keys(state.players).length === 4) {
        // Build final list of players sorted by ID 0..3
        const finalPlayersList = Array.from({ length: 4 }).map((_, idx) => {
          const pData = state.players[`player${idx}`];
          return {
            id: idx,
            name: pData ? pData.name : `Bot ${idx + 1}`,
            color: COLOR_MAP[idx].name.toLowerCase(),
            colorHex: COLOR_MAP[idx].hex,
            glowColor: COLOR_MAP[idx].glow,
            isAI: pData ? pData.isBot : true,
            team: (idx === 0 || idx === 2 ? 'A' : 'B') as 'A' | 'B'
          };
        });

        // Trigger parent state transition
        onGameStart({
          roomId: activeRoomId,
          mode: state.mode,
          gameType: state.gameType,
          difficulty: state.difficulty,
          players: finalPlayersList,
          localPlayerId: myPlayerId,
          isMultiplayerHost: isHost
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoomId, myPlayerId, isHost, onGameStart]);

  const saveName = (val: string) => {
    setPlayerName(val);
    localStorage.setItem('thayam_player_name', val);
  };

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'THAYAM-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // 1. Single Player setup
  const handleStartSinglePlayer = () => {
    saveName(playerName);
    // Initialize standard single player match locally with 3 AI players
    const localPlayers = [
      { id: 0, name: playerName || (lang === 'en' ? 'You' : 'நீங்கள்'), color: 'red', colorHex: COLOR_MAP[0].hex, glowColor: COLOR_MAP[0].glow, isAI: false, team: 'A' as const },
      { id: 1, name: `${lang === 'en' ? 'AI Bot' : 'கணினி'} (${t[difficulty]})`, color: 'blue', colorHex: COLOR_MAP[1].hex, glowColor: COLOR_MAP[1].glow, isAI: true, team: 'B' as const },
      { id: 2, name: `${lang === 'en' ? 'AI Bot' : 'கணினி'} (${t[difficulty]})`, color: 'green', colorHex: COLOR_MAP[2].hex, glowColor: COLOR_MAP[2].glow, isAI: true, team: 'A' as const },
      { id: 3, name: `${lang === 'en' ? 'AI Bot' : 'கணினி'} (${t[difficulty]})`, color: 'yellow', colorHex: COLOR_MAP[3].hex, glowColor: COLOR_MAP[3].glow, isAI: true, team: 'B' as const }
    ];

    onGameStart({
      roomId: 'SINGLE-PLAYER-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      mode: 'single',
      gameType,
      difficulty,
      players: localPlayers,
      localPlayerId: 0,
      isMultiplayerHost: true
    });
  };

  // 2. Multi Player Setup - Create Room
  const handleCreateRoom = async () => {
    saveName(playerName);
    const code = generateRoomCode();
    setIsHost(true);
    setMyPlayerId(0); // Host is always Player 1 (Red)
    
    try {
      // Create base room in Realtime DB
      await dbService.createRoom(code, 'multi', gameType, difficulty);

      // Join room as Player 1 (Red)
      await dbService.joinRoom(code, 'player0', {
        uid: myUid,
        name: playerName || (lang === 'en' ? 'Player 1' : 'வீரர் 1'),
        color: 'red',
        team: 'A',
        ready: true, // Host is ready by default
        isBot: false
      });

      setActiveRoomId(code);
      setStep('lobby');
    } catch (e: any) {
      console.error("Failed to create room:", e);
      alert(lang === 'en'
        ? `Failed to create room: ${e.message || 'Verify database connection & RLS Policies.'}`
        : `அறையை உருவாக்க முடியவில்லை: ${e.message || 'தரவுத்தள இணைப்பு & கொள்கைகளை சரிபார்க்கவும்.'}`
      );
    }
  };

  // 3. Multi Player Setup - Join Room
  const handleJoinRoom = async () => {
    saveName(playerName);
    const code = roomInput.trim().toUpperCase();
    if (!code) return;

    try {
      setIsHost(false);
      
      // Fetch room metadata
      const tempState: RoomState = await new Promise((resolve, reject) => {
        const unsubscribe = dbService.subscribeToRoom(code, (state) => {
          unsubscribe();
          if (state) resolve(state);
          else reject(new Error('Room not found'));
        });
      });

      // Find first empty player slot 1..3
      let joinedSlot = -1;
      for (let i = 1; i < 4; i++) {
        if (!tempState.players || !tempState.players[`player${i}`]) {
          joinedSlot = i;
          break;
        }
      }

      if (joinedSlot === -1) {
        alert(lang === 'en' ? "This room is already full!" : "இந்த அறை ஏற்கனவே நிறைந்துவிட்டது!");
        return;
      }

      setMyPlayerId(joinedSlot);
      setActiveRoomId(code);

      // Join room slot
      await dbService.joinRoom(code, `player${joinedSlot}`, {
        uid: myUid,
        name: playerName || (lang === 'en' ? `Player ${joinedSlot + 1}` : `வீரர் ${joinedSlot + 1}`),
        color: COLOR_MAP[joinedSlot].name.toLowerCase(),
        team: joinedSlot === 2 ? 'A' : 'B', // P0 and P2 are Team A, P1 and P3 are Team B
        ready: false,
        isBot: false
      });

      setStep('lobby');
    } catch (e) {
      alert(lang === 'en' ? "Invalid Room Code or Room does not exist!" : "தவறான அறை குறியீடு அல்லது அறை இல்லை!");
    }
  };

  // 4. Fill remaining empty slots with bots
  const handleAddBot = async (slotIdx: number) => {
    if (!isHost || !activeRoomId) return;
    
    await dbService.joinRoom(activeRoomId, `player${slotIdx}`, {
      uid: `bot-${slotIdx}-${Math.random().toString(36).substring(2, 6)}`,
      name: lang === 'en' ? `AI Bot ${slotIdx + 1}` : `கணினி வீரர் ${slotIdx + 1}`,
      color: COLOR_MAP[slotIdx].name.toLowerCase(),
      team: slotIdx === 2 ? 'A' : 'B',
      ready: true,
      isBot: true
    });
  };

  // Toggle ready status
  const handleToggleReady = async () => {
    if (!activeRoomId || !roomState) return;
    const currentReady = roomState.players[`player${myPlayerId}`]?.ready || false;
    
    await dbService.updateRoom(activeRoomId, {
      [`players/player${myPlayerId}/ready`]: !currentReady
    } as any);
  };

  // Host starts game
  const handleStartGame = async () => {
    if (!isHost || !activeRoomId || !roomState) return;

    // Check if slots are filled
    const playerKeys = Object.keys(roomState.players || {});
    if (playerKeys.length < 4) {
      // Prompt option to autofill with bots
      for (let i = 1; i < 4; i++) {
        if (!roomState.players[`player${i}`]) {
          await handleAddBot(i);
        }
      }
    }

    // Set Room status to rolling to initiate game loading for all clients
    await dbService.updateRoom(activeRoomId, {
      turnState: 'rolling'
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(activeRoomId);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans select-none transition-colors duration-300"
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
      {/* Header bar */}
      <header className="bg-amber-900 dark:bg-stone-950 text-amber-50 px-6 py-4 flex items-center justify-between border-b-4 border-amber-950 dark:border-amber-800 shadow-md transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-1.5 bg-amber-950/45 dark:bg-stone-900/40 hover:bg-amber-950 dark:hover:bg-stone-850 rounded-lg text-amber-100 hover:text-white transition flex items-center justify-center cursor-pointer"
            title="Return to Main Menu"
            aria-label="Return to Main Menu"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <img src="/Thayam-logo.png" alt="Thayam Logo" className="h-9 w-auto object-contain" />
          <h1 className="font-serif font-black tracking-widest text-lg md:text-xl">
            {t.title}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center space-x-1.5 px-3 py-1 bg-amber-800 hover:bg-amber-750 dark:bg-stone-900 dark:hover:bg-stone-850 border border-amber-50/35 rounded-md text-xs font-bold text-white transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#F5B041] shadow-[0_0_4px_#F5B041]" />
              <span>{user.displayName} (🪙 {user.coins ?? 1000})</span>
            </button>
          )}

          <button 
            onClick={onLanguageToggle}
            className="px-3 py-1 border border-amber-50/35 hover:border-amber-50 hover:bg-amber-800 dark:hover:bg-stone-900 rounded-md text-xs font-semibold uppercase tracking-wider transition"
          >
            {lang === 'en' ? 'தமிழ்' : 'English'}
          </button>

          <button 
            onClick={onThemeToggle}
            className="p-1 border border-amber-50/35 hover:border-amber-50 hover:bg-amber-800 dark:hover:bg-stone-900 rounded-md text-amber-100 transition"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main container */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-xl bg-white dark:bg-[#1E1815] border-[10px] border-amber-900 dark:border-amber-850 rounded-3xl p-6 shadow-2xl relative transition-colors duration-300">
          
          {/* Decorative brass corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-[4px] border-l-[4px] border-amber-500 rounded-tl-sm opacity-60" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-[4px] border-r-[4px] border-amber-500 rounded-tr-sm opacity-60" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[4px] border-l-[4px] border-amber-500 rounded-bl-sm opacity-60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[4px] border-r-[4px] border-amber-500 rounded-br-sm opacity-60" />

          {/* STEP 1: MODE SELECT */}
          {step === 'mode-select' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold tracking-widest uppercase block">
                  {t.lobbyDesc}
                </span>
                <h2 className="font-serif text-2xl font-black text-amber-950 dark:text-amber-100">
                  {t.subtitle}
                </h2>
                <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-2" />
              </div>

              {/* Player Name Entry */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 tracking-wider block">
                  {t.enterHeroName}
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.substring(0, 16))}
                  placeholder={lang === 'en' ? 'Your Name' : 'உங்கள் பெயர்'}
                  className="w-full text-center border-2 border-stone-300 dark:border-stone-700 focus:border-amber-900 dark:focus:border-amber-500 focus:outline-none rounded-xl px-4 py-2 text-stone-800 dark:text-stone-100 font-bold bg-white dark:bg-stone-900"
                />
              </div>

              {/* Game Type (Single vs Team) */}
              <div className="space-y-1.5 max-w-sm mx-auto">
                <label className="text-xs font-bold text-amber-900 dark:text-amber-300 tracking-wider block text-center">
                  {t.selectAllianceMode}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGameType('single')}
                    className={`py-2 px-3 text-xs font-bold border-2 rounded-xl transition ${
                      gameType === 'single'
                        ? 'border-amber-900 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-800 bg-white dark:bg-stone-900'
                    }`}
                  >
                    {t.singleMode}
                  </button>
                  
                  <button
                    onClick={() => setGameType('team')}
                    className={`py-2 px-3 text-xs font-bold border-2 rounded-xl transition ${
                      gameType === 'team'
                        ? 'border-amber-900 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                        : 'border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-800 bg-white dark:bg-stone-900'
                    }`}
                  >
                    {t.teamMode}
                  </button>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Single Player Card */}
                <div className="bg-orange-50/40 dark:bg-[#2A211C]/30 border-2 border-amber-900/10 dark:border-amber-800/10 hover:border-amber-900/30 dark:hover:border-amber-650/40 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <h3 className="font-serif font-bold text-amber-950 dark:text-amber-100">{t.singlePlayer}</h3>
                    
                    {/* Bot Difficulty */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5">
                      {['easy', 'medium', 'hard'].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficulty(diff as any)}
                          className={`py-1 text-[9px] font-bold uppercase rounded border transition ${
                            difficulty === diff
                              ? 'bg-amber-900 dark:bg-amber-800 border-amber-950 dark:border-amber-900 text-amber-50'
                              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-650'
                          }`}
                        >
                          {t[diff as 'easy' | 'medium' | 'hard']}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartSinglePlayer}
                    className="w-full flex items-center justify-center space-x-1.5 py-2.5 bg-amber-950 dark:bg-amber-900 hover:bg-amber-900 dark:hover:bg-amber-800 text-amber-50 rounded-xl font-bold shadow-md transition active:scale-95 text-xs uppercase"
                  >
                    <Play className="w-4 h-4 fill-amber-50" />
                    <span>{t.startOffline}</span>
                  </button>
                </div>

                {/* Online Friends Card */}
                <div className="bg-orange-50/40 dark:bg-[#2A211C]/30 border-2 border-amber-900/10 dark:border-amber-800/10 hover:border-amber-900/30 dark:hover:border-amber-650/40 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <h3 className="font-serif font-bold text-amber-950 dark:text-amber-100">{t.friendsMode}</h3>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      {t.friendsModeDesc}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={handleCreateRoom}
                      className="w-full py-2 bg-amber-900 dark:bg-amber-850 hover:bg-amber-850 dark:hover:bg-amber-750 text-amber-50 rounded-xl font-bold text-xs uppercase transition active:scale-95"
                    >
                      {t.createRoom}
                    </button>
                    
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value.substring(0, 15))}
                        placeholder="THAYAM-XXXX"
                        className="w-full text-center border-2 border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-900 dark:focus:border-amber-550 px-2 py-1 text-xs font-semibold rounded-lg text-stone-850 dark:text-stone-100 bg-white dark:bg-stone-900"
                      />
                      <button
                        onClick={handleJoinRoom}
                        className="py-1 px-3 bg-stone-850 hover:bg-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-lg text-xs font-semibold transition active:scale-95"
                      >
                        {lang === 'en' ? 'Join' : 'இணை'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Tournaments Arena Card */}
                <div className="bg-orange-50/20 dark:bg-[#2A211C]/20 border-2 border-amber-900/10 dark:border-amber-800/10 hover:border-amber-900/20 dark:hover:border-amber-700/20 rounded-2xl p-4 space-y-4 text-left col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 border-b border-stone-200 dark:border-stone-850 pb-2">
                    <Trophy className="w-4.5 h-4.5 text-amber-700 dark:text-amber-400" />
                    <h3 className="font-serif font-black text-amber-950 dark:text-amber-100 text-xs tracking-wide">
                      {lang === 'en' ? 'Active Tournaments Arena' : 'செயலில் உள்ள போட்டிகள்'}
                    </h3>
                  </div>

                  {tournaments.length === 0 ? (
                    <div className="text-center text-stone-400 dark:text-stone-500 py-3 text-[10px] italic font-semibold">
                      {lang === 'en' ? 'No tournaments hosted currently.' : 'தற்போது போட்டிகள் எதுவும் இல்லை.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {tournaments.map((tourney: AdminTournament) => {
                        const isRegistered = tourney.players.includes(user?.displayName || '');
                        const isUpcoming = tourney.status === 'upcoming';
                        const isLive = tourney.status === 'live';
                        const isFinished = tourney.status === 'finished';

                        return (
                          <div 
                            key={tourney.id}
                            className="bg-white dark:bg-[#1C1613] border border-stone-200 dark:border-stone-850 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
                          >
                            <div className="space-y-1 text-left min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-serif font-bold text-xs text-amber-950 dark:text-amber-100 truncate">
                                  {tourney.name}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold border uppercase leading-none ${
                                  isLive ? 'bg-red-100 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400 animate-pulse' :
                                  isFinished ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-950/40 dark:border-green-900 dark:text-green-400' :
                                  'bg-stone-100 border-stone-200 text-stone-600 dark:bg-stone-900 dark:border-stone-800 dark:text-gray-400'
                                }`}>
                                  {tourney.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8.5px] text-stone-400 dark:text-stone-500 font-bold font-mono leading-none">
                                <span className="flex items-center gap-1"><Award size={10} className="text-[#F5B041]" /> REWARD: {tourney.rewards}</span>
                                <span className="flex items-center gap-1"><Users size={10} className="text-[#00C2FF]" /> SEED: {tourney.players.length} joined</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-end shrink-0">
                              {isRegistered ? (
                                <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[9px] font-black uppercase rounded-lg">
                                  Registered ✓
                                </span>
                              ) : isUpcoming ? (
                                <button
                                  onClick={() => handleRegisterTournament(tourney)}
                                  disabled={isRegistering !== null}
                                  className="px-3 py-1 bg-amber-900 hover:bg-amber-800 dark:bg-amber-850 dark:hover:bg-amber-750 disabled:opacity-50 text-amber-50 rounded-lg text-[9px] font-extrabold uppercase transition active:scale-95 cursor-pointer shadow-sm"
                                >
                                  Join (100 🪙)
                                </button>
                              ) : (
                                <span className="px-3 py-1 bg-stone-100 dark:bg-stone-900 text-stone-400 dark:text-stone-600 text-[9px] font-extrabold uppercase rounded-lg border border-stone-200/50 dark:border-stone-800/60 cursor-not-allowed">
                                  {isLive ? 'Live ⚔️' : 'Ended 🏁'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: REALTIME MULTIPLAYER LOBBY */}
          {step === 'lobby' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-stone-100 dark:border-stone-900 pb-3">
                <button
                  onClick={() => setStep('mode-select')}
                  className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-stone-500 dark:text-stone-400 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="text-center flex-grow">
                  <h2 className="font-serif text-lg font-bold text-amber-950 dark:text-amber-100">{t.arenaLobby}</h2>
                  <span className="text-[9px] font-bold text-amber-800 dark:text-amber-400 block uppercase">
                    {gameType === 'team' ? t.teamMode : t.singleMode}
                  </span>
                </div>
                <div className="w-6" />
              </div>

              {/* Room Code copying panel */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold block uppercase">{t.roomCode}</span>
                  <span className="text-base font-black text-amber-950 dark:text-amber-100 font-mono tracking-widest">{activeRoomId}</span>
                </div>
                <button
                  onClick={copyRoomCode}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-amber-900 dark:bg-amber-800 text-amber-50 rounded-lg text-xs font-semibold transition hover:bg-amber-800 dark:hover:bg-amber-700 active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en'
                      ? (copyFeedback ? 'Copied!' : 'Copy')
                      : (copyFeedback ? 'நகலெடுக்கப்பட்டது!' : 'நகலெடு')}
                  </span>
                </button>
              </div>

              {/* 4 Player slots grid */}
              <div className="space-y-2">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-wider block">
                  {t.connectedWarriors}
                </span>
                
                {Array.from({ length: 4 }).map((_, idx) => {
                  const pKey = `player${idx}`;
                  const pData = roomState?.players?.[pKey];
                  const colorDetails = COLOR_MAP[idx];
                  const alliance = idx === 0 || idx === 2 ? 'Team A' : 'Team B';

                  return (
                    <div
                      key={idx}
                      className="border border-stone-200 dark:border-stone-850 rounded-xl p-3 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/20"
                    >
                      {/* Left: Indicator & Info */}
                      <div className="flex items-center space-x-3">
                        {/* Token Indicator color swatch */}
                        <div
                          className="w-4 h-4 rounded-full border border-stone-400 dark:border-stone-950 flex items-center justify-center text-[8px] font-black text-white"
                          style={{
                            backgroundColor: colorDetails.hex,
                            boxShadow: `0 0 6px ${colorDetails.hex}`
                          }}
                        >
                          {idx + 1}
                        </div>
                        
                        <div>
                          {pData ? (
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-stone-850 dark:text-stone-150">{pData.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                                {pData.isBot ? t.bot : t.human}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 dark:text-stone-500 italic">{t.openSlot}</span>
                          )}
                          
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 block font-semibold">
                            {gameType === 'team' ? `${alliance} // ` : ''}{t.startSector}: {colorDetails.name}
                          </span>
                        </div>
                      </div>

                      {/* Right: State actions */}
                      <div>
                        {pData ? (
                          <div className="flex items-center space-x-2">
                            {pData.ready ? (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase rounded-md border border-green-200 dark:border-green-900">
                                {t.ready}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-400 text-[10px] font-bold uppercase rounded-md border border-stone-200 dark:border-stone-800">
                                {t.notReady}
                              </span>
                            )}
                          </div>
                        ) : isHost ? (
                          <button
                            onClick={() => handleAddBot(idx)}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-250 border border-amber-900/35 dark:border-amber-800/40 hover:bg-amber-900 hover:text-amber-50 dark:hover:bg-amber-800 text-[10px] font-bold rounded-lg uppercase tracking-wider transition active:scale-95"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>{t.addBot}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-300 dark:text-stone-655 italic">{t.waiting}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status information or bottom actions */}
              <div className="pt-4 flex flex-col gap-3">
                {roomState?.players?.[`player${myPlayerId}`] && (
                  <button
                    onClick={handleToggleReady}
                    className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition active:scale-95 ${
                      roomState.players[`player${myPlayerId}`].ready
                        ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-900/20 dark:border-amber-800/20'
                        : 'bg-stone-850 hover:bg-stone-750 dark:bg-stone-800 dark:hover:bg-stone-700 text-white shadow-md'
                    }`}
                  >
                    {roomState.players[`player${myPlayerId}`].ready
                      ? t.toggleNotReady
                      : t.iAmReady}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    className="w-full py-3 bg-amber-900 dark:bg-amber-800 hover:bg-amber-800 dark:hover:bg-amber-700 text-amber-50 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition active:scale-95"
                  >
                    {t.startGame}
                  </button>
                )}

                {!isHost && (
                  <div className="text-center py-2 text-stone-400 dark:text-stone-500 text-[10px] italic">
                    {t.waitingForPlayers}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
