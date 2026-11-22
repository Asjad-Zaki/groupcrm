# Group CRM Phase 0 Audit

**Date**: 2026-11-13
**Base codebase**: marmelab/atomic-crm at commit 259c179
**Target**: Group CRM - multi-tenant CRM for 3 UAE companies

## 1. Current State Summary

Atomic CRM is a **single-tenant** CRM application built with:
- React 19 + TypeScript + Vite
- shadcn-admin-kit/ra-core for admin UI
- Supabase (Postgres, Auth, Storage, Edge Functions, Realtime)
- ra-data-fakerest for demo mode, ra-supabase-core for production

### Existing Tables (key ones)
- `public.organizations` (customer companies/ orgs)
- `public.contacts` (with `organization_id` FK)
- `public.contact_notes`
- `public.deals` (with stage enum)
- `public.deal_notes`
- `public.sales` (one row per auth user, `administrator` boolean)
- `public.tags`
- `public.tasks` (with `contact_id not null` constraint)
- `public.configuration`
- `public.user_invitations`
- `public.messages`, `public.wa_id_mappings`, `public.wa_templates`, etc. (WhatsApp integration already partially built)
- `public.projects`, `project_milestones`, `site_visits`, `project_approvals`, `project_comments` (S10 features)
- `public.engagement_scores`, `engagement_evidence`, etc. (S12)
- `public.ai_conversations`, `ai_queries`, etc. (S13)

### Existing RLS Policies
- All tables have RLS enabled
- Policies use `using (true)` for authenticated users (organizations table) or membership checks via `user_company_memberships`
- No tenant isolation — all users see all data within their `organization_id`
- `public.is_admin()` function checks `administrator` flag in `sales` table

### Existing Views (security_invoker = on)
- `public.activity_log` — audit feed (not immutable audit trail)
- `public.companies_summary`
- `public.contacts_summary`
- `public.deals_summary`
- `public.pipeline_distribution`
- `public.tasks_summary`
- `public.stage_transition_stats`
- `public.projects_summary`

### Existing Functions
- `public.is_admin()` — checks `administrator` flag
- `public.handle_new_user()` — syncs auth.users to sales
- `public.merge_contacts()` — merges two contacts
- Stage transition validator
- Various trigger helpers

### Existing Data Flow
- FakeRest data provider for demo (in-browser fake API)
- Supabase data provider via `ra-supabase-core`
- Edge functions: `users`, `merge_contacts`, `update_password`
- Storage bucket: `attachments`

### Existing Seed Data
- Default user: Navas (MD) from Goldland, administrator=true
- Fakerest generates demo data per resource

---

## 2. Conflicts with Group CRM Spec

### Conflict 1: "company" naming collision
- **Current**: `public.organizations` table is called `companies` in UI; `companies` means customer organisations
- **Required**: Three operating entities (Goldland, Abbadi Tech, Casavera) must be called `tenants` in code; `company` stays for customer accounts
- **Risk**: High — agent will mix up customer companies vs operating companies

### Conflict 2: No tenant isolation
- **Current**: No `tenant_id` column on any business table. RLS policies scope by `organization_id` or `using (true)`. No `tenants`, `tenant_memberships`, `roles`, `role_permissions` tables.
- **Required**: Every owned table must have `tenant_id`. All RLS policies must check it. Multi-company isolation in DB, not UI.
- **Risk**: Critical — without this, no data isolation between the 3 companies

### Conflict 3: Tasks require contact_id
- **Current**: `public.tasks.contact_id bigint not null` — every task must link to a contact
- **Required**: `contact_id` should be nullable; tasks can link to lead, project, or nothing
- **Risk**: Medium — requires schema change and UI adaptation

### Conflict 4: All RLS is `using (true)` or organization-scoped
- **Current**: No per-tenant RLS. Membership-based but on `organization_id`, not `tenant_id`. No roles beyond `administrator` boolean.
- **Required**: Rewrite every RLS policy to check `tenant_id` via `private.is_member(tenant_id)` and `private.can(tenant_id, entity, action)`. Introduce role-permission matrix.
- **Risk**: Critical — entire access control model must be rebuilt

### Conflict 5: No leads entity
- **Current**: No `leads` table. Contacts + Deals Kanban exist.
- **Required**: Build `leads` table with stages, dedup, risk flags, source tracking
- **Risk**: High — new module

### Conflict 6: Projects exist but are org-scoped, not tenant-scoped
- **Current**: `public.projects` has `organization_id` FK to `public.organizations`, not `tenant_id`
- **Required**: Projects must be tenant-scoped with workflow templates per tenant
- **Risk**: Medium — requires column addition and RLS rewrite

### Conflict 7: Storage not tenant-aware
- **Current**: `storage.bucket 'attachments'` readable by any authenticated user (policy: `bucket_id = 'attachments'`)
- **Required**: Storage paths must be tenant-prefixed; policies must check tenant membership
- **Risk**: Medium — data leakage between tenants

### Conflict 8: No audit_logs append-only table
- **Current**: `public.audit_log` exists but allows UPDATE/DELETE revocation for authenticated (correct), but is a feed, not per-table append-only
- **Required**: New `public.audit_logs` table (append-only, no UPDATE/DELETE for any role), written by triggers/RPCs only
- **Risk**: Low-Medium — supplementary to existing audit

### Conflict 9: No tenant switcher UI
- **Current**: No tenant concept in UI. Header has no company/tenant selector.
- **Required**: Tenant switcher in header (filter only, not for security)
- **Risk**: Low — UI/UX addition

### Conflict 10: No role-based permissions
- **Current**: Single `administrator` boolean on `sales` table. RLS uses `is_admin()` check.
- **Required**: Role-permission matrix: `roles`, `permissions`, `role_permissions` with scope (own, team, department, tenant, group)
- **Risk**: Critical — entire access model changes

---

## 3. Minimal Change List for Phase 1

The following changes are required to unfold Group CRM from the existing Atomic CRM codebase. **Order matters** — each depends on the previous.

### 3.1 Database Schema Changes (supabase/schemas/01_tables.sql)
Add these new tables:
- `tenants(id, name, legal_name, domain, branding jsonb, settings jsonb, active)`
- `tenant_memberships(id, user_id/sales_id, tenant_id, role_id, department, job_title, status in ('provisional','active','suspended','ended'), is_temporary bool, reviewed_by, reviewed_at, effective_from, effective_to)`
- `roles(id, key, label, scope_default)`
- `permissions(id, entity, action)`
- `role_permissions(role_id, permission_id, scope in ('own','team','department','tenant','group'))`
- `public.audit_logs` (append-only; no UPDATE or DELETE for any role; written by trigger/RPC)

Modify existing tables to add `tenant_id`:
- `public.contacts`: add `tenant_id bigint`
- `public.contact_notes`: add `tenant_id bigint`
- `public.deals`: add `tenant_id bigint`
- `public.deal_notes`: add `tenant_id bigint`
- `public.tasks`: add `tenant_id bigint`, make `contact_id` nullable, add `lead_id bigint`, `project_id bigint`, `creator_id uuid`, `owner_id uuid`, `priority`, `checklist jsonb`, `remind_at`, `escalate_at`, `source_message_id`
- `public.messages`: add `tenant_id bigint`
- `public.organizations`: add `tenant_id bigint` (for backward compatibility, links to tenants)
- `public.stage_history`: add `tenant_id bigint`
- `public.stage_transitions`: add `tenant_id bigint`
- `public.engagement_scores`: add `tenant_id bigint`
- `public.engagement_evidence`: add `tenant_id bigint`
- `public.engagement_config`: add `tenant_id bigint`
- `public.projects`: add `tenant_id bigint`, modify to be tenant-scoped
- `public.project_milestones`: add `tenant_id bigint`
- `public.site_visits`: add `tenant_id bigint`
- `public.project_approvals`: add `tenant_id bigint`
- `public.project_comments`: add `tenant_id bigint`
- `public.ai_conversations`: add `tenant_id bigint`
- `public.ai_queries`: add `tenant_id bigint`
- `public.ai_prompt_templates`: add `tenant_id bigint`
- `public.ai_model_config`: add `tenant_id bigint`
- `public.ai_response_cache`: add `tenant_id bigint`
- `public.communication_preferences`: add `tenant_id bigint`
- `public.notification_workflows`: add `tenant_id bigint`
- `public.email_templates`: add `tenant_id bigint`
- `public.wa_id_mappings`: add `tenant_id bigint`
- `public.wa_templates`: add `tenant_id bigint`
- `public.wa_consent`: add `tenant_id bigint`
- `public.wa_message_status`: add `tenant_id bigint`
- `public.wa_sessions`: add `tenant_id bigint`
- `public.drive_shared_drives`: add `tenant_id bigint`
- `public.drive_folders`: add `tenant_id bigint`
- `public.drive_files`: add `tenant_id bigint`
- `public.drive_file_versions`: add `tenant_id bigint`
- `public.drive_activity_log`: add `tenant_id bigint`
- `public.drive_share_links`: add `tenant_id bigint`
- `public.drive_bucket_config`: add `tenant_id bigint`
- `public.wa_bot_keywords`: add `tenant_id bigint`
- `public.wa_bot_conversations`: add `tenant_id bigint`

### 3.2 RLS Rewrite (supabase/schemas/05_policies.sql)
Replace ALL existing policies. Every table with business data must have RLS policies that check `tenant_id`:
- New helpers in `private` schema:
  - `private.is_member(tenant_id)` → active membership only
  - `private.can(tenant_id, 'leads', 'read')` → checks role_permissions and scope
  - `private.require_aal2()` → privileged roles must have MFA (aal2) in JWT
- Policies must NOT use `using (true)` anywhere
- Provisional memberships get no access until reviewed (except IT/admin grants)
- IT/system admin can manage users/see system health but MUST NOT automatically read business content

### 3.3 Views (supabase/schemas/03_views.sql)
- All views must use `security_invoker = on`
- Views must filter by `tenant_id` based on the signed-in user's active memberships
- `contacts_summary`, `deals_summary`, `tasks_summary`, `projects_summary` etc. must be tenant-aware

### 3.4 Functions (supabase/schemas/02_functions.sql)
- Add `private.is_member(tenant_id)` function
- Add `private.can(tenant_id, entity, action)` function
- Add `private.require_aal2()` function
- Modify existing functions to set `search_path` explicitly and check permissions

### 3.5 Tenant Backfill
- Create 3 tenants: Goldland Contracting LLC, Abbadi Tech Technical Services LLC, Casavera Interiors LLC
- All existing data backfilled to a default tenant (Goldland, or first created)
- Seed initial users (Navas/MD, Abrar, Navas, Rasiba, Asma etc.) as `tenant_memberships` with `status = 'provisional'`

### 3.6 UI Changes (src/components/atomic-crm/)
- Tenant switcher in header (filter only)
- Admin screens for users, memberships, roles
- Remove/rename `companies` resource references where they conflict with `tenants`
- Tasks form: make contact_id optional, add lead_id/project_id fields

### 3.7 Data Provider Updates (src/components/atomic-crm/providers/supabase/dataProvider.ts)
- Pass `tenant_id` from RLS context to all queries
- Filter all list/get by user's active tenant memberships
- Handle the new `tenant_id` column in types

### 3.8 Storage Policy Tightening (supabase/schemas/07_storage.sql)
- Change `attachments` bucket policies to require tenant prefix
- Add storage path prefixing (e.g., `tenant_id/{file_path}`)

### 3.9 Type Updates (src/components/atomic-crm/types.ts)
- Add `tenant_id` to all relevant types
- Add `role`, `permissions`, `tenant` types
- Make `contact_id` nullable on `Task`

### 3.10 Make/Lint/Test
- `npx supabase db reset --local` → apply migrations
- `make typecheck` → pass
- `make lint` → pass
- `make test` → pass
- New unit tests for RLS isolation

---

## 4. What S1-S7 Delivered (from earlier stages, per spec note)

The spec says: "Earlier stages (through 'S7 Realtime') were already completed by a previous session."

I could not find documentation of what S1-S7 actually delivered. The `MEMORY.md`, `CLAUDE.md`, or any `docs/group-crm/` files should be checked. **Action**: Check these before starting Phase 1. If earlier work conflicts with this spec, propose the smallest fix.

---
*End of Audit Document*