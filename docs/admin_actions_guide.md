# Admin Actions Guide: Tournaments, Ban, Suspend & Delete Users

## ✅ What's Already Working (Your Code Has This)

Your codebase already has **all the frontend logic** for these admin actions. Here's the status:

| Action | Frontend (UI) | Mock (localStorage) | Supabase (Real DB) | Real-time Sync |
|---|---|---|---|---|
| **Delete Tournament** | ✅ [TournamentsTab.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/components/admin/tabs/TournamentsTab.tsx#L58-L65) | ✅ | ✅ | ⚠️ Needs RLS policy |
| **Ban User** | ✅ [UsersTab.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/components/admin/tabs/UsersTab.tsx#L56-L65) | ✅ | ⚠️ Needs `is_banned` column | ⚠️ Needs enforcement |
| **Suspend User** | ✅ [UsersTab.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/components/admin/tabs/UsersTab.tsx#L45-L54) | ✅ | ⚠️ Needs `is_suspended` column | ⚠️ Needs enforcement |
| **Delete User** | ✅ [UsersTab.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/components/admin/tabs/UsersTab.tsx#L67-L73) | ✅ | ⚠️ Partial (profile only) | ⚠️ Needs auth deletion |

---

## 🗄️ SQL Queries to Run in Supabase SQL Editor

Run these queries in order in your **Supabase Dashboard → SQL Editor**.

---

### 1. Add Ban/Suspend Columns to `profiles` Table

Your [admin_schema.sql](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/admin_schema.sql) doesn't have `is_banned` and `is_suspended` columns. Add them:

```sql
-- Add ban/suspend status columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;
```

---

### 2. RLS Policies for Admin Write Operations

Your current RLS only allows users to update their **own** profile. The admin needs to update/delete **any** profile, tournament, etc. You need a way to identify admins.

#### Option A: Use Supabase Service Role Key (Simplest — Recommended for now)

Your admin dashboard can use the **service role key** (bypasses RLS entirely). This is the simplest approach — just set this in your `.env`:

```
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> [!CAUTION]
> The service role key should **NEVER** be exposed in client-side code in production. For a production app, you'd create a serverless Edge Function. But for development/MVP, this works.

#### Option B: Role-Based RLS Policies (Production-grade)

If you prefer proper RLS policies, create an `admin_users` table and reference it:

```sql
-- Create admin registry table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',  -- 'admin', 'moderator'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES: Allow admin to update ANY profile
-- ============================================
CREATE POLICY "Admin can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete any profile"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- TOURNAMENTS: Allow admin full CRUD
-- ============================================
CREATE POLICY "Admin can insert tournaments"
  ON public.tournaments
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update tournaments"
  ON public.tournaments
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete tournaments"
  ON public.tournaments
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- NOTIFICATIONS: Allow admin to create
-- ============================================
CREATE POLICY "Admin can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- REPORTS: Allow admin to update status
-- ============================================
CREATE POLICY "Admin can update reports"
  ON public.reports
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- ADMIN LOGS: Allow admin to insert
-- ============================================
CREATE POLICY "Admin can insert logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can read logs"
  ON public.admin_logs
  FOR SELECT
  USING (public.is_admin());

-- ============================================
-- Register yourself as admin (replace with YOUR auth.users UUID)
-- ============================================
-- Run this AFTER you sign up with your admin account:
-- INSERT INTO public.admin_users (id, role) VALUES ('YOUR-AUTH-USER-UUID', 'admin');
```

---

### 3. Enforce Ban/Suspension on the User Side

When admin bans or suspends a user, the user should be **blocked from playing**. This requires:

#### A. Block banned users from signing in (Database Function)

```sql
-- Block login for banned users by revoking their JWT
-- This function runs BEFORE the auth token is issued
CREATE OR REPLACE FUNCTION public.check_user_ban()
RETURNS TRIGGER AS $$
DECLARE
  user_banned BOOLEAN;
  user_suspended BOOLEAN;
  suspended_until_ts TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_banned, is_suspended, profiles.suspended_until
  INTO user_banned, user_suspended, suspended_until_ts
  FROM public.profiles
  WHERE id = NEW.id;

  -- If user is permanently banned
  IF user_banned = true THEN
    RAISE EXCEPTION 'Your account has been permanently banned.';
  END IF;

  -- If user is suspended and suspension hasn't expired
  IF user_suspended = true AND (suspended_until_ts IS NULL OR suspended_until_ts > now()) THEN
    RAISE EXCEPTION 'Your account is currently suspended.';
  END IF;

  -- Auto-lift expired suspensions
  IF user_suspended = true AND suspended_until_ts IS NOT NULL AND suspended_until_ts <= now() THEN
    UPDATE public.profiles SET is_suspended = false, suspended_until = NULL WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> [!NOTE]  
> Supabase doesn't easily allow blocking auth at the trigger level. The better approach is to check the ban status **client-side after login** (see the code changes below).

---

### 4. Enable Real-Time for All Tables

For admin changes to reflect immediately on user screens, enable Supabase Realtime:

```sql
-- Enable realtime publications for relevant tables
-- Run this in SQL Editor:
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_logs;
```

> [!IMPORTANT]
> You can also do this from the Supabase Dashboard UI:  
> **Database → Replication → Source → Tables** → Toggle ON for each table.

---

### 5. Delete User Completely (Including Auth Record)

Your current [deleteUser](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/adminDb.ts#L333-L345) only deletes from `profiles`. To fully delete a user (including their `auth.users` record), you need a **server-side function** because the client SDK can't delete other users' auth records.

```sql
-- Edge function alternative: Database function to delete user from auth
-- This requires the supabase_admin role
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete from profiles (cascades due to FK)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- Delete from auth.users (requires admin privileges)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users who are admins
-- The function itself is SECURITY DEFINER so it runs with elevated privileges
```

> [!WARNING]  
> The `DELETE FROM auth.users` part requires elevated privileges. In Supabase, the cleanest way is to use the **Admin API** via an Edge Function or call `supabase.auth.admin.deleteUser(uid)` from a **server-side** context (using the service role key).

---

## 🔧 Code Changes Needed in Your App

### Change 1: Check Ban Status After Login

In [AuthContext.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx), after successful sign-in, check if the user is banned/suspended:

```typescript
// In the signIn function, after getting the user session, add:
// (Inside the !isMock && supabase branch, after setUser)

// Check ban/suspension status
const { data: profile } = await supabase
  .from('profiles')
  .select('is_banned, is_suspended, suspended_until')
  .eq('id', data.user.id)
  .single();

if (profile?.is_banned) {
  await supabase.auth.signOut();
  throw new Error('Your account has been permanently banned from the arena.');
}

if (profile?.is_suspended) {
  const suspendedUntil = profile.suspended_until 
    ? new Date(profile.suspended_until).toLocaleString() 
    : 'indefinitely';
  await supabase.auth.signOut();
  throw new Error(`Your account is suspended until ${suspendedUntil}.`);
}
```

For **mock mode**, add to the mock signIn branch (after line 338 in AuthContext.tsx):

```typescript
// Check ban/suspension in mock mode
if (idx !== -1) {
  if (adminUsers[idx].is_banned) {
    throw new Error('Your account has been permanently banned from the arena.');
  }
  if (adminUsers[idx].is_suspended) {
    throw new Error('Your account is currently suspended.');
  }
}
```

### Change 2: Real-Time Ban Enforcement (Force Logout)

In [AuthContext.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx), the realtime profile listener (line 141-166) already watches for profile changes. Add ban checking:

```typescript
// Inside the postgres_changes callback (line 149-158), add:
if (payload.new.is_banned || payload.new.is_suspended) {
  // Force sign out immediately
  signOut();
  alert('Your account has been banned or suspended by an administrator.');
  return;
}
```

For **mock mode**, in the mock profile listener (line 169-195), add:

```typescript
// Inside reloadMockProfile function, add after finding the profile:
if (profile.is_banned || profile.is_suspended) {
  signOut();
  return;
}
```

---

## 📡 How Real-Time Sync Works (Admin → User)

Your app already has the sync architecture. Here's the flow:

```
Admin Dashboard Action
        │
        ▼
┌─────────────────────────┐
│  adminDb.updateUser()   │  (or deleteTournament, etc.)
│  writes to Supabase DB  │
└────────────┬────────────┘
             │
     ┌───────┴───────┐
     │  Two Paths    │
     ▼               ▼
┌──────────┐  ┌──────────────┐
│  Mock    │  │  Supabase    │
│  Mode    │  │  Real Mode   │
└────┬─────┘  └──────┬───────┘
     │               │
     ▼               ▼
BroadcastChannel  postgres_changes
     │           (Realtime subscription)
     │               │
     ▼               ▼
┌──────────────────────────┐
│  AuthContext listener    │
│  updates user state      │
│  (coins, rank, xp, etc.)│
│  OR forces sign-out if   │
│  banned/suspended        │
└──────────────────────────┘
```

### What's already syncing in real-time:
- ✅ Coins, XP, Rank changes ([AuthContext.tsx:141-166](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx#L141-L166) for Supabase, [169-195](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx#L169-L195) for mock)
- ✅ Room state changes ([db.ts:156-213](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/db.ts#L156-L213))

### What needs to be added:
- ❌ Ban/suspend enforcement (auto-logout) — Code changes shown above
- ❌ Tournament deletion reflected to users viewing tournaments — Need a tournament subscription on user side (if they see tournaments)

---

## 📋 Summary Checklist

| Step | What to Do | Where |
|---|---|---|
| 1 | Run `ALTER TABLE` to add `is_banned`, `is_suspended` columns | Supabase SQL Editor |
| 2 | Run `ALTER PUBLICATION` to enable Realtime | Supabase SQL Editor |
| 3 | Create RLS policies for admin operations (Option A or B) | Supabase SQL Editor |
| 4 | Add ban-check in `signIn` function | [AuthContext.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx) |
| 5 | Add real-time ban enforcement (force logout) | [AuthContext.tsx](file:///c:/Users/mithu/OneDrive/Desktop/Projects/Thayam-Game/src/supabase/AuthContext.tsx) |
| 6 | For full user deletion, use Admin API or Edge Function | Server-side |

> [!TIP]
> For your current stage (development/MVP), **Option A (service role key)** is fastest. Switch to **Option B (role-based RLS)** before going to production.

Would you like me to implement the code changes (ban enforcement in AuthContext) directly in your files?
