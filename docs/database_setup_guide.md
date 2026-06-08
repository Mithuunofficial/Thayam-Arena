# ⚡ Supabase Database Setup Guide - Thayam Arena

This guide walks you through creating, configuring, and hosting a **Supabase Project** to power real-time online rooms, player matchmaking, authentication, and chat features in **Thayam Arena**.

---

## 🛠️ Step 1: Create a Supabase Project

1. Go to the [Supabase Dashboard](https://supabase.com/).
2. Click **New Project** (or sign in and select your organization).
3. Enter your project details:
   - **Name**: e.g., `thayam-arena`
   - **Database Password**: Generate a secure password and save it somewhere safe.
   - **Region**: Choose a region closest to your players for optimal latency (e.g., `South Asia (Mumbai)` or `East US`).
   - **Pricing Plan**: Choose the **Free** tier (more than sufficient for development and casual testing).
4. Click **Create new project** and wait a few minutes for the database to provision.

---

## 💾 Step 2: Create the `rooms` Table

Once your project is provisioned, you need to create the table that stores game states:

1. In the left-hand navigation bar, click on **SQL Editor** (icon with `>_` terminal symbol).
2. Click **New Query** to open a blank editor.
3. Paste the following SQL script to create the `rooms` table:

```sql
-- Create the rooms table to store game session payloads
create table rooms (
  room_id text primary key,
  state jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

4. Click the **Run** button (or press `Cmd + Enter` / `Ctrl + Enter`).
5. Ensure the query returns successfully.

---

## ⚡ Step 3: Enable Realtime Replication

For multiplayer sync to work, Supabase must broadcast database updates to clients instantly. You need to enable Realtime replication on the `rooms` table:

1. In the **SQL Editor**, open a new query tab.
2. Paste and run the following commands:

```sql
-- 1. Configure the rooms table to send full row representation on updates
alter table rooms replica identity full;

-- 2. Add the rooms table to the standard supabase_realtime publication
alter publication supabase_realtime add table rooms;
```

3. Click **Run** and verify it executes without error.

---

## 🔒 Step 4: Configure Row Level Security (RLS)

To allow players to create, join, and update game rooms without complex security blocks:

### Option A: Allow All Operations (Quickest for Testing & Mock Mode Dev)
Disable RLS on the `rooms` table or write a public policy. To disable RLS:
```sql
alter table rooms disable row level security;
```

### Option B: Write Public Select and Update Policies (Recommended for Production)
If you wish to keep RLS active:
```sql
alter table rooms enable row level security;

-- Allow public anonymous read access
create policy "Allow public read access" on rooms
  for select using (true);

-- Allow public anonymous insert access
create policy "Allow public insert access" on rooms
  for insert with check (true);

-- Allow public anonymous update access
create policy "Allow public update access" on rooms
  for update using (true);
```

---

## 🔑 Step 5: Configure Supabase Authentication

Thayam Arena supports User Registration and Login.
By default, Supabase requires email confirmation for new sign-ups. For a smooth gaming signup process, you should disable email confirmation:

1. In the left-hand navigation sidebar, click on **Authentication** (user profile icon) and go to **Providers** or **Email**.
2. Find the **Confirm email** toggle.
3. **Turn OFF** the "Confirm email" requirement (so users are signed in immediately upon signup without verifying their email address).
4. Click **Save**.

---

## 🌐 Step 6: Connect Database to the Game Frontend

To securely pass your Supabase API endpoint and anonymous key to your Vite React application:

1. Create a new file in your project's root folder (the folder containing `package.json`) and name it `.env`.
2. Retrieve your credentials:
   - Click on the **Project Settings** (gear icon ⚙️ at the bottom-left).
   - Go to **API**.
   - Copy the **Project URL** (under `Project API Keys`).
   - Copy the **anon / public** key (under `Project API Keys`).
3. Open the `.env` file and insert the details:

```env
# Supabase Configuration Keys
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Save the `.env` file.
5. Restart your development server (`npm run dev`) so Vite loads the new variables.

---

## 🎯 Step 7: Verify Database Connections

1. Open your game in the browser.
2. Go to **Sign Up** or **Sign In** and create a warrior account.
3. Click **Friends Mode**, choose your warrior name/avatar, select **Teammates (2v2 Team)**, and click **Create Room**.
4. In the Supabase Dashboard, click on the **Table Editor** (grid icon) and select the `rooms` table.
5. Verify that a new entry under `rooms` with your room ID is created automatically, storing the complete players, board layout, and initial configurations!
