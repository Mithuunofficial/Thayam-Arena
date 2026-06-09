import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMock } from './config';

export interface ThayamUser {
  uid: string;
  email: string;
  displayName: string;
  coins?: number;
  rank?: string;
  xp?: number;
}

interface AuthContextType {
  user: ThayamUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<{ confirmationRequired: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ThayamUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Monitor Auth Session States
  useEffect(() => {
    if (isMock || !supabase) {
      // Local storage mock mode
      const storedSession = localStorage.getItem('thayam_current_user');
      if (storedSession) {
        try {
          setUser(JSON.parse(storedSession));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
      return;
    }

    // Real Supabase Session Fetch & Listeners
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch profile row
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            if (profile.is_banned || profile.is_suspended) {
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setUser({
                uid: session.user.id,
                email: session.user.email || '',
                displayName: profile.username || session.user.email?.split('@')[0] || 'Warrior',
                coins: profile.coins,
                rank: profile.rank,
                xp: profile.xp
              });
            }
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              displayName: session.user.email?.split('@')[0] || 'Warrior',
              coins: 1000,
              rank: 'Bronze V',
              xp: 0
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error restoring session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          if (profile.is_banned || profile.is_suspended) {
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser({
              uid: session.user.id,
              email: session.user.email || '',
              displayName: profile.username || session.user.email?.split('@')[0] || 'Warrior',
              coins: profile.coins,
              rank: profile.rank,
              xp: profile.xp
            });
          }
        } else {
          setUser({
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.email?.split('@')[0] || 'Warrior',
            coins: 1000,
            rank: 'Bronze V',
            xp: 0
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time Ban/Suspension Profile Listener
  useEffect(() => {
    if (!user?.uid) return;

    if (isMock || !supabase) {
      // Mock Listener
      const reloadMockProfile = () => {
        const users = JSON.parse(localStorage.getItem('thayam_admin_mock_users') || '[]');
        const profile = users.find((u: any) => u.uid === user.uid);
        if (profile) {
          if (profile.is_banned || profile.is_suspended) {
            alert(profile.is_banned
              ? 'Your account has been permanently banned by an administrator.'
              : 'Your account has been suspended by an administrator.');
            signOut();
            return;
          }

          setUser(prev => prev ? {
            ...prev,
            displayName: profile.username || prev.displayName,
            coins: profile.coins !== undefined ? profile.coins : prev.coins,
            rank: profile.rank || prev.rank,
            xp: profile.xp !== undefined ? profile.xp : prev.xp
          } : null);
        }
      };

      reloadMockProfile();

      const bc = new BroadcastChannel('thayam_admin_users_sync');
      bc.addEventListener('message', reloadMockProfile);

      return () => {
        bc.removeEventListener('message', reloadMockProfile);
        bc.close();
      };
    } else {
      // Real database subscription
      const profileSubscription = supabase
        .channel(`public:profiles:id=eq.${user.uid}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.uid}` },
          (payload: any) => {
            const profile = payload.new;
            if (profile) {
              if (profile.is_banned || profile.is_suspended) {
                alert(profile.is_banned
                  ? 'Your account has been permanently banned by an administrator.'
                  : 'Your account has been suspended by an administrator.');
                signOut();
                return;
              }
              setUser(prev => prev ? {
                ...prev,
                displayName: profile.username || prev.displayName,
                coins: profile.coins !== undefined ? profile.coins : prev.coins,
                rank: profile.rank || prev.rank,
                xp: profile.xp !== undefined ? profile.xp : prev.xp
              } : null);
            }
          }
        )
        .subscribe();

      return () => {
        profileSubscription.unsubscribe();
      };
    }
  }, [user?.uid]);

  // Sign Up
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isMock && supabase) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (signUpError) throw signUpError;

        // If data.session is null, it means verification is required
        const confirmationRequired = !data?.session;
        return { confirmationRequired };
      } else {
        // Mock Local System
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const registeredUsersStr = localStorage.getItem('thayam_registered_users') || '{}';
        const registeredUsers = JSON.parse(registeredUsersStr);

        const emailLower = email.toLowerCase();
        if (registeredUsers[emailLower]) {
          throw new Error('Email is already registered on this battlefield.');
        }

        const isUsernameTaken = Object.values(registeredUsers).some(
          (u: any) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (isUsernameTaken) {
          throw new Error('Warrior name is already claimed by another combatant.');
        }

        const newMockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substring(2, 11),
          email: emailLower,
          username: username,
          password: password,
          coins: 1000,
          rank: 'Bronze V',
          xp: 0,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          online_status: true
        };

        registeredUsers[emailLower] = newMockUser;
        localStorage.setItem('thayam_registered_users', JSON.stringify(registeredUsers));

        // Sync user details to thayam_admin_mock_users list
        const adminUsers = JSON.parse(localStorage.getItem('thayam_admin_mock_users') || '[]');
        adminUsers.push({
          uid: newMockUser.uid,
          username: newMockUser.username,
          email: newMockUser.email,
          rank: 'Bronze V',
          xp: 0,
          coins: 1000,
          online_status: true,
          room_id: null,
          created_at: newMockUser.created_at,
          last_login: newMockUser.last_login
        });
        localStorage.setItem('thayam_admin_mock_users', JSON.stringify(adminUsers));

        // Notify administrative dashboard
        const bc = new BroadcastChannel('thayam_admin_users_sync');
        bc.postMessage('sync');

        const sessionUser: ThayamUser = {
          uid: newMockUser.uid,
          email: newMockUser.email,
          displayName: newMockUser.username,
          coins: 1000,
          rank: 'Bronze V',
          xp: 0
        };

        localStorage.setItem('thayam_current_user', JSON.stringify(sessionUser));
        localStorage.setItem('thayam_player_name', newMockUser.username);
        setUser(sessionUser);

        return { confirmationRequired: false };
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during recruitment.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isMock && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        if (!data.user) throw new Error("Authentication failed");

        // Fetch their public profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileErr) {
          console.warn("Could not load user profile. Waiting for trigger row creation...");
        }

        if (profile) {
          if (profile.is_banned) {
            await supabase.auth.signOut();
            throw new Error('Your account has been permanently banned from the arena.');
          }
          if (profile.is_suspended) {
            // Check if suspended_until has passed
            const now = new Date();
            const suspendedUntil = profile.suspended_until ? new Date(profile.suspended_until) : null;
            if (suspendedUntil && suspendedUntil > now) {
              await supabase.auth.signOut();
              throw new Error(`Your account is suspended until ${suspendedUntil.toLocaleString()}.`);
            } else {
              // Suspension expired! Let's update it in public.profiles
              await supabase
                .from('profiles')
                .update({ is_suspended: false, suspended_until: null })
                .eq('id', data.user.id);
            }
          }
          // Mark online status to true
          await supabase
            .from('profiles')
            .update({ online_status: true, last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        }
      } else {
        // Mock Local System
        await new Promise((resolve) => setTimeout(resolve, 800));

        const registeredUsersStr = localStorage.getItem('thayam_registered_users') || '{}';
        const registeredUsers = JSON.parse(registeredUsersStr);

        const emailLower = email.toLowerCase();
        const userRecord = registeredUsers[emailLower];

        if (!userRecord || userRecord.password !== password) {
          throw new Error('Invalid email or passcode. Verify your credentials, warrior.');
        }

        // Sync online status in thayam_admin_mock_users list
        const adminUsers = JSON.parse(localStorage.getItem('thayam_admin_mock_users') || '[]');
        const idx = adminUsers.findIndex((u: any) => u.uid === userRecord.uid);
        let userCoins = 1000;
        let userRank = 'Bronze V';
        let userXp = 0;
        if (idx !== -1) {
          // Check ban/suspension status before allowing login
          if (adminUsers[idx].is_banned) {
            throw new Error('Your account has been permanently banned from the arena.');
          }
          if (adminUsers[idx].is_suspended) {
            throw new Error('Your account is currently suspended from the arena.');
          }

          adminUsers[idx].online_status = true;
          adminUsers[idx].last_login = new Date().toISOString();
          userCoins = adminUsers[idx].coins !== undefined ? adminUsers[idx].coins : 1000;
          userRank = adminUsers[idx].rank || 'Bronze V';
          userXp = adminUsers[idx].xp !== undefined ? adminUsers[idx].xp : 0;
          localStorage.setItem('thayam_admin_mock_users', JSON.stringify(adminUsers));

          // Notify administrative dashboard
          const bc = new BroadcastChannel('thayam_admin_users_sync');
          bc.postMessage('sync');
        }

        const sessionUser: ThayamUser = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.username,
          coins: userCoins,
          rank: userRank,
          xp: userXp
        };

        localStorage.setItem('thayam_current_user', JSON.stringify(sessionUser));
        localStorage.setItem('thayam_player_name', userRecord.username);
        setUser(sessionUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your connection.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (!isMock && supabase) {
        if (user?.uid) {
          // Mark online status to false
          await supabase
            .from('profiles')
            .update({ online_status: false })
            .eq('id', user.uid);
        }
        await supabase.auth.signOut();
      } else {
        if (user) {
          const adminUsers = JSON.parse(localStorage.getItem('thayam_admin_mock_users') || '[]');
          const idx = adminUsers.findIndex((u: any) => u.uid === user.uid);
          if (idx !== -1) {
            adminUsers[idx].online_status = false;
            localStorage.setItem('thayam_admin_mock_users', JSON.stringify(adminUsers));

            // Notify administrative dashboard
            const bc = new BroadcastChannel('thayam_admin_users_sync');
            bc.postMessage('sync');
          }
        }
      }
      localStorage.removeItem('thayam_force_local_mode');
      localStorage.removeItem('thayam_current_user');
      setUser(null);
      
      // Navigate to home to reset isMock state on load
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Error returning to base.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, signIn, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
