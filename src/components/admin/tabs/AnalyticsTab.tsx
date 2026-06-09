import React, { useState } from 'react';
import { Activity, TrendingUp, DollarSign, Heart, Calendar } from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '24h'>('7d');

  // Realistic mock analytics data points
  const activePlayers24h = [
    { hour: '00:00', players: 120 }, { hour: '04:00', players: 80 },
    { hour: '08:00', players: 250 }, { hour: '12:00', players: 410 },
    { hour: '16:00', players: 580 }, { hour: '20:00', players: 740 },
  ];

  const matches7d = [
    { day: 'Mon', count: 180 }, { day: 'Tue', count: 210 },
    { day: 'Wed', count: 245 }, { day: 'Thu', count: 195 },
    { day: 'Fri', count: 320 }, { day: 'Sat', count: 480 },
    { day: 'Sun', count: 420 },
  ];


  const retentionRates = [
    { day: 'Day 1', rate: 68 }, { day: 'Day 3', rate: 45 },
    { day: 'Day 7', rate: 32 }, { day: 'Day 14', rate: 24 },
    { day: 'Day 30', rate: 18 }
  ];

  return (
    <div className="space-y-6">
      {/* Time filters header */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <div>
          <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
            System Operations Analytics
          </h4>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Time series data streams updated 2 minutes ago</p>
        </div>
        <div className="flex items-center gap-1">
          {(['24h', '7d', '30d'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1 bg-[#070A12] border rounded font-orbitron text-[9px] uppercase tracking-wider cursor-pointer transition-all ${
                timeRange === t ? 'border-cyberGold text-cyberGold bg-cyberGold/5' : 'border-gray-900 text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-cyberPanel border border-gray-900 p-4 rounded relative overflow-hidden">
          <div className="text-gray-500 font-orbitron text-[9px] uppercase">DAU/MAU Engagement</div>
          <div className="text-xl font-bold mt-1.5 text-white">41.8%</div>
          <div className="text-[10px] text-cyberGreen mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> +2.4% from last week
          </div>
        </div>
        <div className="bg-cyberPanel border border-gray-900 p-4 rounded relative overflow-hidden">
          <div className="text-gray-500 font-orbitron text-[9px] uppercase">Avg Session Duration</div>
          <div className="text-xl font-bold mt-1.5 text-white">22m 45s</div>
          <div className="text-[10px] text-cyberBlue mt-1">Steady retention index</div>
        </div>
        <div className="bg-cyberPanel border border-gray-900 p-4 rounded relative overflow-hidden">
          <div className="text-gray-500 font-orbitron text-[9px] uppercase">Peak Concurrent Players</div>
          <div className="text-xl font-bold mt-1.5 text-white">1,240</div>
          <div className="text-[10px] text-cyberOrange mt-1 font-bold">Node capacity alert at 80%</div>
        </div>
        <div className="bg-cyberPanel border border-gray-900 p-4 rounded relative overflow-hidden">
          <div className="text-gray-500 font-orbitron text-[9px] uppercase">Platform Revenue (Est.)</div>
          <div className="text-xl font-bold mt-1.5 text-cyberGold flex items-center gap-0.5">
            <DollarSign size={18} /> 4,850.00 <span className="text-[10px] text-gray-500 font-normal ml-1">USD</span>
          </div>
          <div className="text-[10px] text-cyberGold mt-1">Coin package conversions</div>
        </div>
      </div>

      {/* Custom SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth - Area Spline Curve Chart */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-3 mb-4">
            <TrendingUp size={16} className="text-cyberBlue" />
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Registered Combatant Growth (30d)</h5>
          </div>

          <div className="h-56 relative w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              {/* Gradients */}
              <defs>
                <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C2FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00C2FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#1f2937" strokeWidth="0.5" strokeDasharray="4 4" />

              {/* Area path */}
              <path
                d="M 0 170 Q 125 150 250 110 T 500 40 L 500 200 L 0 200 Z"
                fill="url(#blueGlow)"
              />

              {/* Outline Line */}
              <path
                d="M 0 170 Q 125 150 250 110 T 500 40"
                fill="none"
                stroke="#00C2FF"
                strokeWidth="3"
                className="drop-shadow-[0_0_8px_rgba(0,194,255,0.6)]"
              />

              {/* Hover Circles */}
              <circle cx="250" cy="110" r="5" fill="#00C2FF" stroke="#fff" strokeWidth="1.5" />
              <circle cx="500" cy="40" r="5" fill="#00C2FF" stroke="#fff" strokeWidth="1.5" />
            </svg>

            {/* Labels overlay */}
            <div className="absolute inset-0 flex justify-between items-end text-[9px] font-mono text-gray-500 pointer-events-none pt-4">
              <span>June 01<br />1,020</span>
              <span>June 03<br />1,140</span>
              <span>June 05<br />1,290</span>
              <span>June 07<br />1,450</span>
              <span className="text-right">Today<br />1,680</span>
            </div>
          </div>
        </div>

        {/* Matches Fought Today - Bar Chart */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-3 mb-4">
            <Activity size={16} className="text-cyberOrange" />
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Daily Match Volume (7d)</h5>
          </div>

          <div className="h-56 relative w-full flex items-end justify-between px-2 pt-6">
            {matches7d.map((d, index) => {
              const maxVal = Math.max(...matches7d.map(m => m.count));
              const heightPct = (d.count / maxVal) * 80; // keep max at 80% height

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 max-w-[45px]">
                  <div className="font-mono text-[9px] text-gray-500">{d.count}</div>
                  <div 
                    className="w-full bg-gradient-to-t from-cyberOrange/40 to-cyberOrange border border-cyberOrange/50 rounded-t shadow-orange-glow transition-all hover:brightness-125 duration-350 cursor-pointer"
                    style={{ height: `${heightPct}%`, minHeight: '10px' }}
                  />
                  <div className="font-orbitron text-[9px] text-gray-400 mt-1 uppercase tracking-wider">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Concurrent Players - Hourly Bar Chart */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-3 mb-4">
            <Calendar size={16} className="text-cyberGold" />
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">CCU Activity Load (24h)</h5>
          </div>

          <div className="h-56 relative w-full flex items-end justify-between px-2 pt-6">
            {activePlayers24h.map((h, index) => {
              const maxVal = Math.max(...activePlayers24h.map(ap => ap.players));
              const heightPct = (h.players / maxVal) * 75;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 max-w-[60px]">
                  <div className="font-mono text-[9px] text-gray-500">{h.players}</div>
                  <div 
                    className="w-full bg-gradient-to-t from-cyberGold/30 via-cyberGold/60 to-cyberGold border border-cyberGold/50 rounded-t shadow-gold-glow transition-all hover:brightness-125 duration-350"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="font-mono text-[8px] text-gray-400 mt-1">{h.hour}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Retention - Stepped Cohort Index */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-5 shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-900 pb-3 mb-4">
            <Heart size={16} className="text-red-500" />
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Cohort Retention Rate (%)</h5>
          </div>

          <div className="h-56 relative w-full flex flex-col justify-around text-xs font-mono">
            {retentionRates.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{c.day}</span>
                  <span className="font-bold text-white">{c.rate}%</span>
                </div>
                <div className="w-full h-2 bg-gray-950 border border-gray-900 rounded-full overflow-hidden">
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
    </div>
  );
};
