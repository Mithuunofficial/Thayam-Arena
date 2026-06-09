import React, { useState, useEffect } from 'react';
import { useAuth } from '../supabase/AuthContext';
import { supabase, isMock } from '../supabase/config';
import { useRouter } from './Router';
import { ArrowLeft, User, Mail, Award, Key, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();

  const [username, setUsername] = useState(user?.displayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transmissions, setTransmissions] = useState<{ id: string; type: string; title: string; message: string; date: string }[]>([]);

  useEffect(() => {
    if (user?.displayName) {
      setUsername(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (isMock || !supabase) {
      setTransmissions([
        { id: 'm1', type: 'announcement', title: 'Season 5 Recruitment Open!', message: 'The gates of the Season 5 Arena are now open. Claim your starting banner!', date: new Date().toLocaleDateString() }
      ]);
      return;
    }

    const loadTransmissions = async () => {
      try {
        const [notifs, tourneys] = await Promise.all([
          supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(2),
          supabase.from('tournaments').select('*').order('created_at', { ascending: false }).limit(2)
        ]);

        const merged: any[] = [];
        if (notifs.data) {
          notifs.data.forEach((n: any) => {
            merged.push({
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              date: new Date(n.created_at).toLocaleDateString()
            });
          });
        }
        if (tourneys.data) {
          tourneys.data.forEach((t: any) => {
            merged.push({
              id: t.id,
              type: 'tournament',
              title: `Tournament: ${t.name}`,
              message: `Rewards: ${t.rewards}`,
              date: new Date(t.created_at).toLocaleDateString()
            });
          });
        }
        setTransmissions(merged.slice(0, 3));
      } catch (err) {
        console.error("Failed to load realm transmissions:", err);
      }
    };

    loadTransmissions();

    // Subscribe to public database changes for real-time notifications on profiles
    const channel = supabase
      .channel('realm_alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
        const n = payload.new;
        alert(`[REALM TRANSMISSION - ${n.type.toUpperCase()}]\n\n${n.title}\n${n.message}`);
        loadTransmissions();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tournaments' }, (payload: any) => {
        const t = payload.new;
        alert(`[NEW TOURNAMENT ALIGNMENT]\n\n${t.name} has begun staging!\nRewards: ${t.rewards}`);
        loadTransmissions();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center font-sans">
        <div className="text-center font-orbitron text-xs animate-pulse text-gray-500">
          Syncing profile timeline...
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (username.trim().length < 3) {
      setStatusMsg({ type: 'error', text: 'Warrior name must be at least 3 characters long.' });
      return;
    }

    if (password && password.length < 8) {
      setStatusMsg({ type: 'error', text: 'New passcode must be at least 8 characters long.' });
      return;
    }

    if (password && password !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'Passcodes do not match.' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isMock && supabase) {
        // 1. Update Auth metadata and password if requested
        const updateParams: any = {
          data: { username: username.trim() }
        };
        if (password) {
          updateParams.password = password;
        }
        const { error: authErr } = await supabase.auth.updateUser(updateParams);
        if (authErr) throw authErr;

        // 2. Update public profiles table
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ username: username.trim() })
          .eq('id', user.uid);
        if (profileErr) throw profileErr;
      } else {
        // Mock Local Storage Updates
        await new Promise((resolve) => setTimeout(resolve, 800));

        const registeredUsers = JSON.parse(localStorage.getItem('thayam_registered_users') || '{}');
        const emailLower = user.email.toLowerCase();
        const mockUser = registeredUsers[emailLower];

        if (mockUser) {
          // Check username uniqueness (excluding current user)
          const isTaken = Object.values(registeredUsers).some(
            (u: any) => u.uid !== user.uid && u.username.toLowerCase() === username.trim().toLowerCase()
          );
          if (isTaken) {
            throw new Error('Warrior name is already claimed by another combatant.');
          }

          mockUser.username = username.trim();
          if (password) {
            mockUser.password = password;
          }
          registeredUsers[emailLower] = mockUser;
          localStorage.setItem('thayam_registered_users', JSON.stringify(registeredUsers));
        }

        // Update in mock dashboard users list
        const adminUsers = JSON.parse(localStorage.getItem('thayam_admin_mock_users') || '[]');
        const idx = adminUsers.findIndex((u: any) => u.uid === user.uid);
        if (idx !== -1) {
          adminUsers[idx].username = username.trim();
          localStorage.setItem('thayam_admin_mock_users', JSON.stringify(adminUsers));
        }

        // Update current session storage
        const sessionUser = {
          ...user,
          displayName: username.trim()
        };
        localStorage.setItem('thayam_current_user', JSON.stringify(sessionUser));
        localStorage.setItem('thayam_player_name', username.trim());

        // Notify subscribers
        const bc = new BroadcastChannel('thayam_admin_users_sync');
        bc.postMessage('sync');
      }

      setStatusMsg({ type: 'success', text: 'Warrior profile updated successfully.' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Decorative environment grids */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(#d97706 2px, transparent 2px)',
             backgroundSize: '24px 24px'
           }} 
      />

      <div 
        className="w-full max-w-lg bg-[#111827]/80 border border-[#F5B041]/20 rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative flex flex-col space-y-6"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 24px rgba(245, 176, 65, 0.02)',
        }}
      >
        {/* Navigation Return */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <button
            onClick={() => navigate('/play')}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-serif text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#FFF8E0] via-[#F5B041] to-[#C38012]">
            WARRIOR PROFILE
          </h2>
          <div className="w-8" />
        </div>

        {/* User Stats/Coins Section */}
        <div className="grid grid-cols-2 gap-4">
          {/* Coins Display */}
          <div className="bg-[#070A12] border border-white/5 rounded-xl p-3.5 flex flex-col items-center justify-center shadow-md">
            <Award className="w-6 h-6 text-[#F5B041] drop-shadow-[0_0_6px_#F5B041] mb-1.5 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">THAYAM COINS</span>
            <span className="text-xl font-black font-mono text-[#F5B041] mt-1">{user.coins ?? 1000}</span>
          </div>

          {/* Rank Display */}
          <div className="bg-[#070A12] border border-white/5 rounded-xl p-3.5 flex flex-col items-center justify-center shadow-md">
            <User className="w-6 h-6 text-[#00C2FF] drop-shadow-[0_0_6px_#00C2FF] mb-1.5" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">ARENA RANK</span>
            <span className="text-sm font-extrabold font-orbitron text-gray-200 mt-1 uppercase tracking-widest">
              {user.rank ?? 'Bronze V'}
            </span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {statusMsg && (
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-mono tracking-wide leading-relaxed ${
              statusMsg.type === 'success' 
                ? 'bg-green-950/20 border-green-500/30 text-green-400' 
                : 'bg-red-950/20 border-red-500/30 text-red-400'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <ShieldAlert size={14} className="shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Email (Read Only) */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block">
              Email Matrix (Unchangeable)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-[#070A12]/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white/40 font-mono focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Username (Editable) */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">
              Warrior Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5B041]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.substring(0, 15))}
                placeholder="Enter Warrior Name"
                className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B041] transition font-bold"
              />
            </div>
          </div>

          {/* New Password (Editable) */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">
              New Passcode Sigil (Optional)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B041] transition font-mono"
              />
            </div>
          </div>

          {/* Confirm Password */}
          {password && (
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">
                Confirm Passcode Sigil
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#F5B041] transition font-mono"
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-[#FFF0C2] via-[#F5B041] to-[#FF6B00] hover:from-[#FFF6DF] hover:via-[#FFA91F] hover:to-[#E05300] text-black font-orbitron font-extrabold tracking-widest text-[11px] rounded-xl shadow-lg border border-[#FFE8A3]/30 transition-all duration-300 cursor-pointer disabled:opacity-50 uppercase"
            >
              {isSubmitting ? 'Updating Signal...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        {/* Realm Transmissions (Announcements & Tournaments) */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase block text-left">
            Realm Transmissions
          </span>
          <div className="space-y-2.5 max-h-40 overflow-y-auto scrollbar-none">
            {transmissions.length === 0 ? (
              <div className="text-center p-4 bg-[#070A12]/40 border border-white/5 rounded-xl text-[10px] text-white/30 font-mono">
                No active transmissions from the admin high council.
              </div>
            ) : (
              transmissions.map((notif) => {
                const isTournament = notif.type === 'tournament';
                const typeColor = notif.type === 'emergency' ? 'text-red-400 border-red-500/20' : (isTournament ? 'text-[#F5B041] border-[#F5B041]/20' : 'text-[#00C2FF] border-[#00C2FF]/20');
                
                return (
                  <div key={notif.id} className="p-3 bg-[#070A12]/80 border border-white/5 rounded-xl text-left space-y-1 relative shadow-inner">
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-orbitron font-extrabold uppercase tracking-widest px-1.5 py-0.5 border rounded-md ${typeColor}`}>
                        {notif.type}
                      </span>
                      <span className="text-[8px] font-mono text-white/30">{notif.date}</span>
                    </div>
                    <div className="text-[10px] font-bold text-gray-200 mt-1">{notif.title}</div>
                    <div className="text-[10px] text-white/50 leading-relaxed font-sans">{notif.message}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Logout Link */}
        <div className="pt-2 border-t border-white/5">
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            className="text-[10px] font-bold tracking-widest text-red-500 hover:text-red-400 transition-colors uppercase cursor-pointer"
          >
            Shut Down Connection (Sign Out)
          </button>
        </div>
      </div>
    </div>
  );
};
