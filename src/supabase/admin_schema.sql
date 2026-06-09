-- SQL Script for Setting Up AAA Game Admin Dashboard Tables in Supabase
-- Run these statements in your Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Extended Profile Info Table (If it doesn't already exist)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    rank TEXT DEFAULT 'Bronze V',
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    online_status BOOLEAN DEFAULT false,
    room_id TEXT,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Matches History Table
CREATE TABLE IF NOT EXISTS public.matches (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    players JSONB NOT NULL, -- Array of user objects/IDs with metadata
    winner_id TEXT,
    loser_id TEXT,
    status TEXT DEFAULT 'completed', -- 'completed', 'active', 'cancelled'
    move_count INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- in seconds
    game_logs JSONB DEFAULT '[]'::jsonb, -- Array of move records
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Live Game Rooms Table
CREATE TABLE IF NOT EXISTS public.rooms (
    room_id TEXT PRIMARY KEY,
    state JSONB NOT NULL, -- Complete serialized room state
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tournaments Table
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming', -- 'upcoming', 'live', 'finished'
    rewards TEXT,
    brackets JSONB DEFAULT '{}'::jsonb,
    players JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Broadcast Announcements/Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'announcement', 'maintenance', 'emergency'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Analytics Table (Time Series metrics)
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL, -- 'total_users', 'active_players', 'matches_today', 'revenue'
    value DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Admin Activity Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Player Abuse/Cheat Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id TEXT NOT NULL,
    reporter_username TEXT,
    reported_id TEXT NOT NULL,
    reported_username TEXT,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set Row Level Security (RLS) policies or leave public depending on client setup.
-- For a fast start, you can configure standard policies or access via Service Role.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated reads, but restrict writes to admin workflows.
-- Standard public read policies:
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read on matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public read on rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read on tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public read on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow public read on analytics" ON public.analytics FOR SELECT USING (true);
CREATE POLICY "Allow public read on reports" ON public.reports FOR SELECT USING (true);

-- --- AUTOMATIC REGISTRATION TRIGGER ---
-- Replicates newly signed-up users from auth.users to public.profiles

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
    100,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

