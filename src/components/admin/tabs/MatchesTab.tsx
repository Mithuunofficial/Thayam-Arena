import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminMatch } from '../../../supabase/adminDb';
import { ClipboardList, Trash2, Eye, RefreshCw, X } from 'lucide-react';

export const MatchesTab: React.FC = () => {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectingMatch, setInspectingMatch] = useState<AdminMatch | null>(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adminDb.subscribeToMatches((data) => {
      setMatches(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCancelMatch = async (matchId: string) => {
    if (window.confirm(`CANCEL MATCH: Are you sure you want to void Match ${matchId}? Player ratings/records will be flagged.`)) {
      await adminDb.cancelMatch(matchId);
      await adminDb.createAdminLog('Void Match', matchId, `Voided match record ${matchId}.`);
      fetchMatches();
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Search and sync */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
          Historical Battles Registry
        </h4>
        <button 
          onClick={fetchMatches}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070A12] border border-gray-800 rounded font-orbitron text-[10px] text-gray-400 hover:text-white uppercase transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Matches List */}
      <div className="bg-cyberPanel border border-gray-900 rounded overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">Loading logs archive...</div>
        ) : matches.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">No matches logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#070A12] border-b border-gray-900 text-[10px] text-gray-400 font-orbitron uppercase tracking-widest">
                  <th className="p-4">Match ID</th>
                  <th className="p-4">Match Setup</th>
                  <th className="p-4">Outcome</th>
                  <th className="p-4 text-center">Moves</th>
                  <th className="p-4 text-center">Duration</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Audit Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/40 text-xs font-mono">
                {matches.map((match) => (
                  <tr key={match.matchId} className="hover:bg-gray-800/10 transition-colors">
                    <td className="p-4 text-gray-500 text-[10px]">
                      {match.matchId}
                    </td>
                    <td className="p-4 text-gray-200">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-cyberBlue">{match.players[0]?.username || 'TBD'}</span>
                        <span className="text-gray-500 text-[9px]">VS</span>
                        <span className="font-bold text-cyberOrange">{match.players[1]?.username || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {match.winner_id ? (
                        <span className="text-cyberGreen font-bold">
                          Winner: {match.players.find(p => p.uid === match.winner_id)?.username || 'Unknown'}
                        </span>
                      ) : (
                        <span className="text-gray-500">Draw / Cancelled</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-300 font-bold">{match.move_count}</td>
                    <td className="p-4 text-center text-gray-400">{formatDuration(match.duration)}</td>
                    <td className="p-4 text-gray-500 text-[10px]">
                      {new Date(match.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] border font-orbitron font-bold uppercase ${
                        match.status === 'completed' ? 'bg-cyberGreen/10 border-cyberGreen/20 text-cyberGreen' :
                        'bg-red-950/20 border-red-500/30 text-red-400'
                      }`}>
                        {match.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setInspectingMatch(match)}
                          className="p-1.5 bg-cyberBlue/10 border border-cyberBlue/20 text-cyberBlue rounded hover:bg-cyberBlue hover:text-black transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          <Eye size={12} /> Inspect Moves
                        </button>
                        {match.status === 'completed' && (
                          <button
                            onClick={() => handleCancelMatch(match.matchId)}
                            className="p-1.5 bg-red-950/30 border border-red-900/40 text-red-400 rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all cursor-pointer"
                            title="Void Match"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Match Moves Modal */}
      {inspectingMatch && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000]/60 z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-cyberPanel border border-cyberBlue/20 rounded shadow-2xl relative flex flex-col max-h-[80vh]">
            <div className="h-1 bg-cyberBlue w-full" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-gray-500">MOVE INDEX LOGGER</span>
                <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                  Match Audit: {inspectingMatch.matchId}
                </h4>
              </div>
              <button 
                onClick={() => setInspectingMatch(null)} 
                className="text-gray-500 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
              <div className="bg-[#070A12] border border-gray-950 p-4 rounded text-xs font-mono text-gray-400 space-y-2">
                <div>MATCH TIME: {new Date(inspectingMatch.timestamp).toLocaleString()}</div>
                <div>TOTAL DURATION: {formatDuration(inspectingMatch.duration)} ({inspectingMatch.duration} seconds)</div>
                <div>MOVE COUNT: {inspectingMatch.move_count} registered events</div>
              </div>

              <div className="bg-[#070A12] border border-gray-950 rounded p-4 flex flex-col">
                <span className="font-orbitron text-[10px] text-gray-500 tracking-wider uppercase block mb-3 flex items-center gap-1">
                  <ClipboardList size={12} /> Game Move Stream logs
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto text-xs font-mono text-gray-300 pr-2 scrollbar-thin">
                  {!inspectingMatch.game_logs || inspectingMatch.game_logs.length === 0 ? (
                    <div className="text-gray-600 italic">No move logs written for this match.</div>
                  ) : (
                    inspectingMatch.game_logs.map((log, index) => (
                      <div key={index} className="flex gap-2.5 hover:bg-gray-900/20 py-0.5">
                        <span className="text-cyberBlue shrink-0">[{index + 1}]</span>
                        <span>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-800 flex items-center justify-end gap-3">
              {inspectingMatch.status === 'completed' && (
                <button
                  onClick={() => {
                    handleCancelMatch(inspectingMatch.matchId);
                    setInspectingMatch(null);
                  }}
                  className="px-4 py-2 bg-red-950/30 border border-red-900/40 text-red-400 font-orbitron text-[10px] uppercase rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all cursor-pointer"
                >
                  Void Match
                </button>
              )}
              <button
                onClick={() => setInspectingMatch(null)}
                className="px-4 py-2 border border-gray-800 text-gray-400 font-orbitron text-[10px] uppercase rounded hover:text-white transition-all cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
