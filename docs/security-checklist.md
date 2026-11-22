# Security Checklist

This document lists all security checks that must pass in CI/CD. Any failure blocks merging.

## RLS Policy Checks

- [ ] **RLS enabled on every public table**
  - Verify: `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('organizations','contacts','contact_notes','deals','deal_notes','sales','tags','tasks','configuration','favicons_excluded_domains','audit_log');`
  - All must return `relrowsecurity = true`

- [ ] **No `using (true)` policies on business tables**
  - Verify: `SELECT polname, polcmd, polqual FROM pg_policy WHERE polqual LIKE '%true%' AND poltable NOT IN ('auth.users','public.%');`
  - No results expected (all policies must check membership/is_admin)

- [ ] **Views use `security_invoker = true`**
  - Verify: `SELECT viewname, security_invoker FROM pg_views WHERE viewname IN ('activity_log','companies_summary','contacts_summary');`
  - All must return `security_invoker = true`

- [ ] **`has_role()` and `auth_company_ids()` functions are SECURITY DEFINER with empty search_path**
  - Verify: `SELECT proname, prosecutor, prossearch_path FROM pg_proc WHERE proname IN ('has_role','auth_company_ids');`
  - Both must return `prosecutor = 't'` and `prosearch_path = ''`

## Membership & Role Checks

- [ ] **`auth_company_ids()` returns only approved organizations for the calling user**
  - Test: user in Goldland should only return Goldland's ID; user in no org should return empty set

- [ ] **`has_role(company_id, role_name)` checks membership correctly**
  - Test: user with role "admin" in org X should return true for has_role(X, 'admin'); should return false for other orgs

- [ ] **Temporary memberships inert until approved**
  - Test: membership with status='temporary' and effective_to < now() should not grant access

- [ ] **Revoked membership loses access immediately**
  - Test: membership status changed from 'approved' to 'revoked' should cause next query to return no rows

## Break-Glass Admin

- [ ] **`is_admin()` function works correctly**
  - Verify: user with `administrator = true` in `sales` table returns true; others return false

- [ ] **Admin policies use `is_admin()` for break-glass access**
  - Verify: configuration RLS, sales writes, tag writes all check `is_admin()` alongside membership

- [ ] **IT admin has no business-content access without break-glass**
  - Test: non-admin user in an organization should not be able to read/write business data even if they know record IDs

## Audit Log

- [ ] **`audit_log` is insert-only for authenticated users**
  - Verify: `REVOKE UPDATE, DELETE ON audit_log FROM authenticated;`

- [ ] **`service_role` can perform all operations on `audit_log`**
  - Verify: `GRANT ALL ON audit_log TO service_role;`

- [ ] **Audit triggers fire on all business table changes**
  - Test: INSERT/UPDATE/DELETE on organizations, deals, contacts, contact_notes, deal_notes, tasks should create an audit row

## CI Checks

- [ ] **Lint passes**: `npm run lint` (ESLint + Prettier)
- [ ] **Typecheck passes**: `npx tsc --noEmit`
- [ ] **Unit tests pass**: `npm test` (vitest)
- [ ] **pgTAP tests pass**: Supabase migration tests
- [ ] **gitleaks**: No secrets in code (API keys, JWT secrets, passwords)
- [ ] **OSV-Scanner or npm audit**: No vulnerable dependencies
- [ ] **Semgrep**: No securityanti-patterns in code
- [ ] **Migration dry-run**: `npx supabase migration up --local` applies cleanly from scratch
- [ ] **No public table with RLS off**: CI fails if any table has `relrowsecurity = false`
- [ ] **No view without `security_invoker`**: CI fails if any view missing `security_invoker = true`

## Compliance

- [ ] **PDPL adviser sign-off**: Notes on personal data handling for UAE
- [ ] **Backups stored in-country**: Backups and logs stored within UAE (AWS me-central-1 or Azure UAE North)
- [ ] **Port scan**: External port scan results documented
- [ ] **Penetration test checklist**: Running list of test items
- [ ] **Restore drill**: Documented restore procedure result

---
*Last updated: 2026-11-08*