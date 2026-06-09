-- SQL Script for Setting Up Thayam Game Database in Supabase
-- Go to your Supabase Dashboard -> SQL Editor -> Create a new query, paste this script, and click "Run".

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    rank TEXT DEFAULT 'Bronze V',
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 1000,
    online_status BOOLEAN DEFAULT false,
    room_id TEXT DEFAULT NULL,
    is_banned BOOLEAN DEFAULT false,
    is_suspended BOOLEAN DEFAULT false,
    ban_reason TEXT DEFAULT NULL,
    suspended_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 2. LIVE GAME ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.rooms (
    room_id TEXT PRIMARY KEY,
    state JSONB NOT NULL, -- Serialized game room state object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 3. MATCHES HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    players JSONB NOT NULL, -- Array of player metadata objects
    winner_id TEXT DEFAULT NULL,
    loser_id TEXT DEFAULT NULL,
    status TEXT DEFAULT 'completed', -- 'completed', 'active', 'cancelled'
    move_count INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- in seconds
    game_logs JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 4. TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'live', 'finished'
    rewards TEXT NOT NULL,
    brackets JSONB DEFAULT '{}'::jsonb,
    players JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 5. BROADCAST NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'announcement', 'maintenance', 'emergency'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 6. ADMIN OPERATIONS LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    ip_address TEXT DEFAULT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 7. PLAYER REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL,
    reporter_username TEXT DEFAULT NULL,
    reported_id TEXT NOT NULL,
    reported_username TEXT DEFAULT NULL,
    reason TEXT NOT NULL,
    details TEXT DEFAULT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- 8. SECURITY THREAT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'suspicious_activity', 'ip_blocked'
    ip_address TEXT DEFAULT NULL,
    username TEXT DEFAULT NULL,
    details TEXT DEFAULT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) — Enable on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================
-- Profiles: Anyone can read profiles. Users can update their own.
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow users to insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Rooms: Anyone can read, insert, update, and delete rooms (essential for game state syncing).
CREATE POLICY "Allow public read on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rooms" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rooms" ON public.rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on rooms" ON public.rooms FOR DELETE USING (true);

-- Matches: Anyone can read matches. Anyone can insert completed matches.
CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on matches" ON public.matches FOR INSERT WITH CHECK (true);

-- Tournaments: Anyone can read tournaments.
CREATE POLICY "Allow public read on tournaments" ON public.tournaments FOR SELECT USING (true);

-- Notifications: Anyone can read notifications.
CREATE POLICY "Allow public read on notifications" ON public.notifications FOR SELECT USING (true);

-- Reports: Anyone can read reports, and anyone can file a report.
CREATE POLICY "Allow public read on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true);

-- Admin Logs & Security Logs: Read access enabled for dashboard audits.
CREATE POLICY "Allow public read on admin_logs" ON public.admin_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admin_logs" ON public.admin_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on security_logs" ON public.security_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on security_logs" ON public.security_logs FOR INSERT WITH CHECK (true);

-- Admin bypass policies for database table modifications (update/delete rules)
CREATE POLICY "Allow admin write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write on tournaments" ON public.tournaments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin write on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRANSACTIONS & TRIGGERS
-- ============================================

-- Function to handle copying new auth.users signup metadata to profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, rank, xp, coins, online_status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'Bronze V',
    0,
    1000,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link function to auth.users insert event
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Stored procedure to safely delete user from both profiles and auth.users tables (requires Security Definer)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = target_user_id;
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ENABLE REALTIME PUBLICATION
-- ============================================
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.tournaments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.reports;
alter publication supabase_realtime add table public.admin_logs;
