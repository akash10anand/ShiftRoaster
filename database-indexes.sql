-- ============================================
-- OPTIMIZED DATABASE INDEXES
-- This file contains additional indexes to improve query performance
-- Run this in your Supabase SQL Editor after creating the initial schema
-- ============================================

-- ============================================
-- PROFILES (EMPLOYEES) TABLE INDEXES
-- ============================================

-- Index for searching by name (used in searchPeople)
CREATE INDEX IF NOT EXISTS idx_profiles_name_trgm 
ON profiles USING GIN (name gin_trgm_ops);

-- Index for searching by phone
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
ON profiles(phone);

-- Index for searching by designation
CREATE INDEX IF NOT EXISTS idx_profiles_designation_trgm 
ON profiles USING GIN (designation gin_trgm_ops);

-- Composite index for full-text search optimization
CREATE INDEX IF NOT EXISTS idx_profiles_search 
ON profiles(name, phone, designation);

-- ============================================
-- ROLES TABLE INDEXES
-- ============================================

-- Index for unique constraint lookups
CREATE INDEX IF NOT EXISTS idx_roles_name_unique 
ON roles(name);

-- ============================================
-- PERSON_ROLES JUNCTION TABLE INDEXES
-- ============================================

-- Foreign key indexes (critical for joins)
CREATE INDEX IF NOT EXISTS idx_person_roles_person_id 
ON person_roles(person_id);

CREATE INDEX IF NOT EXISTS idx_person_roles_role_id 
ON person_roles(role_id);

-- Composite index for efficient lookups by person
CREATE INDEX IF NOT EXISTS idx_person_roles_person_role 
ON person_roles(person_id, role_id);

-- ============================================
-- GROUPS TABLE INDEXES
-- ============================================

-- Index for ordering/filtering by name
CREATE INDEX IF NOT EXISTS idx_groups_name 
ON groups(name);

-- ============================================
-- GROUP_MEMBERS JUNCTION TABLE INDEXES
-- ============================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id 
ON group_members(group_id);

CREATE INDEX IF NOT EXISTS idx_group_members_person_id 
ON group_members(person_id);

-- Composite indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_group_members_group_person 
ON group_members(group_id, person_id);

CREATE INDEX IF NOT EXISTS idx_group_members_person_group 
ON group_members(person_id, group_id);

-- ============================================
-- SHIFTS TABLE INDEXES
-- ============================================

-- Critical index for date-based queries (getShiftsByDate)
CREATE INDEX IF NOT EXISTS idx_shifts_date 
ON shifts(date DESC);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_shifts_name 
ON shifts(name);

-- Composite index for date + name queries
CREATE INDEX IF NOT EXISTS idx_shifts_date_name 
ON shifts(date DESC, name);

-- Index for ordering by creation
CREATE INDEX IF NOT EXISTS idx_shifts_created_at 
ON shifts(created_at DESC);

-- ============================================
-- SHIFT_ROLES JUNCTION TABLE INDEXES
-- ============================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_shift_roles_shift_id 
ON shift_roles(shift_id);

CREATE INDEX IF NOT EXISTS idx_shift_roles_role_id 
ON shift_roles(role_id);

-- Composite indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_shift_roles_shift_role 
ON shift_roles(shift_id, role_id);

-- Index for finding all roles in a shift (used in joins)
CREATE INDEX IF NOT EXISTS idx_shift_roles_shift_required 
ON shift_roles(shift_id, required_count);

-- ============================================
-- SHIFT_ASSIGNMENTS JUNCTION TABLE INDEXES
-- ============================================

-- Foreign key indexes
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_role_id 
ON shift_assignments(shift_role_id);

CREATE INDEX IF NOT EXISTS idx_shift_assignments_person_id 
ON shift_assignments(person_id);

-- Composite indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_role_person 
ON shift_assignments(shift_role_id, person_id);

CREATE INDEX IF NOT EXISTS idx_shift_assignments_person_shift_role 
ON shift_assignments(person_id, shift_role_id);

-- ============================================
-- LEAVES TABLE INDEXES
-- ============================================

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_leaves_person_id 
ON leaves(person_id);

-- Status-based filtering index (for filtering by pending/approved/rejected)
CREATE INDEX IF NOT EXISTS idx_leaves_status 
ON leaves(status);

-- Date range indexes for queries like "leaves between dates"
CREATE INDEX IF NOT EXISTS idx_leaves_start_date 
ON leaves(start_date);

CREATE INDEX IF NOT EXISTS idx_leaves_end_date 
ON leaves(end_date);

-- Composite index for person + status queries
CREATE INDEX IF NOT EXISTS idx_leaves_person_status 
ON leaves(person_id, status);

-- Composite index for date range queries
CREATE INDEX IF NOT EXISTS idx_leaves_date_range 
ON leaves(start_date, end_date, person_id);

-- Index for finding overlapping leaves
CREATE INDEX IF NOT EXISTS idx_leaves_overlap_check 
ON leaves(person_id, start_date, end_date);

-- ============================================
-- ENABLE TRIGRAM EXTENSION FOR TEXT SEARCH
-- ============================================

-- This extension enables efficient full-text search on text columns
-- Required for idx_profiles_name_trgm and idx_profiles_designation_trgm indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PERFORMANCE ANALYSIS
-- ============================================
-- After creating these indexes, analyze the database for query optimization:
-- ANALYZE;

-- To check index usage statistics, run:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- To find unused indexes:
-- SELECT schemaname, tablename, indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- NOTES ON INDEX STRATEGY
-- ============================================
/*
1. TRIGRAM INDEXES (GIN):
   - Used for partial text matching (name contains 'john')
   - Slower to write, faster to read for text searches
   - Applied to: profiles.name, profiles.designation

2. COMPOSITE INDEXES:
   - Speed up queries filtering by multiple columns
   - Order matters: put most selective columns first
   - Examples: (person_id, role_id), (shift_id, required_count)

3. DATE INDEXES:
   - Critical for shift queries (date-based filtering)
   - DESC ordering optimizes ORDER BY date DESC queries

4. STATUS INDEXES:
   - Optimize filtering by leave status (pending/approved/rejected)
   - Combined with person_id for person-specific status queries

5. FOREIGN KEY INDEXES:
   - Essential for JOIN operations
   - Speed up lookups across related tables

INDEX SIZE MANAGEMENT:
- Monitor index sizes with: SELECT * FROM pg_stat_user_indexes;
- Drop unused indexes to save space: DROP INDEX IF EXISTS index_name;
- Rebuild indexes periodically for optimization: REINDEX INDEX index_name;
*/
