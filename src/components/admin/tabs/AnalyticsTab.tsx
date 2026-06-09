import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, DollarSign, Heart, Calendar, RefreshCw } from 'lucide-react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminUser, AdminMatch } from '../../../supabase/adminDb';

export const AnalyticsTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [allUsers, allMatches] = await Promise.all([
        adminDb.getUsers(),
        adminDb.getMatches()
      ]);
      setUsers(allUsers);
      setMatches(allMatches);
    } catch (err) {
      console.error("Failed to load analytics data from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // 1. STATS CALCULATIONS
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  const dau = users.filter(u => new Date(u.last_login).getTime() > oneDayAgo).length;
  const mau = users.filter(u => new Date(u.last_login).getTime() > thirtyDaysAgo).length;
  const engagementRate = mau > 0 ? ((dau / mau) * 100).toFixed(1) : "0.0";

  const completedMatches = matches.filter(m => m.status === 'completed');
  const avgMatchDuration = completedMatches.length > 0
    ? Math.round(completedMatches.reduce((acc, m) => acc + m.duration, 0) / completedMatches.length)
    : 0;
  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  const onlineCount = users.filter(u => u.online_status).length;
  // Estimated peak CCU (scaled active online count)
  const peakCCU = Math.max(onlineCount, Math.round(users.length * 0.15));

  const totalCoins = users.reduce((acc, u) => acc + u.coins, 0);
  const startingCoins = users.length * 1000;
  const estimatedRev = Math.max(0, (totalCoins - startingCoins) * 0.01).toFixed(2);

  // 2. USER GROWTH CALCULATION (Cumulative)
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getGrowthData = () => {
    if (users.length === 0) {
      return [
        { date: 'Start', count: 0 },
        { date: 'Today', count: 0 }
      ];
    }
    const sortedUsers = [...users].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let cumulative = 0;
    const growthMap: Record<string, number> = {};
    
    // Seed initial point
    if (sortedUsers.length > 0) {
      const firstDate = new Date(sortedUsers[0].created_at);
      const beforeFirst = new Date(firstDate.getTime() - 24 * 60 * 60 * 1000);
      growthMap[formatDate(beforeFirst.toISOString())] = 0;
    }

    sortedUsers.forEach(u => {
      const dateStr = formatDate(u.created_at);
      cumulative += 1;
      growthMap[dateStr] = cumulative;
    });

    return Object.entries(growthMap).map(([date, count]) => ({ date, count }));
  };

  const growthData = getGrowthData();
  const maxGrowthCount = Math.max(...growthData.map(d => d.count), 1);
  const growthPoints = growthData.map((d, i) => {
    const x = growthData.length > 1 ? (i / (growthData.length - 1)) * 500 : 250;
    const y = 180 - (d.count / maxGrowthCount) * 145;
    return { x, y, label: d.date, count: d.count };
  });

  let pathD = "";
  if (growthPoints.length > 0) {
    pathD = `M ${growthPoints[0].x} ${growthPoints[0].y}`;
    for (let i = 1; i < growthPoints.length; i++) {
      pathD += ` L ${growthPoints[i].x} ${growthPoints[i].y}`;
    }
  }
  let areaD = "";
  if (growthPoints.length > 0) {
    areaD = `${pathD} L ${growthPoints[growthPoints.length - 1].x} 200 L ${growthPoints[0].x} 200 Z`;
  }

  // 3. DAILY MATCH VOLUME (7d)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const matches7d = last7Days.map(day => {
    const dayLabel = day.toLocaleDateString(undefined, { weekday: 'short' });
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;
    const count = matches.filter(m => {
      const t = new Date(m.timestamp).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    return { day: dayLabel, count };
  });
  const maxMatchCount = Math.max(...matches7d.map(m => m.count), 1);

  // 4. CCU ACTIVITY LOAD (24h)
  const activePlayers24h = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - (5 - i) * 4);
    return d;
  }).map(time => {
    const label = time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
    const windowStart = time.getTime() - 2 * 60 * 60 * 1000;
    const windowEnd = time.getTime() + 2 * 60 * 60 * 1000;
    // Count user logins within window
    const count = users.filter(u => {
      const t = new Date(u.last_login).getTime();
      return t >= windowStart && t < windowEnd;
    }).length;
    return { hour: label, players: Math.max(count, onlineCount ? 1 : 0) };
  });

  // 5. COHORT RETENTION RATE
  const calculateRetention = (days: number) => {
    const eligibleUsers = users.filter(u => {
      const ageInMs = Date.now() - new Date(u.created_at).getTime();
      return ageInMs >= days * 24 * 60 * 60 * 1000;
    });
    if (eligibleUsers.length === 0) return 0;
    const retainedUsers = eligibleUsers.filter(u => {
      const timeDiffMs = new Date(u.last_login).getTime() - new Date(u.created_at).getTime();
      return timeDiffMs >= days * 24 * 60 * 60 * 1000;
    });
    return Math.round((retainedUsers.length / eligibleUsers.length) * 100);
  };

  const retentionRates = [
    { day: 'Day 1', rate: calculateRetention(1) || 0 },
    { day: 'Day 3', rate: calculateRetention(3) || 0 },
    { day: 'Day 7', rate: calculateRetention(7) || 0 },
    { day: 'Day 14', rate: calculateRetention(14) || 0 },
    { day: 'Day 30', rate: calculateRetention(30) || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Time filters header */}
      <div className="flex items-center justify-between bg-[#0e1322]/80 border border-[#00C2FF]/10 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00C2FF]/20 to-transparent" />
        <div>
          <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-[#00C2FF] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C2FF] animate-pulse" />
            System Operations Analytics
          </h4>
          <p className="text-[10px] text-white/40 font-mono mt-1">Live time-series data synced directly from the database</p>
        </div>
        <div>
          <button
            onClick={fetchAnalyticsData}
            disabled={loading}
            className="p-2 bg-white/5 border border-white/10 hover:border-[#00C2FF]/40 rounded-lg text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 font-orbitron text-[9px] uppercase tracking-widest disabled:opacity-50"
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center bg-[#0e1322]/40 border border-white/5 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00C2FF]/30 border-t-[#00C2FF] rounded-full animate-spin" />
            <span className="font-orbitron text-[10px] tracking-widest text-white/40 uppercase">Loading telemetry...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Analytics stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-[#0e1322]/60 border border-white/5 p-4 rounded-xl relative overflow-hidden backdrop-blur-sm">
              <div className="text-white/45 font-orbitron text-[9px] uppercase">DAU/MAU Engagement</div>
              <div className="text-xl font-bold mt-1.5 text-white">{engagementRate}%</div>
              <div className="text-[10px] text-[#00E676] mt-1 flex items-center gap-1 font-bold">
                <TrendingUp size={12} /> Active ratio
              </div>
            </div>
            <div className="bg-[#0e1322]/60 border border-white/5 p-4 rounded-xl relative overflow-hidden backdrop-blur-sm">
              <div className="text-white/45 font-orbitron text-[9px] uppercase">Avg Match Duration</div>
              <div className="text-xl font-bold mt-1.5 text-white">{formatDuration(avgMatchDuration)}</div>
              <div className="text-[10px] text-[#00C2FF] mt-1">Telemetry averages</div>
            </div>
            <div className="bg-[#0e1322]/60 border border-white/5 p-4 rounded-xl relative overflow-hidden backdrop-blur-sm">
              <div className="text-white/45 font-orbitron text-[9px] uppercase">Active CCU</div>
              <div className="text-xl font-bold mt-1.5 text-white">{peakCCU}</div>
              <div className="text-[10px] text-[#FF9100] mt-1 font-bold">
                {onlineCount} user{onlineCount !== 1 ? 's' : ''} currently online
              </div>
            </div>
            <div className="bg-[#0e1322]/60 border border-white/5 p-4 rounded-xl relative overflow-hidden backdrop-blur-sm">
              <div className="text-white/45 font-orbitron text-[9px] uppercase">Platform Revenue (Est.)</div>
              <div className="text-xl font-bold mt-1.5 text-[#F5B041] flex items-center gap-0.5">
                <DollarSign size={18} /> {estimatedRev} <span className="text-[10px] text-white/40 font-normal ml-1">USD</span>
              </div>
              <div className="text-[10px] text-[#F5B041]/70 mt-1">Derived from combatant coins</div>
            </div>
          </div>

          {/* Custom SVG Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth - Area Spline Curve Chart */}
            <div className="bg-[#0e1322]/60 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <TrendingUp size={16} className="text-[#00C2FF]" />
                <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Registered Combatant Growth</h5>
              </div>

              <div className="h-56 relative w-full pt-4">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />

                  {/* Area path */}
                  {areaD && <path d={areaD} fill="url(#blueGlow)" />}

                  {/* Outline Line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#00C2FF"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_0_8px_rgba(0,194,255,0.5)]"
                    />
                  )}

                  {/* Hover Circles */}
                  {growthPoints.map((gp, i) => (
                    <circle key={i} cx={gp.x} cy={gp.y} r="4" fill="#00C2FF" stroke="#fff" strokeWidth="1" />
                  ))}
                </svg>

                {/* Labels overlay */}
                <div className="absolute inset-0 flex justify-between items-end text-[8px] font-mono text-white/35 pointer-events-none pt-4">
                  {growthPoints.map((gp, i) => (
                    <span key={i} className={i === growthPoints.length - 1 ? 'text-right' : ''}>
                      {gp.label}<br />{gp.count}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Matches Fought Today - Bar Chart */}
            <div className="bg-[#0e1322]/60 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <Activity size={16} className="text-[#FF9100]" />
                <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Daily Match Volume (7d)</h5>
              </div>

              <div className="h-56 relative w-full flex items-end justify-between px-2 pt-6">
                {matches7d.map((d, index) => {
                  const heightPct = (d.count / maxMatchCount) * 80;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 max-w-[45px]">
                      <div className="font-mono text-[9px] text-white/45">{d.count}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-[#FF9100]/20 to-[#FF9100] border border-[#FF9100]/40 rounded-t transition-all hover:brightness-125 duration-350 cursor-pointer"
                        style={{ height: `${heightPct}%`, minHeight: '6px' }}
                      />
                      <div className="font-orbitron text-[9px] text-white/40 mt-1 uppercase tracking-wider">{d.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peak Concurrent Players - Hourly Bar Chart */}
            <div className="bg-[#0e1322]/60 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <Calendar size={16} className="text-[#F5B041]" />
                <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">CCU Activity Load (24h)</h5>
              </div>

              <div className="h-56 relative w-full flex items-end justify-between px-2 pt-6">
                {activePlayers24h.map((h, index) => {
                  const maxVal = Math.max(...activePlayers24h.map(ap => ap.players), 1);
                  const heightPct = (h.players / maxVal) * 75;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 max-w-[60px]">
                      <div className="font-mono text-[9px] text-white/45">{h.players}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-[#F5B041]/20 via-[#F5B041]/60 to-[#F5B041] border border-[#F5B041]/40 rounded-t transition-all hover:brightness-125 duration-350"
                        style={{ height: `${heightPct}%`, minHeight: '6px' }}
                      />
                      <div className="font-mono text-[8px] text-white/40 mt-1">{h.hour}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player Retention - Stepped Cohort Index */}
            <div className="bg-[#0e1322]/60 border border-white/5 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                <Heart size={16} className="text-red-500" />
                <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Cohort Retention Rate (%)</h5>
              </div>

              <div className="h-56 relative w-full flex flex-col justify-around text-xs font-mono">
                {retentionRates.map((c, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-white/45">
                      <span>{c.day}</span>
                      <span className="font-bold text-white">{c.rate}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/60 border border-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000"
                        style={{ width: `${c.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
