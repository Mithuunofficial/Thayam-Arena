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
  state?: any;
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

export const adminDb = {
  // --- USERS MANAGEMENT ---
  async getUsers(): Promise<AdminUser[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
          uid: d.id,
          username: d.username,
          email: d.email,
          rank: d.rank,
          xp: d.xp,
          coins: d.coins,
          online_status: d.online_status,
          room_id: d.room_id,
          created_at: d.created_at,
          last_login: d.last_login,
          is_suspended: d.is_suspended,
          is_banned: d.is_banned
        }));
      }
    }
    return [];
  },

  async updateUser(uid: string, updates: Partial<AdminUser>): Promise<void> {
    if (!isMock && supabase) {
      const dbUpdates: any = { ...updates };
      delete dbUpdates.uid;
      await supabase.from('profiles').update(dbUpdates).eq('id', uid);
    }
  },

  async deleteUser(uid: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.rpc('admin_delete_user', { target_user_id: uid });
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
    }
    return () => {};
  },

  // --- LIVE ROOM MONITORING ---
  async getRooms(): Promise<AdminRoom[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase.from('rooms').select('*');
      if (!error && data) {
        return data.map((r: any) => {
          const state = r.state || {};
          const players = state.players || {};
          const spectators = state.spectators || 0;
          const status = (state.winner !== null && state.winner !== undefined) ? 'game_over' : (Object.keys(players).length > 0 ? 'playing' : 'lobby');
          const duration = Math.floor((Date.now() - (state.updatedAt || Date.now())) / 1000) + 120;
          return {
            roomId: r.room_id,
            players,
            spectators,
            status,
            duration: Math.max(0, duration),
            gameType: state.gameType || 'single',
            mode: state.mode || 'single',
            updatedAt: state.updatedAt || Date.now(),
            state: state
          };
        });
      }
    }
    return [];
  },

  async forceCloseRoom(roomId: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('rooms').delete().eq('room_id', roomId);
    }
  },

  async removePlayerFromRoom(roomId: string, playerUid: string): Promise<void> {
    if (!isMock && supabase) {
      const { data } = await supabase.from('rooms').select('state').eq('room_id', roomId).single();
      if (data) {
        const state = data.state || {};
        if (state.players) {
          const keyToDelete = Object.keys(state.players).find(k => state.players[k].uid === playerUid);
          if (keyToDelete) {
            delete state.players[keyToDelete];
            await supabase.from('rooms').update({ state }).eq('room_id', roomId);
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
    }
    return () => {};
  },

  // --- MATCHES MANAGEMENT ---
  async getMatches(): Promise<AdminMatch[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) {
        return data.map((d: any) => ({
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
    }
    return [];
  },

  async cancelMatch(matchId: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('matches').update({ status: 'cancelled' }).eq('match_id', matchId);
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
    }
    return () => {};
  },

  // --- TOURNAMENTS ---
  async getTournaments(): Promise<AdminTournament[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as AdminTournament[];
    }
    return [];
  },

  async createTournament(name: string, rewards: string, status: 'upcoming' | 'live' | 'finished'): Promise<void> {
    if (!isMock && supabase) {
      const newTournament = {
        name,
        rewards,
        status,
        brackets: {
          rounds: [
            {
              name: 'Quarterfinals',
              matches: [
                { id: 'tm1', p1: 'TBD', p2: 'TBD' },
                { id: 'tm2', p1: 'TBD', p2: 'TBD' },
                { id: 'tm3', p1: 'TBD', p2: 'TBD' },
                { id: 'tm4', p1: 'TBD', p2: 'TBD' }
              ]
            },
            {
              name: 'Semifinals',
              matches: [
                { id: 'tm5', p1: 'TBD', p2: 'TBD' },
                { id: 'tm6', p1: 'TBD', p2: 'TBD' }
              ]
            },
            {
              name: 'Grand Finals',
              matches: [
                { id: 'tm7', p1: 'TBD', p2: 'TBD' }
              ]
            }
          ]
        },
        players: []
      };
      await supabase.from('tournaments').insert(newTournament);
    }
  },

  async updateTournament(id: string, updates: Partial<AdminTournament>): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('tournaments').update(updates).eq('id', id);
    }
  },

  async deleteTournament(id: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('tournaments').delete().eq('id', id);
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
    }
    return () => {};
  },

  // --- NOTIFICATIONS SYSTEM ---
  async getNotifications(): Promise<AdminNotification[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as AdminNotification[];
    }
    return [];
  },

  async createNotification(type: 'announcement' | 'maintenance' | 'emergency', title: string, message: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('notifications').insert({ type, title, message });
    }
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
    }
    return () => {};
  },

  // --- REPORTS PANEL ---
  async getReports(): Promise<AdminReport[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) return data as AdminReport[];
    }
    return [];
  },

  async updateReportStatus(id: string, status: 'resolved' | 'dismissed'): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('reports').update({ status }).eq('id', id);
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
    }
    return () => {};
  },

  // --- ADMIN LOGS & AUDITS ---
  async getAdminLogs(): Promise<AdminLog[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) return data as AdminLog[];
    }
    return [];
  },

  async createAdminLog(action: string, targetId: string | null, details: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('admin_logs').insert({
        admin_username: 'admin',
        action,
        target_id: targetId,
        details,
        ip_address: '192.168.1.45'
      });
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
    }
    return () => {};
  },

  // --- SECURITY LOGS ---
  async getSecurityLogs(): Promise<SecurityLog[]> {
    if (!isMock && supabase) {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!error && data) return data as SecurityLog[];
    }
    return [];
  },

  async createSecurityLog(eventType: SecurityLog['event_type'], username: string, details: string): Promise<void> {
    if (!isMock && supabase) {
      await supabase.from('security_logs').insert({
        event_type: eventType,
        username,
        details,
        ip_address: '192.168.1.45'
      });
    }
  }
};
