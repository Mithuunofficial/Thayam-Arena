import { supabase, isMock } from './config';

const channels: Record<string, BroadcastChannel> = {};

function getMockChannel(roomId: string) {
  if (!channels[roomId]) {
    channels[roomId] = new BroadcastChannel(`thayam_room_${roomId}`);
  }
  return channels[roomId];
}

const mockDb: Record<string, any> = {};

export interface RoomState {
  roomId: string;
  mode: 'single' | 'multi';
  gameType: 'single' | 'team';
  difficulty?: 'easy' | 'medium' | 'hard';
  currentTurn: number;
  rolls: number[];
  rollHistory: number[];
  turnState: 'rolling' | 'moving' | 'game_over';
  lastShells: number[]; 
  diceValue?: number;
  hasBonusTurn: boolean;
  winner: number | null;
  players: Record<string, {
    uid: string;
    name: string;
    color: string;
    team: string;
    ready: boolean;
    isBot: boolean;
    avatar?: string;
  }>;
  pieces: { id: number; playerId: number; indexInPath: number }[];
  chat?: { id: string; senderName: string; message: string; timestamp: string }[];
  updatedAt?: number;
}

export const dbService = {
  async createRoom(roomId: string, mode: 'single' | 'multi', gameType: 'single' | 'team', difficulty?: 'easy' | 'medium' | 'hard'): Promise<void> {
    const initialPieces: any[] = [];
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 4; i++) {
        initialPieces.push({ id: p * 4 + i, playerId: p, indexInPath: -1 });
      }
    }

    const initialState: RoomState = {
      roomId,
      mode,
      gameType,
      difficulty,
      currentTurn: 0,
      rolls: [],
      rollHistory: [],
      turnState: 'rolling',
      lastShells: [1], 
      diceValue: 1,
      hasBonusTurn: false,
      winner: null,
      players: {},
      pieces: initialPieces,
      chat: [],
      updatedAt: Date.now()
    };

    if (!isMock && supabase) {
      const { error } = await supabase
        .from('rooms')
        .insert({
          room_id: roomId,
          state: initialState
        });
      if (error) throw error;
    } else {
      mockDb[roomId] = initialState;
      localStorage.setItem(`thayam_room_${roomId}`, JSON.stringify(initialState));
      const channel = getMockChannel(roomId);
      channel.postMessage({ type: 'UPDATE', state: initialState });
    }
  },

  async joinRoom(roomId: string, playerIdStr: string, player: { uid: string; name: string; color: string; team: string; ready: boolean; isBot: boolean; avatar?: string }): Promise<void> {
    if (!isMock && supabase) {
      // Read current state
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('state')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError || !data) throw fetchError || new Error("Room not found");
      
      const mergedState = { ...data.state };
      if (!mergedState.players) mergedState.players = {};
      mergedState.players[playerIdStr] = player;
      mergedState.updatedAt = Date.now();

      // Write back
      const { error: writeError } = await supabase
        .from('rooms')
        .update({ state: mergedState })
        .eq('room_id', roomId);
      
      if (writeError) throw writeError;
    } else {
      const local = mockDb[roomId] || JSON.parse(localStorage.getItem(`thayam_room_${roomId}`) || 'null');
      if (local) {
        if (!local.players) local.players = {};
        local.players[playerIdStr] = player;
        local.updatedAt = Date.now();
        mockDb[roomId] = local;
        localStorage.setItem(`thayam_room_${roomId}`, JSON.stringify(local));
        const channel = getMockChannel(roomId);
        channel.postMessage({ type: 'UPDATE', state: local });
      } else {
        throw new Error("Room not found");
      }
    }
  },

  async updateRoom(roomId: string, updates: Partial<RoomState>): Promise<void> {
    if (!isMock && supabase) {
      // Read current state
      const { data, error: fetchError } = await supabase
        .from('rooms')
        .select('state')
        .eq('room_id', roomId)
        .single();
      
      if (fetchError || !data) return;

      const mergedState = { ...data.state, ...updates, updatedAt: Date.now() };

      // Write back
      await supabase
        .from('rooms')
        .update({ state: mergedState })
        .eq('room_id', roomId);
    } else {
      const local = mockDb[roomId] || JSON.parse(localStorage.getItem(`thayam_room_${roomId}`) || 'null');
      if (local) {
        const merged = { ...local, ...updates, updatedAt: Date.now() };
        mockDb[roomId] = merged;
        localStorage.setItem(`thayam_room_${roomId}`, JSON.stringify(merged));
        const channel = getMockChannel(roomId);
        channel.postMessage({ type: 'UPDATE', state: merged });
      }
    }
  },

  subscribeToRoom(roomId: string, onUpdate: (state: RoomState | null) => void): () => void {
    if (!isMock && supabase) {
      // 1. Fetch initial state
      supabase
        .from('rooms')
        .select('state')
        .eq('room_id', roomId)
        .single()
        .then((res: any) => {
          if (!res.error && res.data) {
            onUpdate(res.data.state as RoomState);
          } else {
            onUpdate(null);
          }
        });

      // 2. Subscribe to realtime update events
      const channel = supabase
        .channel(`room_changes_${roomId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `room_id=eq.${roomId}` },
          (payload: any) => {
            if (payload.new && payload.new.state) {
              onUpdate(payload.new.state as RoomState);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else {
      const local = mockDb[roomId] || JSON.parse(localStorage.getItem(`thayam_room_${roomId}`) || 'null');
      onUpdate(local);

      const channel = getMockChannel(roomId);
      const listener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'UPDATE') {
          mockDb[roomId] = event.data.state;
          onUpdate(event.data.state);
        } else if (event.data && event.data.type === 'REQUEST_STATE') {
          const currentState = mockDb[roomId] || JSON.parse(localStorage.getItem(`thayam_room_${roomId}`) || 'null');
          if (currentState) {
            channel.postMessage({ type: 'UPDATE', state: currentState });
          }
        }
      };
      
      channel.addEventListener('message', listener);
      channel.postMessage({ type: 'REQUEST_STATE' });

      return () => {
        channel.removeEventListener('message', listener);
      };
    }
  },

  async addChatMessage(roomId: string, chatItem: { id: string; senderName: string; message: string; timestamp: string }): Promise<void> {
    const local = mockDb[roomId] || JSON.parse(localStorage.getItem(`thayam_room_${roomId}`) || 'null');
    
    if (!isMock && supabase) {
      // Fetch state, append, and update
      const { data } = await supabase
        .from('rooms')
        .select('state')
        .eq('room_id', roomId)
        .single();
      
      if (data) {
        const chat = data.state.chat || [];
        const updatedChat = [...chat, chatItem].slice(-25);
        await this.updateRoom(roomId, { chat: updatedChat });
      }
    } else if (local) {
      const chat = local.chat || [];
      const updatedChat = [...chat, chatItem].slice(-25);
      await this.updateRoom(roomId, { chat: updatedChat });
    }
  }
};
