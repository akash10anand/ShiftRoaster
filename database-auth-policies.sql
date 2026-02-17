-- ============================================
-- AUTHENTICATED RLS POLICIES
-- Run this after creating the initial database tables
-- This replaces the permissive policies with secure authenticated ones
-- ============================================

-- Drop existing policies (both old permissive and new authenticated ones)
-- This ensures a clean slate before recreating them

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all access to roles" ON roles;
DROP POLICY IF EXISTS "Allow all access to person_roles" ON person_roles;
DROP POLICY IF EXISTS "Allow all access to groups" ON groups;
DROP POLICY IF EXISTS "Allow all access to group_members" ON group_members;
DROP POLICY IF EXISTS "Allow all access to shifts" ON shifts;
DROP POLICY IF EXISTS "Allow all access to shift_roles" ON shift_roles;
DROP POLICY IF EXISTS "Allow all access to shift_assignments" ON shift_assignments;
DROP POLICY IF EXISTS "Allow all access to leaves" ON leaves;

-- Drop authenticated policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can delete profiles" ON profiles;

DROP POLICY IF EXISTS "Authenticated users can read roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can insert roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can update roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can delete roles" ON roles;

DROP POLICY IF EXISTS "Authenticated users can read person_roles" ON person_roles;
DROP POLICY IF EXISTS "Authenticated users can insert person_roles" ON person_roles;
DROP POLICY IF EXISTS "Authenticated users can update person_roles" ON person_roles;
DROP POLICY IF EXISTS "Authenticated users can delete person_roles" ON person_roles;

DROP POLICY IF EXISTS "Authenticated users can read groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can insert groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can update groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can delete groups" ON groups;

DROP POLICY IF EXISTS "Authenticated users can read group_members" ON group_members;
DROP POLICY IF EXISTS "Authenticated users can insert group_members" ON group_members;
DROP POLICY IF EXISTS "Authenticated users can update group_members" ON group_members;
DROP POLICY IF EXISTS "Authenticated users can delete group_members" ON group_members;

DROP POLICY IF EXISTS "Authenticated users can read shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can insert shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can update shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can delete shifts" ON shifts;

DROP POLICY IF EXISTS "Authenticated users can read shift_roles" ON shift_roles;
DROP POLICY IF EXISTS "Authenticated users can insert shift_roles" ON shift_roles;
DROP POLICY IF EXISTS "Authenticated users can update shift_roles" ON shift_roles;
DROP POLICY IF EXISTS "Authenticated users can delete shift_roles" ON shift_roles;

DROP POLICY IF EXISTS "Authenticated users can read shift_assignments" ON shift_assignments;
DROP POLICY IF EXISTS "Authenticated users can insert shift_assignments" ON shift_assignments;
DROP POLICY IF EXISTS "Authenticated users can update shift_assignments" ON shift_assignments;
DROP POLICY IF EXISTS "Authenticated users can delete shift_assignments" ON shift_assignments;

DROP POLICY IF EXISTS "Authenticated users can read leaves" ON leaves;
DROP POLICY IF EXISTS "Authenticated users can insert leaves" ON leaves;
DROP POLICY IF EXISTS "Authenticated users can update leaves" ON leaves;
DROP POLICY IF EXISTS "Authenticated users can delete leaves" ON leaves;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read profiles"
ON profiles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update profiles"
ON profiles FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete profiles"
ON profiles FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- ROLES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read roles"
ON roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert roles"
ON roles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update roles"
ON roles FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete roles"
ON roles FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- PERSON_ROLES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read person_roles"
ON person_roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert person_roles"
ON person_roles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update person_roles"
ON person_roles FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete person_roles"
ON person_roles FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- GROUPS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read groups"
ON groups FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert groups"
ON groups FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update groups"
ON groups FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete groups"
ON groups FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- GROUP_MEMBERS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read group_members"
ON group_members FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert group_members"
ON group_members FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update group_members"
ON group_members FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete group_members"
ON group_members FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- SHIFTS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read shifts"
ON shifts FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert shifts"
ON shifts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update shifts"
ON shifts FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete shifts"
ON shifts FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- SHIFT_ROLES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read shift_roles"
ON shift_roles FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert shift_roles"
ON shift_roles FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update shift_roles"
ON shift_roles FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete shift_roles"
ON shift_roles FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- SHIFT_ASSIGNMENTS POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read shift_assignments"
ON shift_assignments FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert shift_assignments"
ON shift_assignments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update shift_assignments"
ON shift_assignments FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete shift_assignments"
ON shift_assignments FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ============================================
-- LEAVES POLICIES
-- ============================================
CREATE POLICY "Authenticated users can read leaves"
ON leaves FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert leaves"
ON leaves FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update leaves"
ON leaves FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete leaves"
ON leaves FOR DELETE
USING (auth.uid() IS NOT NULL);
