import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminTournament } from '../../../supabase/adminDb';
import { Plus, Trophy, Award, Users, Trash2, Calendar, GitFork, X } from 'lucide-react';

export const TournamentsTab: React.FC = () => {
  const [tournaments, setTournaments] = useState<AdminTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeBracket, setActiveBracket] = useState<AdminTournament | null>(null);

  // New Tournament Fields
  const [newName, setNewName] = useState('');
  const [newRewards, setNewRewards] = useState('');
  const [newStatus, setNewStatus] = useState<'upcoming' | 'live' | 'finished'>('upcoming');

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getTournaments();
      setTournaments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRewards) return;

    await adminDb.createTournament(newName, newRewards, newStatus);
    await adminDb.createAdminLog('Create Tournament', null, `Created tournament event: ${newName}.`);
    
    // Reset form
    setNewName('');
    setNewRewards('');
    setNewStatus('upcoming');
    setIsCreateOpen(false);
    fetchTournaments();
  };

  const handleUpdateStatus = async (id: string, status: 'upcoming' | 'live' | 'finished') => {
    await adminDb.updateTournament(id, { status });
    await adminDb.createAdminLog('Update Tournament Status', id, `Changed status of tournament to ${status}.`);
    fetchTournaments();
    // Update active bracket if selected
    if (activeBracket && activeBracket.id === id) {
      setActiveBracket(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Tournament "${name}"?`)) {
      await adminDb.deleteTournament(id);
      await adminDb.createAdminLog('Delete Tournament', id, `Removed tournament structure for ${name}.`);
      fetchTournaments();
      if (activeBracket && activeBracket.id === id) setActiveBracket(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header operations */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
          Cyber Tournament Arena Organizer
        </h4>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 bg-cyberGold hover:bg-cyberGold/90 text-black font-orbitron font-bold text-[10px] tracking-widest uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus size={14} />
          <span>Launch Season Bracket</span>
        </button>
      </div>

      {/* Main split dashboard: left list, right bracket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left list (col span 1 or 2 depending on if bracket is open) */}
        <div className={activeBracket ? 'lg:col-span-1 space-y-4' : 'lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4'}>
          {loading ? (
            <div className="p-8 text-center text-gray-500 font-mono text-xs col-span-3">Syncing tournament brackets...</div>
          ) : tournaments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-mono text-xs col-span-3">No active tournaments configured.</div>
          ) : (
            tournaments.map((tourney) => (
              <div 
                key={tourney.id} 
                className={`bg-cyberPanel border p-5 rounded flex flex-col justify-between hover:border-cyberGold/30 transition-all ${
                  activeBracket?.id === tourney.id ? 'border-cyberGold' : 'border-gray-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <Trophy size={20} className={
                      tourney.status === 'live' ? 'text-cyberOrange animate-bounce' :
                      tourney.status === 'finished' ? 'text-cyberGold' : 'text-gray-500'
                    } />
                    <span className={`px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border ${
                      tourney.status === 'live' ? 'bg-cyberOrange/15 border-cyberOrange/35 text-cyberOrange' :
                      tourney.status === 'finished' ? 'bg-cyberGreen/15 border-cyberGreen/35 text-cyberGreen' :
                      'bg-gray-950 border-gray-800 text-gray-400'
                    }`}>
                      {tourney.status.toUpperCase()}
                    </span>
                  </div>

                  <h5 className="font-orbitron text-xs font-bold text-gray-200 tracking-wide mb-1 leading-snug">{tourney.name}</h5>
                  <div className="space-y-1 mt-3 font-mono text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5"><Award size={12} className="text-cyberGold" /> REWARDS: {tourney.rewards}</div>
                    <div className="flex items-center gap-1.5"><Users size={12} className="text-cyberBlue" /> SEEDS: {tourney.players.length || 8} combatants</div>
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-500" /> CREATED: {new Date(tourney.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-900 pt-4 mt-5">
                  <div className="flex items-center gap-1.5">
                    {tourney.status === 'upcoming' && (
                      <button
                        onClick={() => handleUpdateStatus(tourney.id, 'live')}
                        className="px-2 py-1 bg-cyberOrange/10 border border-cyberOrange/20 text-cyberOrange hover:bg-cyberOrange hover:text-black rounded text-[9px] font-orbitron uppercase transition-all cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    {tourney.status === 'live' && (
                      <button
                        onClick={() => handleUpdateStatus(tourney.id, 'finished')}
                        className="px-2 py-1 bg-cyberGreen/10 border border-cyberGreen/20 text-cyberGreen hover:bg-cyberGreen hover:text-black rounded text-[9px] font-orbitron uppercase transition-all cursor-pointer"
                      >
                        Finalize
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(tourney.id, 'upcoming')}
                      className="px-2 py-1 bg-[#070A12] border border-gray-800 text-gray-400 hover:text-white rounded text-[9px] font-orbitron uppercase transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveBracket(tourney)}
                      className="p-1.5 bg-cyberBlue/10 border border-cyberBlue/20 text-cyberBlue rounded hover:bg-cyberBlue hover:text-black transition-all cursor-pointer"
                      title="Inspect Brackets"
                    >
                      <GitFork size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(tourney.id, tourney.name)}
                      className="p-1.5 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-500 hover:text-black hover:border-red-500 rounded transition-all cursor-pointer"
                      title="Delete Tournament"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Bracket Viewer (col span 2) */}
        {activeBracket && (
          <div className="lg:col-span-2 bg-cyberPanel border border-gray-900 rounded p-6 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-5">
              <div>
                <span className="font-mono text-[9px] text-gray-500">REALTIME TOURNAMENT SEED TREE</span>
                <h5 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">{activeBracket.name}</h5>
              </div>
              <button 
                onClick={() => setActiveBracket(null)} 
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Visual Brackets tree layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 overflow-x-auto min-h-64 scrollbar-thin">
              {/* Round 1 (Quarterfinals or Semifinals depending on records) */}
              <div className="flex flex-col justify-around h-full gap-4 shrink-0">
                <span className="text-[10px] font-orbitron text-gray-500 text-center uppercase tracking-widest mb-1">Quarterfinals</span>
                <div className="space-y-4">
                  <div className="p-2.5 bg-[#070A12] border border-gray-900 rounded text-[11px] font-mono w-44">
                    <div className="flex justify-between text-cyberBlue"><span>SoulTaker</span> <span className="font-bold">1</span></div>
                    <div className="flex justify-between text-gray-500"><span>LokiPoki</span> <span>0</span></div>
                  </div>
                  <div className="p-2.5 bg-[#070A12] border border-gray-900 rounded text-[11px] font-mono w-44">
                    <div className="flex justify-between text-cyberBlue"><span>ShadowBlade</span> <span className="font-bold">1</span></div>
                    <div className="flex justify-between text-gray-500"><span>NeonDagger</span> <span>0</span></div>
                  </div>
                </div>
              </div>

              {/* Connecting line spacer */}
              <div className="hidden sm:block text-cyberGold text-xs animate-pulse">&gt;&gt;</div>

              {/* Round 2 (Semifinals) */}
              <div className="flex flex-col justify-around h-full gap-8 shrink-0">
                <span className="text-[10px] font-orbitron text-gray-500 text-center uppercase tracking-widest mb-1">Semifinals</span>
                <div className="space-y-8">
                  <div className="p-2.5 bg-[#070A12] border border-cyberGold/20 rounded text-[11px] font-mono w-44 shadow-gold-glow">
                    <div className="flex justify-between text-gray-300"><span>SoulTaker</span> <span className="text-gray-500">-</span></div>
                    <div className="flex justify-between text-gray-300"><span>AresWar</span> <span className="text-gray-500">-</span></div>
                  </div>
                  <div className="p-2.5 bg-[#070A12] border border-cyberGold/20 rounded text-[11px] font-mono w-44 shadow-gold-glow">
                    <div className="flex justify-between text-gray-300"><span>ShadowBlade</span> <span className="text-gray-500">-</span></div>
                    <div className="flex justify-between text-gray-300"><span>Valkyrie9</span> <span className="text-gray-500">-</span></div>
                  </div>
                </div>
              </div>

              {/* Connecting line spacer */}
              <div className="hidden sm:block text-cyberGold text-xs animate-pulse">&gt;&gt;</div>

              {/* Grand Finals */}
              <div className="flex flex-col justify-center h-full shrink-0">
                <span className="text-[10px] font-orbitron text-gray-500 text-center uppercase tracking-widest mb-1">Championship</span>
                <div className="p-3 bg-cyberGold/5 border border-cyberGold rounded text-[11px] font-mono w-44 glow-gold">
                  <div className="flex justify-between text-gray-500"><span>TBD Match 5</span></div>
                  <div className="flex justify-between text-gray-500"><span>TBD Match 6</span></div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-900 pt-4 mt-4 text-[10px] text-gray-400 font-mono flex items-center justify-between">
              <span>STATUS: <span className="font-bold text-cyberGold">{activeBracket.status.toUpperCase()}</span></span>
              <span>Brackets update automatically on match completions</span>
            </div>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000]/60 z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-cyberPanel border border-cyberGold/20 rounded shadow-2xl relative">
            <div className="h-1 bg-cyberGold w-full" />
            <form onSubmit={handleCreate} className="p-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
                <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                  Establish Arena Season
                </h4>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Winter Battleground 2026"
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Rewards Pool
                  </label>
                  <input
                    type="text"
                    required
                    value={newRewards}
                    onChange={(e) => setNewRewards(e.target.value)}
                    placeholder="e.g. 2,000 Coins + Veteran Emblem"
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Initial Bracket Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  >
                    <option value="upcoming" className="bg-cyberPanel">UPCOMING (Registration open)</option>
                    <option value="live" className="bg-cyberPanel">LIVE (Arena match progression)</option>
                    <option value="finished" className="bg-cyberPanel">FINISHED (Brackets archived)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-800 text-gray-400 font-orbitron text-[10px] uppercase rounded hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyberGold text-black font-orbitron font-bold text-[10px] uppercase rounded hover:bg-cyberGold/90 transition-all cursor-pointer"
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
