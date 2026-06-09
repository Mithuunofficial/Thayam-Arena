import React, { useState, useEffect } from 'react';
import { useRouter } from '../Router';
import { adminDb } from '../../supabase/adminDb';

// Import Tab Components
import { OverviewTab } from './tabs/OverviewTab';
import { UsersTab } from './tabs/UsersTab';
import { RoomsTab } from './tabs/RoomsTab';
import { MatchesTab } from './tabs/MatchesTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { TournamentsTab } from './tabs/TournamentsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { ReportsTab } from './tabs/ReportsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { LogsTab } from './tabs/LogsTab';
import { SecurityTab } from './tabs/SecurityTab';

import {
  Menu, Bell, User, Cpu, Shield,
  LayoutDashboard, Users, PlayCircle, Gamepad2, BarChart2,
  Trophy, Megaphone, AlertTriangle, Settings, FileText,
  LogOut, Activity, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardProps {
  currentTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTab }) => {
  const { navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tickerActivities, setTickerActivities] = useState<string[]>([]);

  // Prepopulate live activity logs ticker
  useEffect(() => {
    const defaultActivities = [
      'SoulTaker rolled a Thayam in R-709',
      'ShadowBlade completed Match m1',
      'Valkyrie9 entered Matchmaking Queue',
      'Lobby broadcast: System maintenance in 4 hours',
      'GlitchMaster IP flagged for rate-limit warning',
      'CyberShaman joined Room R-112',
      'New Abuse report filed by ShadowBlade',
      'Summer Conquest Arena bracket progression calculated',
    ];
    setTickerActivities(defaultActivities);

    // Simulate real-time streams
    const interval = setInterval(() => {
      const actions = [
        'rolled a 4', 'captured a token', 'entered the safe zone',
        'joined the lobby', 'disconnected', 'initiated matching',
        'called for rematch', 'sent chat signal'
      ];
      const mockUsers = ['SoulTaker', 'ShadowBlade', 'ViperCSS', 'CyberShaman', 'NeonDagger', 'Valkyrie9', 'AresWar'];
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomRoom = `R-${Math.floor(Math.random() * 800) + 100}`;

      const newLog = `${randomUser} ${randomAction} in ${randomRoom}`;
      
      setTickerActivities(prev => [newLog, ...prev.slice(0, 15)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Terminate control session and logout?')) {
      await adminDb.createAdminLog('Logout', null, 'Admin session closed manually.');
      localStorage.removeItem('thayam_admin_session');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/admin', id: 'dashboard' },
    { label: 'Users', icon: <Users size={16} />, path: '/admin/users', id: 'users' },
    { label: 'Live Rooms', icon: <PlayCircle size={16} />, path: '/admin/rooms', id: 'rooms' },
    { label: 'Matches', icon: <Gamepad2 size={16} />, path: '/admin/matches', id: 'matches' },
    { label: 'Analytics', icon: <BarChart2 size={16} />, path: '/admin/analytics', id: 'analytics' },
    { label: 'Tournaments', icon: <Trophy size={16} />, path: '/admin/tournaments', id: 'tournaments' },
    { label: 'Notifications', icon: <Megaphone size={16} />, path: '/admin/notifications', id: 'notifications' },
    { label: 'Reports', icon: <AlertTriangle size={16} />, path: '/admin/reports', id: 'reports' },
    { label: 'Settings', icon: <Settings size={16} />, path: '/admin/settings', id: 'settings' },
    { label: 'Logs', icon: <FileText size={16} />, path: '/admin/logs', id: 'logs' },
    { label: 'Security', icon: <Shield size={16} />, path: '/admin/logs', id: 'security' }, // redirect security tab to /admin/logs or let logs route handle it
  ];

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <OverviewTab />;
      case 'users':
        return <UsersTab />;
      case 'rooms':
        return <RoomsTab />;
      case 'matches':
        return <MatchesTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'tournaments':
        return <TournamentsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'reports':
        return <ReportsTab />;
      case 'settings':
        return <SettingsTab />;
      case 'logs':
        return <LogsTab />;
      case 'security':
        return <SecurityTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-inter flex relative overflow-hidden">
      {/* Side Cyber Panel Navigation */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        className="bg-cyberPanel border-r border-gray-900/60 z-30 shrink-0 flex flex-col justify-between h-screen sticky top-0"
      >
        {/* Sidebar Header Logo */}
        <div>
          <div className="h-16 border-b border-gray-900/60 px-4 flex items-center justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2"
                >
                  <Cpu className="text-cyberGold drop-shadow-[0_0_4px_rgba(245,176,65,0.4)] shrink-0" size={18} />
                  <span className="font-orbitron font-bold text-xs tracking-widest text-white uppercase whitespace-nowrap">
                    Sys Operations
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full flex justify-center"
                >
                  <Cpu className="text-cyberGold" size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id || (item.id === 'logs' && currentTab === 'security');
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.id === 'dashboard' ? '/admin' : `/admin/${item.id === 'security' ? 'logs' : item.id}`)}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded text-xs font-orbitron uppercase tracking-wider cursor-pointer transition-all ${
                    isActive
                      ? 'bg-cyberGold/15 text-cyberGold border-l-2 border-cyberGold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/10'
                  }`}
                >
                  <span className={isActive ? 'text-cyberGold' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-gray-900/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded text-xs font-orbitron uppercase tracking-wider text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut size={16} className="text-red-400" />
            {sidebarOpen && <span>Shut Down Session</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-900/60 bg-cyberPanel px-6 flex items-center justify-between z-20">
          {/* Collapse Trigger & Server Status */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-800/20 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
            >
              <Menu size={18} />
            </button>

            {/* Server Status Header Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#070A12] border border-gray-950 rounded font-mono text-[10px] text-cyberGreen">
              <span className="w-1.5 h-1.5 rounded-full bg-cyberGreen animate-ping"></span>
              <span>NODE CLUSTER: ASIA-1 (99.8% ONLINE)</span>
            </div>
          </div>

          {/* Right Header: Notifs, profile */}
          <div className="flex items-center gap-3.5 relative">
            {/* Realtime Alert Bell */}
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="p-2 bg-[#070A12] border border-gray-950 text-gray-400 hover:text-white hover:border-gray-850 rounded relative transition-all cursor-pointer"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyberOrange animate-ping"></span>
            </button>

            {/* Notifications Dropdown menu */}
            <AnimatePresence>
              {notifDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-12 top-12 w-80 bg-cyberPanel border border-gray-900 shadow-2xl rounded p-4 font-mono text-xs z-50 space-y-3"
                >
                  <div className="font-orbitron font-bold border-b border-gray-900 pb-2 text-white flex justify-between items-center">
                    <span>Transmissions Received</span>
                    <button onClick={() => setNotifDropdownOpen(false)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pr-1">
                    <div className="p-2 bg-[#070A12] border border-gray-950 rounded">
                      <div className="text-[10px] text-cyberOrange font-bold">ALERT: Latency Warning</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Peak traffic CCU exceeds Asian node limits. Load balanced automatically.</div>
                    </div>
                    <div className="p-2 bg-[#070A12] border border-gray-950 rounded">
                      <div className="text-[10px] text-cyberBlue font-bold">EVENT: System update completed</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Patch build v1.4.2 successfully pushed to clusters.</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile trigger */}
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#070A12] border border-gray-950 text-gray-400 hover:text-white hover:border-gray-850 rounded transition-all cursor-pointer"
            >
              <User size={14} className="text-cyberGold" />
              <span className="font-orbitron text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Operator admin</span>
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-cyberPanel border border-gray-900 shadow-2xl rounded p-3 font-mono text-xs z-50 space-y-2"
                >
                  <div className="border-b border-gray-900 pb-2 mb-2">
                    <div className="font-bold text-white">Security Clearance</div>
                    <div className="text-[9px] text-cyberGold font-orbitron uppercase tracking-widest mt-0.5">LEVEL 5 ACCESS</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-1.5 text-red-400 hover:text-red-300 font-orbitron uppercase text-[10px] cursor-pointer"
                  >
                    Shut Down Link
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Split center layout: main tab on left, activity stream on right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Center Main Viewport */}
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {renderActiveTab()}
          </main>

          {/* Right Realtime Activity Panel (pinnable ticker list) */}
          <aside className="hidden xl:flex flex-col border-l border-gray-900/60 bg-cyberPanel w-72 shrink-0 h-[calc(100vh-64px)] justify-between">
            <div className="p-5 border-b border-gray-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={15} className="text-cyberOrange animate-pulse-glow" />
                <span className="font-orbitron text-xs font-bold uppercase tracking-widest text-white">Realtime stream</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-cyberOrange animate-ping"></span>
            </div>

            {/* List entries */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 font-mono text-[10px] text-gray-400 scrollbar-none">
              {tickerActivities.map((act, index) => (
                <div key={index} className="p-3 bg-[#070A12] border border-gray-950 rounded flex gap-2.5 items-start hover:border-gray-850 transition-colors">
                  <span className="text-cyberOrange shrink-0 animate-pulse">&gt;</span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>

            {/* Footer summary */}
            <div className="p-4 bg-[#070A12] border-t border-gray-900/60 text-[9px] text-gray-500 font-mono text-center">
              MONITORING CLUSTER STREAMS L1
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
