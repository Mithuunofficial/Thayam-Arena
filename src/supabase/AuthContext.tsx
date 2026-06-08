import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isMock } from './config';

export interface ThayamUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  user: ThayamUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
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
    if (!isMock && supabase) {
      // 1. Fetch initial session
      supabase.auth.getSession().then((res: any) => {
        const session = res.data?.session;
        if (session && session.user) {
          setUser({
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata.username || session.user.email?.split('@')[0] || 'Warrior',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      // 2. Register realtime auth listeners
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session && session.user) {
          setUser({
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.user_metadata.username || session.user.email?.split('@')[0] || 'Warrior',
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
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
    }
  }, []);

  // Sign Up
  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isMock && supabase) {
        // Real Supabase auth sign up
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
        if (!data.user) throw new Error("Recruitment failed.");

        setUser({
          uid: data.user.id,
          email: data.user.email || '',
          displayName: username,
        });
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
          password: password
        };

        registeredUsers[emailLower] = newMockUser;
        localStorage.setItem('thayam_registered_users', JSON.stringify(registeredUsers));

        const sessionUser: ThayamUser = {
          uid: newMockUser.uid,
          email: newMockUser.email,
          displayName: newMockUser.username,
        };

        localStorage.setItem('thayam_current_user', JSON.stringify(sessionUser));
        localStorage.setItem('thayam_player_name', newMockUser.username);
        setUser(sessionUser);
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
        // Real Supabase sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;
        if (!data.user) throw new Error("Sign in failed.");

        setUser({
          uid: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata.username || data.user.email?.split('@')[0] || 'Warrior',
        });
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

        const sessionUser: ThayamUser = {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.username,
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
        await supabase.auth.signOut();
      } else {
        localStorage.removeItem('thayam_current_user');
      }
      setUser(null);
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
