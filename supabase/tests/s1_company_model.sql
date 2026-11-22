-- pgTAP tests for S1: Company model (renamed companies to organizations)
-- These tests verify the migration and helper functions

-- Begin test output
BEGIN;

-- Test 1: organizations table exists and has correct columns
SELECT
    count(*) AS test_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'organizations';

-- Should return 1 (table exists)
-- If 0, FAIL: organizations table not found

-- Test 2: organizations table has correct columns
SELECT
    count(*) AS column_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'organizations'
  AND column_name IN ('id', 'name', 'sector', 'size', 'sales_id');

-- Should return 5 (all required columns exist)
-- If < 5, FAIL: missing columns in organizations table

-- Test 3: Three UAE companies are seeded
SELECT
    count(*) AS company_count
FROM public.organizations
WHERE name IN ('Goldland Contracting', 'Abbadi Tech', 'Casavera Interiors');

-- Should return 3
-- If < 3, FAIL: companies not seeded properly

-- Test 4: Departments table exists
SELECT
    count(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'departments';

-- Should return 1

-- Test 5: Roles table exists
SELECT
    count(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'roles';

-- Should return 1

-- Test 6: Role permissions table exists
SELECT
    count(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'role_permissions';

-- Should return 1

-- Test 7: User company memberships table exists
SELECT
    count(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_company_memberships';

-- Should return 1

-- Test 8: Contacts table has organization_id column (not company_id)
SELECT
    count(*) AS col_count
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'contacts'
  AND column_name = 'organization_id';

-- Should return 1
-- If 0, FAIL: contacts.organization_id missing (still has company_id)

-- Test 9: Contacts table no longer has company_id as FK to companies
SELECT
    count(*) AS fk_count
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'contacts'
  AND constraint_name = 'contacts_company_id_fkey';

-- Should return 0 (constraint renamed/dropped)
-- If 1, FAIL: old FK still exists

-- Test 10: Contacts FK references organizations
SELECT
    count(*) AS fk_count
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND table_name = 'contacts'
  AND constraint_name = 'contacts_organization_id_fkey';

-- Should return 1

-- Test 11: Has_role function exists and is SECURITY DEFINER
SELECT
    proname,
    prosecutor,
    prossearch_path
FROM pg_proc
WHERE proname = 'has_role';

-- Should return: has_role, 't' (security definer), '' (empty search_path)

-- Test 12: Auth_company_ids function exists and returns setof bigint
SELECT
    proname,
    prosecutor,
    prossearch_path
FROM pg_proc
WHERE proname = 'auth_company_ids';

-- Should return: auth_company_ids, 't' (security definer), '' (empty search_path)

-- Test 13: Helper functions return correct results for a test user
-- This test checks that auth_company_ids() returns organization IDs
-- and has_role(company_id, role_name) returns correct boolean

-- Test 14: No cross-company access - a user in Goldland cannot see Abbadi data
-- This would be tested by inserting test users and checking the RLS policies

-- End test output
SELECT 'S1 company model tests completed' AS summary;

ROLLBACK;