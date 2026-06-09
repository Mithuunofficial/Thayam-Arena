import { supabase, isMock } from './config';

export interface AdminUser {
  uid: string;
  username: string;
  email: string;
  rank: string;
  xp: number;
  coins: number;
  online_status: boolean;
  room_id: string | null;
  created_at: string;
  last_login: string;
  is_suspended?: boolean;
  is_banned?: boolean;
}

export interface AdminRoom {
  roomId: string;
  players: Record<string, {
    uid: string;
    name: string;
    color: string;
    team: string;
    ready: boolean;
    isBot: boolean;
    avatar?: string;
  }>;
  spectators: number;
  status: 'lobby' | 'playing' | 'game_over';
  duration: number; // in seconds
  gameType: 'single' | 'team';
  mode: 'single' | 'multi';
  updatedAt: number;
}

export interface AdminMatch {
  matchId: string;
  players: { uid: string; username: string; rank: string; score?: number }[];
  winner_id: string | null;
  loser_id: string | null;
  status: 'completed' | 'active' | 'cancelled';
  move_count: number;
  duration: number; // in seconds
  game_logs: string[];
  timestamp: string;
}

export interface AdminTournament {
  id: string;
  name: string;
  status: 'upcoming' | 'live' | 'finished';
  rewards: string;
  brackets: {
    rounds: {
      name: string;
      matches: { id: string; p1: string; p2: string; score1?: number; score2?: number; winner?: string }[];
    }[];
  };
  players: string[];
  created_at: string;
}

export interface AdminNotification {
  id: string;
  type: 'announcement' | 'maintenance' | 'emergency';
  title: string;
  message: string;
  created_at: string;
}

export interface AdminReport {
  id: string;
  reporter_id: string;
  reporter_username: string;
  reported_id: string;
  reported_username: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: string;
}

export interface AdminLog {
  id: string;
  admin_username: string;
  action: string;
  target_id: string | null;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  event_type: 'login_success' | 'login_failed' | 'suspicious_activity' | 'ip_blocked';
  ip_address: string;
  details: string;
  username: string;
}

// Helper to pre-populate initial mockup data if it does not exist in localStorage
function initializeMockData() {
  const usersKey = 'thayam_admin_mock_users';
  const matchesKey = 'thayam_admin_mock_matches';
  const tournamentsKey = 'thayam_admin_mock_tournaments';
  const notificationsKey = 'thayam_admin_mock_notifications';
  const reportsKey = 'thayam_admin_mock_reports';
  const logsKey = 'thayam_admin_mock_logs';
  const securityKey = 'thayam_admin_mock_security';

  if (!localStorage.getItem(usersKey)) {
    const defaultUsers: AdminUser[] = [
      { uid: 'u1', username: 'SoulTaker', email: 'soul@thayam.gg', rank: 'Grandmaster', xp: 25400, coins: 4500, online_status: true, room_id: 'R-709', created_at: '2026-01-10T12:00:00Z', last_login: '2026-06-09T08:00:00Z' },
      { uid: 'u2', username: 'ShadowBlade', email: 'shadow@thayam.gg', rank: 'Diamond III', xp: 18200, coins: 2100, online_status: true, room_id: 'R-709', created_at: '2026-02-15T10:30:00Z', last_login: '2026-06-09T07:55:00Z' },
      { uid: 'u3', username: 'ViperCSS', email: 'viper@gmail.com', rank: 'Platinum I', xp: 12500, coins: 1400, online_status: false, room_id: null, created_at: '2026-03-01T15:40:00Z', last_login: '2026-06-08T22:15:00Z' },
      { uid: 'u4', username: 'CyberShaman', email: 'shaman@thayam.gg', rank: 'Gold V', xp: 8400, coins: 750, online_status: true, room_id: 'R-112', created_at: '2026-03-20T09:00:00Z', last_login: '2026-06-09T08:10:00Z' },
      { uid: 'u5', username: 'NoobMaster99', email: 'noob@yahoo.com', rank: 'Bronze II', xp: 1500, coins: 120, online_status: false, room_id: null, created_at: '2026-05-12T17:20:00Z', last_login: '2026-06-05T14:30:00Z', is_suspended: true },
      { uid: 'u6', username: 'NeonDagger', email: 'neon@thayam.gg', rank: 'Silver IV', xp: 4500, coins: 340, online_status: true, room_id: 'R-112', created_at: '2026-04-05T11:10:00Z', last_login: '2026-06-09T07:40:00Z' },
      { uid: 'u7', username: 'GlitchMaster', email: 'glitch@hacks.com', rank: 'Gold III', xp: 7200, coins: 900, online_status: false, room_id: null, created_at: '2026-04-18T16:00:00Z', last_login: '2026-06-09T01:10:00Z', is_banned: true },
      { uid: 'u8', username: 'Valkyrie9', email: 'valk@thayam.gg', rank: 'Platinum II', xp: 11400, coins: 1100, online_status: true, room_id: null, created_at: '2026-02-28T18:25:00Z', last_login: '2026-06-09T08:05:00Z' },
      { uid: 'u9', username: 'LokiPoki', email: 'loki@thayam.gg', rank: 'Bronze V', xp: 200, coins: 50, online_status: false, room_id: null, created_at: '2026-06-01T21:40:00Z', last_login: '2026-06-02T10:15:00Z' },
      { uid: 'u10', username: 'AresWar', email: 'ares@thayam.gg', rank: 'Gold I', xp: 9500, coins: 1200, online_status: true, room_id: null, created_at: '2026-01-20T08:15:00Z', last_login: '2026-06-09T07:50:00Z' },
    ];
    localStorage.setItem(usersKey, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(matchesKey)) {
    const defaultMatches: AdminMatch[] = [
      {
        matchId: 'm1',
        players: [{ uid: 'u1', username: 'SoulTaker', rank: 'Grandmaster' }, { uid: 'u2', username: 'ShadowBlade', rank: 'Diamond III' }],
        winner_id: 'u1',
        loser_id: 'u2',
        status: 'completed',
        move_count: 48,
        duration: 720,
        game_logs: ['SoulTaker rolled a Thayam (1)', 'SoulTaker moved piece 1 out', 'ShadowBlade rolled a 4', 'ShadowBlade moved piece 2', 'SoulTaker captured ShadowBlade piece 2', 'SoulTaker won the battle!'],
        timestamp: '2026-06-09T06:30:00Z'
      },
      {
        matchId: 'm2',
        players: [{ uid: 'u3', username: 'ViperCSS', rank: 'Platinum I' }, { uid: 'u4', username: 'CyberShaman', rank: 'Gold V' }],
        winner_id: 'u4',
        loser_id: 'u3',
        status: 'completed',
        move_count: 62,
        duration: 940,
        game_logs: ['CyberShaman rolled a 12', 'CyberShaman rolled a 4', 'ViperCSS piece captured at junction', 'CyberShaman won by team elimination'],
        timestamp: '2026-06-08T19:45:00Z'
      },
      {
        matchId: 'm3',
        players: [{ uid: 'u6', username: 'NeonDagger', rank: 'Silver IV' }, { uid: 'u9', username: 'LokiPoki', rank: 'Bronze V' }],
        winner_id: 'u6',
        loser_id: 'u9',
        status: 'completed',
        move_count: 31,
        duration: 450,
        game_logs: ['LokiPoki rolled two 1s in a row', 'NeonDagger blocked the outer lane', 'NeonDagger finished all pieces'],
        timestamp: '2026-06-08T14:20:00Z'
      },
      {
        matchId: 'm4',
        players: [{ uid: 'u8', username: 'Valkyrie9', rank: 'Platinum II' }, { uid: 'u7', username: 'GlitchMaster', rank: 'Gold III' }],
        winner_id: null,
        loser_id: null,
        status: 'cancelled',
        move_count: 5,
        duration: 45,
        game_logs: ['GlitchMaster disconnected', 'System triggered game termination'],
        timestamp: '2026-06-08T11:05:00Z'
      }
    ];
    localStorage.setItem(matchesKey, JSON.stringify(defaultMatches));
  }

  if (!localStorage.getItem(tournamentsKey)) {
    const defaultTournaments: AdminTournament[] = [
      {
        id: 't1',
        name: 'Summer Conquest Arena 2026',
        status: 'live',
        rewards: '5,000 Coins + Cyber Warrior Avatar Banner',
        players: ['SoulTaker', 'ShadowBlade', 'ViperCSS', 'CyberShaman', 'NeonDagger', 'AresWar', 'Valkyrie9', 'LokiPoki'],
        created_at: '2026-06-01T00:00:00Z',
        brackets: {
          rounds: [
            {
              name: 'Quarterfinals',
              matches: [
                { id: 'tm1', p1: 'SoulTaker', p2: 'LokiPoki', score1: 1, score2: 0, winner: 'SoulTaker' },
                { id: 'tm2', p1: 'ShadowBlade', p2: 'NeonDagger', score1: 1, score2: 0, winner: 'ShadowBlade' },
                { id: 'tm3', p1: 'ViperCSS', p2: 'AresWar', score1: 0, score2: 1, winner: 'AresWar' },
                { id: 'tm4', p1: 'Valkyrie9', p2: 'CyberShaman', score1: 1, score2: 0, winner: 'Valkyrie9' }
              ]
            },
            {
              name: 'Semifinals',
              matches: [
                { id: 'tm5', p1: 'SoulTaker', p2: 'AresWar', score1: 0, score2: 0 },
                { id: 'tm6', p1: 'ShadowBlade', p2: 'Valkyrie9', score1: 0, score2: 0 }
              ]
            },
            {
              name: 'Grand Finals',
              matches: [
                { id: 'tm7', p1: 'TBD', p2: 'TBD' }
              ]
            }
          ]
        }
      },
      {
        id: 't2',
        name: 'Beginners Brawl #42',
        status: 'upcoming',
        rewards: '500 Coins',
        players: ['LokiPoki', 'NeonDagger'],
        created_at: '2026-06-08T08:00:00Z',
        brackets: { rounds: [] }
      },
      {
        id: 't3',
        name: 'Championship Legends - Season 4',
        status: 'finished',
        rewards: 'Exclusive Gold Skin + 10,000 Coins',
        players: ['SoulTaker', 'ShadowBlade', 'ViperCSS', 'Valkyrie9'],
        created_at: '2026-05-15T12:00:00Z',
        brackets: {
          rounds: [
            {
              name: 'Semifinals',
              matches: [
                { id: 'tf1', p1: 'SoulTaker', p2: 'Valkyrie9', score1: 1, score2: 0, winner: 'SoulTaker' },
                { id: 'tf2', p1: 'ShadowBlade', p2: 'ViperCSS', score1: 1, score2: 0, winner: 'ShadowBlade' }
              ]
            },
            {
              name: 'Finals',
              matches: [
                { id: 'tf3', p1: 'SoulTaker', p2: 'ShadowBlade', score1: 1, score2: 0, winner: 'SoulTaker' }
              ]
            }
          ]
        }
      }
    ];
    localStorage.setItem(tournamentsKey, JSON.stringify(defaultTournaments));
  }

  if (!localStorage.getItem(notificationsKey)) {
    const defaultNotifications: AdminNotification[] = [
      { id: 'n1', type: 'announcement', title: 'Season 5 Recruitment Open!', message: 'The gates of the Season 5 Arena are now open. Claim your starting banner!', created_at: '2026-06-09T01:00:00Z' },
      { id: 'n2', type: 'maintenance', title: 'System Patch v1.4.2 Deploying', message: 'Matchmaking systems will undergo brief maintenance today at 22:00 UTC.', created_at: '2026-06-08T18:00:00Z' },
      { id: 'n3', type: 'emergency', title: 'Server Node-4 Hotfix Complete', message: 'Latency spikes on Node-4 have been resolved. Thank you for your patience.', created_at: '2026-06-07T12:10:00Z' }
    ];
    localStorage.setItem(notificationsKey, JSON.stringify(defaultNotifications));
  }

  if (!localStorage.getItem(reportsKey)) {
    const defaultReports: AdminReport[] = [
      { id: 'r1', reporter_id: 'u2', reporter_username: 'ShadowBlade', reported_id: 'u7', reported_username: 'GlitchMaster', reason: 'Unfair advantage / Cheat software', details: 'The user rolled 12 four times in a row without any delay. Possibility of script integration.', status: 'pending', timestamp: '2026-06-09T04:20:00Z' },
      { id: 'r2', reporter_id: 'u6', reporter_username: 'NeonDagger', reported_id: 'u5', reported_username: 'NoobMaster99', reason: 'Toxicity / Severe Harassment', details: 'Used highly inappropriate language in the room chat lobby after losing a token capture.', status: 'resolved', timestamp: '2026-06-05T13:00:00Z' },
      { id: 'r3', reporter_id: 'u4', reporter_username: 'CyberShaman', reported_id: 'u9', reported_username: 'LokiPoki', reason: 'Griefing / Intentional Inactivity', details: 'Refused to roll for three consecutive turns, stalling the lobby.', status: 'pending', timestamp: '2026-06-08T20:30:00Z' }
    ];
    localStorage.setItem(reportsKey, JSON.stringify(defaultReports));
  }

  if (!localStorage.getItem(logsKey)) {
    const defaultLogs: AdminLog[] = [
      { id: 'l1', admin_username: 'admin', action: 'Ban User', target_id: 'u7', details: 'Banned GlitchMaster permanently due to cheat validation reports.', ip_address: '192.168.1.45', timestamp: '2026-06-09T05:10:00Z' },
      { id: 'l2', admin_username: 'admin', action: 'Settings Change', target_id: null, details: 'Enabled Maintenance Mode countdown timer.', ip_address: '192.168.1.45', timestamp: '2026-06-08T18:05:00Z' },
      { id: 'l3', admin_username: 'admin', action: 'Suspend User', target_id: 'u5', details: 'Suspended NoobMaster99 for 3 days due to toxic chat behavior.', ip_address: '192.168.1.45', timestamp: '2026-06-05T13:15:00Z' },
      { id: 'l4', admin_username: 'admin', action: 'Broadcast Announcement', target_id: 'n1', details: 'Published Season 5 Arena announcement broadcast.', ip_address: '192.168.1.45', timestamp: '2026-06-09T01:00:00Z' }
    ];
    localStorage.setItem(logsKey, JSON.stringify(defaultLogs));
  }

  if (!localStorage.getItem(securityKey)) {
    const defaultSecurity: SecurityLog[] = [
      { id: 's1', timestamp: '2026-06-09T08:00:00Z', event_type: 'login_success', ip_address: '192.168.1.45', details: 'Admin console successfully entered.', username: 'admin' },
      { id: 's2', timestamp: '2026-06-09T07:15:00Z', event_type: 'login_failed', ip_address: '203.0.113.88', details: 'Failed password login attempt to console.', username: 'admin' },
      { id: 's3', timestamp: '2026-06-09T05:40:00Z', event_type: 'suspicious_activity', ip_address: '198.51.100.12', details: 'Multiple API request limits exceeded on user profile queries.', username: 'unknown' },
      { id: 's4', timestamp: '2026-06-08T23:50:00Z', event_type: 'login_failed', ip_address: '198.51.100.12', details: 'Brute force warning - 5 failed attempts.', username: 'moderator' },
      { id: 's5', timestamp: '2026-06-08T14:30:00Z', event_type: 'ip_blocked', ip_address: '198.51.100.12', details: 'IP blacklisted automatically due to attack vectors.', username: 'system' }
    ];
    localStorage.setItem(securityKey, JSON.stringify(defaultSecurity));
  }
}

// Perform initial check
initializeMockData();

// Simple mock store updates
function getMockData<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function saveMockData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const adminDb = {
  // --- USERS MANAGEMENT ---
  async getUsers(): Promise<AdminUser[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as AdminUser[];
    }
    return getMockData<AdminUser>('thayam_admin_mock_users');
  },

  async updateUser(uid: string, updates: Partial<AdminUser>): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('profiles').update(updates).eq('id', uid);
    } else {
      const users = getMockData<AdminUser>('thayam_admin_mock_users');
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updates };
        saveMockData('thayam_admin_mock_users', users);
        
        // Notify local subscribers
        const bc = new BroadcastChannel('thayam_admin_users_sync');
        bc.postMessage('sync');
      }
    }
  },

  async deleteUser(uid: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('profiles').delete().eq('id', uid);
    } else {
      const users = getMockData<AdminUser>('thayam_admin_mock_users');
      const filtered = users.filter(u => u.uid !== uid);
      saveMockData('thayam_admin_mock_users', filtered);

      // Notify local subscribers
      const bc = new BroadcastChannel('thayam_admin_users_sync');
      bc.postMessage('sync');
    }
  },

  subscribeToUsers(onUpdate: (users: AdminUser[]) => void): () => void {
    if (!isMock && supabase) {
      this.getUsers().then(onUpdate);
      const channel = supabase
        .channel('admin_users_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          async () => {
            const users = await this.getUsers();
            onUpdate(users);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminUser>('thayam_admin_mock_users'));
      };
      const bc = new BroadcastChannel('thayam_admin_users_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- LIVE ROOM MONITORING ---
  async getRooms(): Promise<AdminRoom[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('rooms').select('*');
      if (!error && data) {
        return data.map((r: any) => {
          const state = r.state;
          const players = state.players || {};
          const spectators = state.spectators || Math.floor(Math.random() * 5);
          const status = state.winner !== null ? 'game_over' : (Object.keys(players).length > 0 ? 'playing' : 'lobby');
          const duration = Math.floor((Date.now() - (state.updatedAt || Date.now())) / 1000) + 120;
          return {
            roomId: r.room_id,
            players,
            spectators,
            status,
            duration: Math.max(30, duration),
            gameType: state.gameType || 'single',
            mode: state.mode || 'single',
            updatedAt: state.updatedAt || Date.now()
          };
        });
      }
    }

    const activeRooms: AdminRoom[] = [
      {
        roomId: 'R-709',
        players: {
          '0': { uid: 'u1', name: 'SoulTaker', color: '#EF4444', team: 'A', ready: true, isBot: false },
          '1': { uid: 'u2', name: 'ShadowBlade', color: '#00C2FF', team: 'B', ready: true, isBot: false }
        },
        spectators: 8,
        status: 'playing',
        duration: 380,
        gameType: 'single',
        mode: 'multi',
        updatedAt: Date.now()
      },
      {
        roomId: 'R-112',
        players: {
          '0': { uid: 'u4', name: 'CyberShaman', color: '#F5B041', team: 'A', ready: true, isBot: false },
          '1': { uid: 'u6', name: 'NeonDagger', color: '#10B981', team: 'B', ready: true, isBot: false }
        },
        spectators: 2,
        status: 'playing',
        duration: 155,
        gameType: 'single',
        mode: 'multi',
        updatedAt: Date.now()
      },
      {
        roomId: 'R-BOT',
        players: {
          '0': { uid: 'u8', name: 'Valkyrie9', color: '#F5B041', team: 'A', ready: true, isBot: false },
          '1': { uid: 'bot-1', name: 'Bot Kalingan', color: '#EF4444', team: 'B', ready: true, isBot: true }
        },
        spectators: 0,
        status: 'lobby',
        duration: 12,
        gameType: 'single',
        mode: 'single',
        updatedAt: Date.now()
      }
    ];
    return activeRooms;
  },

  async forceCloseRoom(roomId: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('rooms').delete().eq('room_id', roomId);
    } else {
      localStorage.removeItem(`thayam_room_${roomId}`);
      const bc = new BroadcastChannel(`thayam_room_${roomId}`);
      bc.postMessage({ type: 'FORCE_CLOSE' });
      
      const adminBc = new BroadcastChannel('thayam_admin_rooms_sync');
      adminBc.postMessage('sync');
    }
  },

  async removePlayerFromRoom(roomId: string, playerUid: string): Promise<void> {
    if (!isMock && supabase) {
      const { data } = await supabase.from('rooms').select('state').eq('room_id', roomId).single();
      if (data) {
        const state = data.state;
        if (state.players) {
          const keyToDelete = Object.keys(state.players).find(k => state.players[k].uid === playerUid);
          if (keyToDelete) {
            delete state.players[keyToDelete];
            await supabase.from('rooms').update({ state }).eq('room_id', roomId);
          }
        }
      }
    } else {
      const localRoomStr = localStorage.getItem(`thayam_room_${roomId}`);
      if (localRoomStr) {
        const state = JSON.parse(localRoomStr);
        if (state.players) {
          const keyToDelete = Object.keys(state.players).find(k => state.players[k].uid === playerUid);
          if (keyToDelete) {
            delete state.players[keyToDelete];
            localStorage.setItem(`thayam_room_${roomId}`, JSON.stringify(state));
            
            const bc = new BroadcastChannel(`thayam_room_${roomId}`);
            bc.postMessage({ type: 'UPDATE', state });

            const adminBc = new BroadcastChannel('thayam_admin_rooms_sync');
            adminBc.postMessage('sync');
          }
        }
      }
    }
  },

  subscribeToRooms(onUpdate: (rooms: AdminRoom[]) => void): () => void {
    if (!isMock && supabase) {
      this.getRooms().then(onUpdate);
      const channel = supabase
        .channel('admin_rooms_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'rooms' },
          async () => {
            const rooms = await this.getRooms();
            onUpdate(rooms);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        this.getRooms().then(onUpdate);
      };
      const bc = new BroadcastChannel('thayam_admin_rooms_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- MATCHES MANAGEMENT ---
  async getMatches(): Promise<AdminMatch[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
      if (!error && data) return data.map((d: any) => ({
        matchId: d.match_id,
        players: d.players,
        winner_id: d.winner_id,
        loser_id: d.loser_id,
        status: d.status,
        move_count: d.move_count,
        duration: d.duration,
        game_logs: d.game_logs,
        timestamp: d.timestamp
      }));
    }
    return getMockData<AdminMatch>('thayam_admin_mock_matches');
  },

  async cancelMatch(matchId: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('matches').update({ status: 'cancelled' }).eq('match_id', matchId);
    } else {
      const matches = getMockData<AdminMatch>('thayam_admin_mock_matches');
      const idx = matches.findIndex(m => m.matchId === matchId);
      if (idx !== -1) {
        matches[idx].status = 'cancelled';
        saveMockData('thayam_admin_mock_matches', matches);

        const bc = new BroadcastChannel('thayam_admin_matches_sync');
        bc.postMessage('sync');
      }
    }
  },

  subscribeToMatches(onUpdate: (matches: AdminMatch[]) => void): () => void {
    if (!isMock && supabase) {
      this.getMatches().then(onUpdate);
      const channel = supabase
        .channel('admin_matches_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'matches' },
          async () => {
            const matches = await this.getMatches();
            onUpdate(matches);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminMatch>('thayam_admin_mock_matches'));
      };
      const bc = new BroadcastChannel('thayam_admin_matches_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- TOURNAMENTS ---
  async getTournaments(): Promise<AdminTournament[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as AdminTournament[];
    }
    return getMockData<AdminTournament>('thayam_admin_mock_tournaments');
  },

  async createTournament(name: string, rewards: string, status: 'upcoming' | 'live' | 'finished'): Promise<void> {
    const newTournament = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      status,
      rewards,
      players: [],
      created_at: new Date().toISOString(),
      brackets: { rounds: [] }
    };

    if (!isMock && supabase) {
      await supabase.from('tournaments').insert({
        name,
        rewards,
        status,
        brackets: { rounds: [] },
        players: []
      });
    } else {
      const tournaments = getMockData<AdminTournament>('thayam_admin_mock_tournaments');
      tournaments.unshift(newTournament);
      saveMockData('thayam_admin_mock_tournaments', tournaments);

      const bc = new BroadcastChannel('thayam_admin_tournaments_sync');
      bc.postMessage('sync');
    }
  },

  async updateTournament(id: string, updates: Partial<AdminTournament>): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('tournaments').update(updates).eq('id', id);
    } else {
      const tournaments = getMockData<AdminTournament>('thayam_admin_mock_tournaments');
      const idx = tournaments.findIndex(t => t.id === id);
      if (idx !== -1) {
        tournaments[idx] = { ...tournaments[idx], ...updates };
        saveMockData('thayam_admin_mock_tournaments', tournaments);

        const bc = new BroadcastChannel('thayam_admin_tournaments_sync');
        bc.postMessage('sync');
      }
    }
  },

  async deleteTournament(id: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('tournaments').delete().eq('id', id);
    } else {
      const tournaments = getMockData<AdminTournament>('thayam_admin_mock_tournaments');
      const filtered = tournaments.filter(t => t.id !== id);
      saveMockData('thayam_admin_mock_tournaments', filtered);

      const bc = new BroadcastChannel('thayam_admin_tournaments_sync');
      bc.postMessage('sync');
    }
  },

  subscribeToTournaments(onUpdate: (tournaments: AdminTournament[]) => void): () => void {
    if (!isMock && supabase) {
      this.getTournaments().then(onUpdate);
      const channel = supabase
        .channel('admin_tournaments_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournaments' },
          async () => {
            const tournaments = await this.getTournaments();
            onUpdate(tournaments);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminTournament>('thayam_admin_mock_tournaments'));
      };
      const bc = new BroadcastChannel('thayam_admin_tournaments_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- NOTIFICATIONS SYSTEM ---
  async getNotifications(): Promise<AdminNotification[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as AdminNotification[];
    }
    return getMockData<AdminNotification>('thayam_admin_mock_notifications');
  },

  async createNotification(type: 'announcement' | 'maintenance' | 'emergency', title: string, message: string): Promise<void> {
    const newNotif = {
      id: 'n-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      created_at: new Date().toISOString()
    };

    if (!isMock && supabase) {
      await supabase.from('notifications').insert({ type, title, message });
    } else {
      const notifs = getMockData<AdminNotification>('thayam_admin_mock_notifications');
      notifs.unshift(newNotif);
      saveMockData('thayam_admin_mock_notifications', notifs);

      const bc = new BroadcastChannel('thayam_admin_notifications_sync');
      bc.postMessage('sync');
    }

    const bc = new BroadcastChannel('thayam_global_notifications');
    bc.postMessage({ type, title, message });
  },

  subscribeToNotifications(onUpdate: (notifications: AdminNotification[]) => void): () => void {
    if (!isMock && supabase) {
      this.getNotifications().then(onUpdate);
      const channel = supabase
        .channel('admin_notifications_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          async () => {
            const notifications = await this.getNotifications();
            onUpdate(notifications);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminNotification>('thayam_admin_mock_notifications'));
      };
      const bc = new BroadcastChannel('thayam_admin_notifications_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- REPORTS PANEL ---
  async getReports(): Promise<AdminReport[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('reports').select('*').order('timestamp', { ascending: false });
      if (!error && data) return data as AdminReport[];
    }
    return getMockData<AdminReport>('thayam_admin_mock_reports');
  },

  async updateReportStatus(id: string, status: 'resolved' | 'dismissed'): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('reports').update({ status }).eq('id', id);
    } else {
      const reports = getMockData<AdminReport>('thayam_admin_mock_reports');
      const idx = reports.findIndex(r => r.id === id);
      if (idx !== -1) {
        reports[idx].status = status;
        saveMockData('thayam_admin_mock_reports', reports);

        const bc = new BroadcastChannel('thayam_admin_reports_sync');
        bc.postMessage('sync');
      }
    }
  },

  subscribeToReports(onUpdate: (reports: AdminReport[]) => void): () => void {
    if (!isMock && supabase) {
      this.getReports().then(onUpdate);
      const channel = supabase
        .channel('admin_reports_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reports' },
          async () => {
            const reports = await this.getReports();
            onUpdate(reports);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminReport>('thayam_admin_mock_reports'));
      };
      const bc = new BroadcastChannel('thayam_admin_reports_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- ADMIN LOGS & AUDITS ---
  async getAdminLogs(): Promise<AdminLog[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('admin_logs').select('*').order('timestamp', { ascending: false });
      if (!error && data) return data as AdminLog[];
    }
    return getMockData<AdminLog>('thayam_admin_mock_logs');
  },

  async createAdminLog(action: string, targetId: string | null, details: string): Promise<void> {
    const newLog = {
      id: 'l-' + Math.random().toString(36).substring(2, 9),
      admin_username: 'admin',
      action,
      target_id: targetId,
      details,
      ip_address: '192.168.1.45',
      timestamp: new Date().toISOString()
    };

    if (!isMock && supabase) {
      await supabase.from('admin_logs').insert({
        admin_username: 'admin',
        action,
        target_id: targetId,
        details,
        ip_address: '192.168.1.45'
      });
    } else {
      const logs = getMockData<AdminLog>('thayam_admin_mock_logs');
      logs.unshift(newLog);
      saveMockData('thayam_admin_mock_logs', logs);

      const bc = new BroadcastChannel('thayam_admin_logs_sync');
      bc.postMessage('sync');
    }
  },

  subscribeToAdminLogs(onUpdate: (logs: AdminLog[]) => void): () => void {
    if (!isMock && supabase) {
      this.getAdminLogs().then(onUpdate);
      const channel = supabase
        .channel('admin_logs_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'admin_logs' },
          async () => {
            const logs = await this.getAdminLogs();
            onUpdate(logs);
          }
        )
        .subscribe();
      return () => {
        channel.unsubscribe();
      };
    } else {
      const sync = () => {
        onUpdate(getMockData<AdminLog>('thayam_admin_mock_logs'));
      };
      const bc = new BroadcastChannel('thayam_admin_logs_sync');
      bc.addEventListener('message', sync);
      sync();
      return () => {
        bc.removeEventListener('message', sync);
        bc.close();
      };
    }
  },

  // --- SECURITY LOGS ---
  async getSecurityLogs(): Promise<SecurityLog[]> {
    return getMockData<SecurityLog>('thayam_admin_mock_security');
  },

  async createSecurityLog(eventType: SecurityLog['event_type'], username: string, details: string): Promise<void> {
    const newLog: SecurityLog = {
      id: 's-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      event_type: eventType,
      ip_address: '192.168.1.45',
      details,
      username
    };
    const logs = getMockData<SecurityLog>('thayam_admin_mock_security');
    logs.unshift(newLog);
    saveMockData('thayam_admin_mock_security', logs);
  }
};

