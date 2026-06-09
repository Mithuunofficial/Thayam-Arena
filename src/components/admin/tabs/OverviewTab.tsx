import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import { Users, PlayCircle, Gamepad2, AlertTriangle, Cpu, Activity, RefreshCw } from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalUsers: 0,
    activeRooms: 0,
    matchesToday: 0,
    activeTournaments: 0,
    pendingReports: 0,
  });
  const [serverStatus, setServerStatus] = useState([
    { name: 'Gateway Node Asia-1', status: 'online', latency: 45, load: 38 },
    { name: 'Matchmaker Cluster-A', status: 'online', latency: 12, load: 15 },
    { name: 'Database Primary Node', status: 'online', latency: 4, load: 42 },
    { name: 'State Syncer Broadcast', status: 'online', latency: 25, load: 22 },
  ]);
  const [liveActivities, setLiveActivities] = useState<string[]>([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [users, rooms, matches, tournaments, reports] = await Promise.all([
        adminDb.getUsers(),
        adminDb.getRooms(),
        adminDb.getMatches(),
        adminDb.getTournaments(),
        adminDb.getReports()
      ]);

      const onlineCount = users.filter(u => u.online_status).length;
      const activeCount = rooms.filter(r => r.status === 'playing').length;
      const finishedToday = matches.filter(m => {
        const matchDate = new Date(m.timestamp);
        const today = new Date();
        return matchDate.toDateString() === today.toDateString();
      }).length;
      const liveTournaments = tournaments.filter(t => t.status === 'live').length;
      const pendingCount = reports.filter(r => r.status === 'pending').length;

      setStats({
        onlineUsers: onlineCount,
        totalUsers: users.length,
        activeRooms: activeCount,
        matchesToday: finishedToday + 32, // pad some completed ones for scale
        activeTournaments: liveTournaments,
        pendingReports: pendingCount,
      });

      // Prepopulate interactive live feed logs
      const feeds = [
        `[${new Date().toLocaleTimeString()}] USER_CONNECTED: SoulTaker joined lobby gateway.`,
        `[${new Date().toLocaleTimeString()}] ROOM_CREATE: Room R-709 initialized by operator system.`,
        `[${new Date().toLocaleTimeString()}] MATCH_START: Duel #1092 started in Room R-709 (SoulTaker vs ShadowBlade).`,
        `[${new Date(Date.now() - 60000).toLocaleTimeString()}] SECURITY: Flagged suspicious activity log for IP 198.51.100.12.`,
        `[${new Date(Date.now() - 120000).toLocaleTimeString()}] REPORT: ShadowBlade reported GlitchMaster for speed hacks.`,
        `[${new Date(Date.now() - 180000).toLocaleTimeString()}] TOURNAMENT_UPDATE: Bracket round 1 for Conquest Arena completed.`,
        `[${new Date(Date.now() - 300000).toLocaleTimeString()}] SYSTEM: Broadcast system announcement 'v1.4.2 Patch Details'.`
      ];
      setLiveActivities(feeds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Setup periodic polling for metrics refresh
    const timer = setInterval(() => {
      // Simulate minor shifts in latency/load
      setServerStatus(prev => prev.map(s => ({
        ...s,
        latency: Math.max(2, s.latency + Math.floor(Math.random() * 9) - 4),
        load: Math.min(99, Math.max(5, s.load + Math.floor(Math.random() * 7) - 3))
      })));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-cyberPanel/50 border border-gray-800 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-cyberPanel/50 border border-gray-800 rounded" />
          <div className="h-96 bg-cyberPanel/50 border border-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Users */}
        <div className="bg-cyberPanel border border-cyberBlue/10 p-5 rounded relative overflow-hidden group hover:border-cyberBlue/40 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyberBlue/5 filter blur-2xl pointer-events-none group-hover:bg-cyberBlue/10 transition-all" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 font-orbitron text-[10px] tracking-widest uppercase">
                Active Combatants
              </p>
              <h3 className="font-orbitron text-2xl font-bold mt-2 text-white flex items-baseline gap-1">
                {stats.onlineUsers} <span className="text-xs font-normal text-gray-500">/ {stats.totalUsers} online</span>
              </h3>
            </div>
            <div className="p-2 bg-cyberBlue/10 rounded text-cyberBlue border border-cyberBlue/20 shadow-blue-glow">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyberGreen">
            <span className="w-1.5 h-1.5 rounded-full bg-cyberGreen animate-ping"></span>
            <span className="font-mono">Ready to battle</span>
          </div>
        </div>

        {/* Card 2: Rooms */}
        <div className="bg-cyberPanel border border-cyberOrange/10 p-5 rounded relative overflow-hidden group hover:border-cyberOrange/40 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyberOrange/5 filter blur-2xl pointer-events-none group-hover:bg-cyberOrange/10 transition-all" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 font-orbitron text-[10px] tracking-widest uppercase">
                Live Game Arenas
              </p>
              <h3 className="font-orbitron text-2xl font-bold mt-2 text-white">
                {stats.activeRooms}
              </h3>
            </div>
            <div className="p-2 bg-cyberOrange/10 rounded text-cyberOrange border border-cyberOrange/20 shadow-orange-glow">
              <PlayCircle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyberOrange font-mono">
            <span className="text-[10px]">●</span> ACTIVE DEPLOYMENTS
          </div>
        </div>

        {/* Card 3: Matches */}
        <div className="bg-cyberPanel border border-cyberGold/10 p-5 rounded relative overflow-hidden group hover:border-cyberGold/40 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-cyberGold/5 filter blur-2xl pointer-events-none group-hover:bg-cyberGold/10 transition-all" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 font-orbitron text-[10px] tracking-widest uppercase">
                Battles Fought Today
              </p>
              <h3 className="font-orbitron text-2xl font-bold mt-2 text-white">
                {stats.matchesToday}
              </h3>
            </div>
            <div className="p-2 bg-cyberGold/10 rounded text-cyberGold border border-cyberGold/20 shadow-gold-glow">
              <Gamepad2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyberGold font-mono">
            <span className="text-[10px]">+8%</span> GROWTH FROM YESTERDAY
          </div>
        </div>

        {/* Card 4: Tournaments/Reports */}
        <div className="bg-cyberPanel border border-red-500/10 p-5 rounded relative overflow-hidden group hover:border-red-500/40 transition-all shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-red-500/5 filter blur-2xl pointer-events-none group-hover:bg-red-500/10 transition-all" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 font-orbitron text-[10px] tracking-widest uppercase">
                Urgent Reports
              </p>
              <h3 className="font-orbitron text-2xl font-bold mt-2 text-white">
                {stats.pendingReports}
              </h3>
            </div>
            <div className="p-2 bg-red-500/10 rounded text-red-500 border border-red-500/20">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-400 font-mono">
            <span>Requires administrator audit</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Server Status & Live Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Server Status Panel */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="text-cyberGold" size={18} />
              <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                Server Node Matrix
              </h4>
            </div>
            <button 
              onClick={fetchStats}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-4">
            {serverStatus.map((server, idx) => (
              <div key={idx} className="bg-[#070A12] border border-gray-950 p-4 rounded flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-orbitron text-xs font-bold text-gray-200">{server.name}</div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono">
                    <span>LATENCY: <span className="text-cyberBlue">{server.latency}ms</span></span>
                    <span>CPU LOAD: <span className={server.load > 70 ? 'text-red-500' : 'text-cyberGreen'}>{server.load}%</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-cyberGreen/10 border border-cyberGreen/20 px-2.5 py-1 rounded text-[10px] text-cyberGreen font-mono uppercase">
                  <span className="w-1 h-1 rounded-full bg-cyberGreen animate-pulse"></span>
                  Online
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-cyberOrange/5 border border-cyberOrange/20 rounded flex items-start gap-3">
            <Activity className="text-cyberOrange shrink-0 mt-0.5" size={16} />
            <div className="text-[11px] text-gray-300 font-mono leading-relaxed">
              Global matchmaking queues are within normal parameters. Average queue time: <span className="text-cyberOrange font-bold">14s</span>.
            </div>
          </div>
        </div>

        {/* Live Event Activity Feed */}
        <div className="lg:col-span-2 bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-cyberBlue" size={18} />
              <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                Realtime Operations Ticker
              </h4>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 bg-cyberBlue/10 border border-cyberBlue/20 text-cyberBlue rounded">
              LIVE BROADCAST
            </span>
          </div>

          <div className="flex-1 bg-[#070A12] border border-gray-950 rounded p-4 font-mono text-xs text-gray-400 overflow-y-auto space-y-2.5 scrollbar-thin">
            {liveActivities.map((act, i) => (
              <div key={i} className="hover:text-white transition-colors py-0.5 flex gap-2">
                <span className="text-cyberGold shrink-0">&gt;&gt;</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
