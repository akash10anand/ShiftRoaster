# Supabase Integration Guide

## What You Need From Your Supabase Project

To connect your Shift Roaster app to Supabase, you need **two pieces of information** from your Supabase project:

### 1. Supabase URL

This is your project's API endpoint. It looks like: `https://xxxxxxxxxxxxx.supabase.co`

### 2. Supabase Anon Key

This is the public anonymous key for your project. It's safe to use in your frontend app.

---

## Where to Find These Values

1. Go to https://app.supabase.com
2. Open your project
3. Click on **Settings** (gear icon in the sidebar)
4. Click on **API** in the settings menu
5. You'll find:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon public** key (this is your `VITE_SUPABASE_ANON_KEY`)

---

## How to Configure Your App

### Step 1: Create a `.env` file

In the root of your project (same folder as `package.json`), create a file named `.env`:

```bash
# In the project root
touch .env
```

### Step 2: Add your Supabase credentials

Open the `.env` file and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase URL and anon key.

### Step 3: Restart your development server

If your dev server is running, stop it (Ctrl+C) and restart:

```bash
npm run dev
```

---

## Setting Up Your Supabase Database

You need to create the database tables in your Supabase project. Here's how:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the SQL schema from `database-schema.sql` (see below)
5. Click **Run** to execute the SQL

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

---

## Database Schema

Create a file `database-schema.sql` in your project root with this content:

```sql
-- Profiles table (People)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  designation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Person-Roles junction table (many-to-many)
CREATE TABLE person_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(person_id, role_id)
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group-Members junction table (many-to-many)
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, person_id)
);

-- Shifts table
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift-Roles junction table
CREATE TABLE shift_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  required_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shift-Assignments junction table
CREATE TABLE shift_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_role_id UUID NOT NULL REFERENCES shift_roles(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_role_id, person_id)
);

-- Leaves table
CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_person_roles_person ON person_roles(person_id);
CREATE INDEX idx_person_roles_role ON person_roles(role_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_person ON group_members(person_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shift_roles_shift ON shift_roles(shift_id);
CREATE INDEX idx_shift_roles_role ON shift_roles(role_id);
CREATE INDEX idx_shift_assignments_shift_role ON shift_assignments(shift_role_id);
CREATE INDEX idx_shift_assignments_person ON shift_assignments(person_id);
CREATE INDEX idx_leaves_person ON leaves(person_id);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX idx_leaves_status ON leaves(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth requirements)
-- For simplicity, we're allowing anonymous access. In production, you should restrict this.

-- Profiles policies
CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Roles policies
CREATE POLICY "Allow all access to roles" ON roles FOR ALL USING (true) WITH CHECK (true);

-- Person roles policies
CREATE POLICY "Allow all access to person_roles" ON person_roles FOR ALL USING (true) WITH CHECK (true);

-- Groups policies
CREATE POLICY "Allow all access to groups" ON groups FOR ALL USING (true) WITH CHECK (true);

-- Group members policies
CREATE POLICY "Allow all access to group_members" ON group_members FOR ALL USING (true) WITH CHECK (true);

-- Shifts policies
CREATE POLICY "Allow all access to shifts" ON shifts FOR ALL USING (true) WITH CHECK (true);

-- Shift roles policies
CREATE POLICY "Allow all access to shift_roles" ON shift_roles FOR ALL USING (true) WITH CHECK (true);

-- Shift assignments policies
CREATE POLICY "Allow all access to shift_assignments" ON shift_assignments FOR ALL USING (true) WITH CHECK (true);

-- Leaves policies
CREATE POLICY "Allow all access to leaves" ON leaves FOR ALL USING (true) WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON leaves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Testing the Connection

After setting up your `.env` file and database:

1. Start your development server: `npm run dev`
2. Open the app in your browser
3. You'll see a sign-in page
4. Create an account using the "Sign Up" option
5. Check your email to confirm your account (if email confirmation is enabled)
6. Sign in and start using the app

---

## 🔒 Authentication & Security

### Authentication is Now Enabled

The app now requires users to sign in before accessing any features. This includes:

- **Sign Up**: New users can create an account with email and password
- **Sign In**: Existing users can log in
- **Sign Out**: Users can log out from the navigation bar
- **Protected Routes**: All pages require authentication

### Updating RLS Policies for Production

The initial database setup uses permissive RLS policies for testing. **You must update them for production.**

#### Step 1: Apply Authenticated RLS Policies

In your Supabase SQL Editor, run the SQL from `database-auth-policies.sql`:

```bash
# This file contains secure RLS policies that require authentication
cat database-auth-policies.sql
```

Or copy and run these commands in Supabase SQL Editor to update all policies at once.

#### Step 2: Configure Email Settings (Optional but Recommended)

In Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Email**
2. Enable "Confirm email" for new signups (recommended)
3. Customize email templates under **Email Templates**

#### Step 3: Test Authentication

1. Try creating a new account
2. Verify you receive a confirmation email
3. Log in and test all features
4. Try accessing the app in an incognito window (should show login page)

### Current Security Model

✅ **What's Protected:**

- All database operations require a signed-in user
- Users must authenticate before accessing any data
- Session management handled by Supabase

⚠️ **Current Limitations:**

- All authenticated users have full access to all data
- No role-based permissions (admin vs regular user)
- No per-organization data isolation

### Future Security Enhancements (Optional)

For multi-tenant or team-based access, consider:

1. **Add role-based access control (RBAC)**
   - Admin users can manage everything
   - Regular users have limited access
2. **Add organization/team isolation**
   - Each organization has their own data
   - Users can only access their organization's data

3. **Add audit logging**
   - Track who did what and when

---

## 📧 Email Configuration

By default, Supabase uses a built-in SMTP server for development. For production:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your own SMTP provider (SendGrid, AWS SES, etc.)
3. This ensures reliable email delivery

---

## Important Security Note

✅ **Authentication is now enabled!**

The app requires users to sign in, and all database operations are restricted to authenticated users only.

**For production deployment:**

1. ✅ Authentication enabled
2. ✅ RLS policies restrict access to authenticated users (after running `database-auth-policies.sql`)
3. Consider adding role-based access control if needed
4. Set up custom SMTP for reliable email delivery
5. Enable email confirmation for new signups

---

## Troubleshooting

### "Missing Supabase environment variables" error

- Make sure your `.env` file is in the project root
- Verify that the variable names start with `VITE_` (required by Vite)
- Restart your dev server after creating/editing `.env`

### Authentication Issues

- **Can't sign up**: Check Supabase logs (Dashboard → Logs → Auth)
- **Email not received**: Check spam folder or configure custom SMTP
- **401 errors after login**: Ensure you ran the authenticated RLS policies from `database-auth-policies.sql`

### Data not loading

- Check browser console for errors
- Verify your Supabase URL and key are correct
- Ensure all database tables are created
- Check RLS policies are set correctly

### CORS errors

- The anon key should work without CORS issues
- If using custom domains, configure CORS in Supabase settings

---

## Migration from LocalStorage

If you have existing data in localStorage, it will NOT be automatically migrated. You can:

1. **Start fresh**: Clear browser localStorage and use Supabase
2. **Manual migration**: Export data from localStorage and import to Supabase using the SQL editor

To clear localStorage:

```javascript
// In browser console
localStorage.clear();
```

---

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
