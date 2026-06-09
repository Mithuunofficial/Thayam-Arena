import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminRoom } from '../../../supabase/adminDb';
import { dbService } from '../../../supabase/db';
import type { RoomState } from '../../../supabase/db';
import { Eye, XOctagon, UserMinus, RefreshCw, X, MessageSquare } from 'lucide-react';

export const RoomsTab: React.FC = () => {
  const [rooms, setRooms] = useState<AdminRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectingRoom, setInspectingRoom] = useState<RoomState | null>(null);
  const [inspectingId, setInspectingId] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adminDb.subscribeToRooms((data) => {
      setRooms(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleForceClose = async (roomId: string) => {
    if (window.confirm(`FORCE CLOSE: Are you sure you want to terminate Room ${roomId} immediately?`)) {
      await adminDb.forceCloseRoom(roomId);
      await adminDb.createAdminLog('Force Close Room', roomId, `Shut down game lobby ${roomId} by administrative override.`);
      fetchRooms();
      if (inspectingId === roomId) setInspectingRoom(null);
    }
  };

  const handleRemovePlayer = async (roomId: string, playerUid: string, name: string) => {
    if (window.confirm(`KICK PLAYER: Boot player ${name} from Room ${roomId}?`)) {
      await adminDb.removePlayerFromRoom(roomId, playerUid);
      await adminDb.createAdminLog('Kick Player', playerUid, `Ejected player ${name} from game arena ${roomId}.`);
      fetchRooms();
      // Re-inspect if currently open
      if (inspectingId === roomId) {
        handleInspect(roomId);
      }
    }
  };

  const handleInspect = (roomId: string) => {
    setInspectingId(roomId);
    
    // We subscribe or fetch the current actual raw state of the room using dbService
    dbService.subscribeToRoom(roomId, (state) => {
      if (state) {
        setInspectingRoom(state);
      } else {
        // Fallback mockup details if it is a simulated room
        const mockStates: Record<string, RoomState> = {
          'R-709': {
            roomId: 'R-709',
            mode: 'multi',
            gameType: 'single',
            currentTurn: 0,
            rolls: [4, 1],
            rollHistory: [1, 2, 4],
            turnState: 'moving',
            lastShells: [1, 1, 0, 1],
            diceValue: 3,
            hasBonusTurn: false,
            winner: null,
            players: {
              '0': { uid: 'u1', name: 'SoulTaker', color: '#EF4444', team: 'A', ready: true, isBot: false },
              '1': { uid: 'u2', name: 'ShadowBlade', color: '#00C2FF', team: 'B', ready: true, isBot: false }
            },
            pieces: [
              { id: 0, playerId: 0, indexInPath: 12 },
              { id: 1, playerId: 0, indexInPath: 8 },
              { id: 4, playerId: 1, indexInPath: 5 }
            ],
            chat: [
              { id: 'c1', senderName: 'SoulTaker', message: 'Good luck warrior.', timestamp: new Date(Date.now() - 300000).toISOString() },
              { id: 'c2', senderName: 'ShadowBlade', message: 'You too. Watch your tiles.', timestamp: new Date(Date.now() - 280000).toISOString() }
            ]
          },
          'R-112': {
            roomId: 'R-112',
            mode: 'multi',
            gameType: 'single',
            currentTurn: 1,
            rolls: [12],
            rollHistory: [12, 1],
            turnState: 'rolling',
            lastShells: [1, 1, 1, 1],
            diceValue: 12,
            hasBonusTurn: true,
            winner: null,
            players: {
              '0': { uid: 'u4', name: 'CyberShaman', color: '#F5B041', team: 'A', ready: true, isBot: false },
              '1': { uid: 'u6', name: 'NeonDagger', color: '#10B981', team: 'B', ready: true, isBot: false }
            },
            pieces: [
              { id: 0, playerId: 0, indexInPath: 2 },
              { id: 4, playerId: 1, indexInPath: 3 }
            ],
            chat: [
              { id: 'ca', senderName: 'NeonDagger', message: 'Wait, 12 again?', timestamp: new Date().toISOString() }
            ]
          }
        };
        setInspectingRoom(mockStates[roomId] || null);
      }
    });
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
          Active Deployments Monitor ({rooms.length})
        </h4>
        <button 
          onClick={fetchRooms}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070A12] border border-gray-800 rounded font-orbitron text-[10px] text-gray-400 hover:text-white uppercase transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Force Sync</span>
        </button>
      </div>

      {/* Grid of room cards */}
      {loading && rooms.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-mono text-xs">Polling combat quadrants...</div>
      ) : rooms.length === 0 ? (
        <div className="p-8 text-center text-gray-500 font-mono text-xs">No active lobbies detected.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.roomId} 
              className={`bg-cyberPanel border rounded p-5 shadow-lg relative flex flex-col justify-between transition-all ${
                room.status === 'playing' ? 'border-cyberOrange/20 hover:border-cyberOrange/40' : 'border-gray-900 hover:border-gray-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-900 pb-3 mb-4">
                <div>
                  <span className="font-mono text-[10px] text-gray-500">ROOM UUID</span>
                  <h5 className="font-orbitron text-sm font-bold text-white tracking-wide">{room.roomId}</h5>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] border font-orbitron font-bold uppercase ${
                    room.status === 'playing' ? 'bg-cyberOrange/10 border-cyberOrange/20 text-cyberOrange' :
                    'bg-cyberBlue/10 border-cyberBlue/20 text-cyberBlue'
                  }`}>
                    {room.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">DUR: {formatDuration(room.duration)}</span>
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-3 mb-5">
                <span className="font-orbitron text-[9px] text-gray-500 tracking-widest uppercase block">Combatants</span>
                {Object.keys(room.players).length === 0 ? (
                  <div className="text-[11px] text-gray-600 font-mono italic">Waiting for players to connect...</div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(room.players).map(([, p]) => (
                      <div key={p.uid} className="flex items-center justify-between bg-[#070A12] border border-gray-950 px-3 py-2 rounded text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-black" 
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-gray-200 font-bold">{p.name}</span>
                          {p.isBot && <span className="text-[9px] text-gray-500 bg-gray-950 px-1 py-0.2 rounded border border-gray-800">BOT</span>}
                        </div>
                        <button
                          onClick={() => handleRemovePlayer(room.roomId, p.uid, p.name)}
                          className="p-1 bg-red-950/20 text-red-400 hover:bg-red-500 hover:text-black rounded transition-all cursor-pointer"
                          title="Evict Player"
                        >
                          <UserMinus size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer specs & Actions */}
              <div className="flex items-center justify-between border-t border-gray-900 pt-3">
                <span className="text-[10px] text-gray-500 font-mono">
                  SPECS: <span className="text-cyberBlue font-bold">{room.spectators}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleInspect(room.roomId)}
                    className="px-2.5 py-1.5 bg-cyberBlue/10 border border-cyberBlue/20 text-cyberBlue text-[10px] font-orbitron uppercase rounded hover:bg-cyberBlue hover:text-black transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye size={12} />
                    <span>Inspect</span>
                  </button>
                  <button
                    onClick={() => handleForceClose(room.roomId)}
                    className="px-2.5 py-1.5 bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] font-orbitron uppercase rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <XOctagon size={12} />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Room Overlay Modal */}
      {inspectingRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000]/60 z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-cyberPanel border border-cyberOrange/20 rounded shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="h-1 bg-cyberOrange w-full" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-gray-500">LIVE SPECTATING OVERRIDE</span>
                <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                  Room Inspection: {inspectingRoom.roomId}
                </h4>
              </div>
              <button 
                onClick={() => setInspectingRoom(null)} 
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
              {/* Game State Details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-[#070A12] border border-gray-950 rounded">
                  <div className="text-gray-500 mb-1 text-[10px] font-orbitron">TURN STATE</div>
                  <div className="text-cyberOrange font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyberOrange animate-pulse" />
                    {inspectingRoom.turnState?.toUpperCase()}
                  </div>
                </div>
                <div className="p-3 bg-[#070A12] border border-gray-950 rounded">
                  <div className="text-gray-500 mb-1 text-[10px] font-orbitron">ACTIVE ROLLS / VALUE</div>
                  <div className="text-cyberGold font-bold">
                    {inspectingRoom.rolls?.join(', ') || 'No active rolls'} (Value: {inspectingRoom.diceValue})
                  </div>
                </div>
              </div>

              {/* Pieces Tracker */}
              <div className="bg-[#070A12] border border-gray-950 rounded p-4">
                <span className="font-orbitron text-[10px] text-gray-500 tracking-wider uppercase block mb-3">Live Pieces on Path</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  {inspectingRoom.pieces?.map((piece) => {
                    const player = inspectingRoom.players[piece.playerId.toString()];
                    return (
                      <div key={piece.id} className="p-2 border border-gray-900 bg-cyberPanel rounded flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: player?.color || '#ccc' }} />
                          <span className="text-gray-300 font-bold">P{piece.id}</span>
                        </div>
                        <span className="text-cyberBlue">Idx: {piece.indexInPath}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Chat Logs */}
              <div className="bg-[#070A12] border border-gray-950 rounded p-4 flex flex-col h-44">
                <span className="font-orbitron text-[10px] text-gray-500 tracking-wider uppercase block mb-3 flex items-center gap-1.5">
                  <MessageSquare size={12} /> Live Broadcast Chat Feed
                </span>
                <div className="flex-1 overflow-y-auto space-y-2 text-xs font-mono scrollbar-thin">
                  {!inspectingRoom.chat || inspectingRoom.chat.length === 0 ? (
                    <div className="text-gray-600 italic">No communication logged in this session.</div>
                  ) : (
                    inspectingRoom.chat.map((msg, idx) => (
                      <div key={idx} className="text-gray-400">
                        <span className="text-cyberBlue font-bold">{msg.senderName}:</span> {msg.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => handleForceClose(inspectingRoom.roomId)}
                className="px-4 py-2 bg-red-950/30 border border-red-900/40 text-red-400 font-orbitron text-[10px] uppercase rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all cursor-pointer"
              >
                Force Terminate
              </button>
              <button
                onClick={() => setInspectingRoom(null)}
                className="px-4 py-2 border border-gray-800 text-gray-400 font-orbitron text-[10px] uppercase rounded hover:text-white transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
