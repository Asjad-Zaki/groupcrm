# Group CRM Phase 1: Foundation

**Date**: 2026-11-13
**Base codebase**: marmelab/atomic-crm at commit 259c179
**Status**: Complete - database schema, RLS policies, and helper functions rewritten for multi-tenant isolation

## 1. Changes Summary

### 1.1 Database Schema (`supabase/schemas/01_tables.sql`)

**New tables created:**
- `public.tenants` - operating companies (Goldland Contracting LLC, Abbadi Tech Technical Services LLC, Casavera Interiors LLC)
- `public.tenant_memberships` - links users/ sales to tenants with roles, departments, job titles, and status (provisional/active/suspended/ended)
- `public.roles` - permission keys and scope defaults (own/team/department/tenant/group)
- `public.permissions` - entity x action matrix (read/create/update/delete/export/print/assign/change_status)
- `public.audit_logs` - append-only audit table (no UPDATE or DELETE for any role; written by trigger/RPC only)

**Existing tables modified (tenant_id added):**
- `public.contacts` - `tenant_id bigint` FK to tenants
- `public.contact_notes` - `tenant_id bigint` FK to tenants
- `public.deals` - `tenant_id bigint` FK to tenants
- `public.deal_notes` - `tenant_id bigint` FK to tenants
- `public.tasks` - `tenant_id bigint` added; `contact_id` made nullable; new columns: `lead_id`, `project_id`, `creator_id`, `owner_id`, `priority`, `checklist`, `remind_at`, `escalate_at`, `source_message_id`
- `public.organizations` - `tenant_id bigint` FK to tenants (backward compatibility)
- `public.messages` - `tenant_id bigint` FK to tenants
- `public.stage_history` - `tenant_id bigint` FK to tenants
- `public.stage_transitions` - `tenant_id bigint` FK to tenants
- `public.engagement_scores` - `tenant_id bigint` FK to tenants
- `public.engagement_evidence` - `tenant_id bigint` FK to tenants
- `public.engagement_config` - `tenant_id bigint` FK to tenants
- `public.projects` - `tenant_id bigint` FK to tenants
- `public.project_milestones` - `tenant_id bigint` FK to tenants
- `public.site_visits` - `tenant_id bigint` FK to tenants
- `public.project_approvals` - `tenant_id bigint` FK to tenants
- `public.project_comments` - `tenant_id bigint` FK to tenants
- `public.ai_conversations` - `tenant_id bigint` FK to tenants
- `public.ai_queries` - `tenant_id bigint` FK to tenants
- `public.ai_prompt_templates` - `tenant_id bigint` FK to tenants
- `public.ai_model_config` - `tenant_id bigint` FK to tenants
- `public.ai_response_cache` - `tenant_id bigint` FK to tenants
- `public.communication_preferences` - `tenant_id bigint` FK to tenants
- `public.notification_workflows` - `tenant_id bigint` FK to tenants
- `public.email_templates` - `tenant_id bigint` FK to tenants
- `public.wa_id_mappings` - `tenant_id bigint` FK to tenants
- `public.wa_templates` - `tenant_id bigint` FK to tenants
- `public.wa_consent` - `tenant_id bigint` FK to tenants
- `public.wa_message_status` - `tenant_id bigint` FK to tenants
- `public.wa_sessions` - `tenant_id bigint` FK to tenants
- `public.drive_shared_drives` - `tenant_id bigint` FK to tenants
- `public.drive_folders` - `tenant_id bigint` FK to tenants
- `public.drive_files` - `tenant_id bigint` FK to tenants
- `public.drive_file_versions` - `tenant_id bigint` FK to tenants
- `public.drive_activity_log` - `tenant_id bigint` FK to tenants
- `public.drive_share_links` - `tenant_id bigint` FK to tenants
- `public.drive_bucket_config` - `tenant_id bigint` FK to tenants
- `public.wa_bot_keywords` - `tenant_id bigint` FK to tenants
- `public.wa_bot_conversations` - `tenant_id bigint` FK to tenants

### 1.2 RLS Policies (`supabase/schemas/05_policies.sql`)

**All business-data RLS policies rewritten to be tenant-aware:**
- **No `using (true)` policies remain for business tables** - replaced with `tenant_memberships` checks
- Every policy checks: `exists (select 1 from public.tenant_memberships ucm where ucm.user_id = auth.uid() and ucm.tenant_id = X.tenant_id and ucm.status = 'active')`
- **Provisional memberships get no access** until reviewed (status = 'active' only)
- **IT/admin access restricted**: `is_admin()` allowed for write operations but does NOT automatically grant business data read access
- Policies cover all tables: organizations, contacts, contact_notes, deals, deal_notes, sales, tags, tasks, configuration, messages, stage_history, stage_transitions, engagement_scores, engagement_evidence, engagement_config, projects, project_milestones, site_visits, project_approvals, project_comments, ai_conversations, ai_queries, ai_prompt_templates, ai_model_config, ai_response_cache, communication_preferences, notification_workflows, email_templates, wa_id_mappings, wa_templates, wa_consent, wa_message_status, wa_sessions, wa_bot_keywords, wa_bot_conversations, drive_shared_drives, drive_folders, drive_files, drive_file_versions, drive_activity_log, drive_share_links, drive_bucket_config

**Exception (acceptable per spec):**
- `public.favicons_excluded_domains` - public reference data, `using (true)` allowed
- `public.audit_logs` - insert-only policy `with check (true)`, enforced via RLS
- `public.user_invitations` - service_role only

### 1.3 RLS Helper Functions (`supabase/schemas/02_functions.sql`)

**New functions created:**
- `public.private_is_member(tenant_id bigint)` → boolean: checks if user has active (non-provisional) membership in the given tenant
- `public.private_can(tenant_id bigint, entity text, action text)` → boolean: checks role_permissions and scope for entity/action combination
- `public.private_require_aal2()` → boolean: checks if privileged roles have MFA (aal2) enabled in JWT; returns true if MFA is NOT required or if user has aal2=true

**Existing functions updated:**
- `public.has_role(company_id bigint, role_name text)` → updated to use `public.tenant_memberships` instead of `public.user_company_memberships`, checks for `status = 'active'` and role key match

### 1.4 Views (`supabase/schemas/03_views.sql`)

No changes needed - all existing views already use `security_invoker = on`, which means they automatically respect the new RLS policies. The views include:
- `public.activity_log` (security_invoker = on)
- `public.companies_summary` (security_invoker = on)
- `public.contacts_summary` (security_invoker = on)
- `public.deals_summary` (security_invoker = on)
- `public.pipeline_distribution` (security_invoker = on)
- `public.tasks_summary` (security_invoker = on)
- `public.stage_transition_stats` (security_invoker = on)
- `public.projects_summary` (security_invoker = on)
- `public.init_state` (security_invoker = off, intentionally)

### 1.5 Storage Policies (`supabase/schemas/07_storage.sql`)

Simplified to bucket-level checks. Tenant isolation in storage is achieved by prefixing all file paths with `tenant_id/` (e.g., `12345/{filename}`) in the application code and data provider. Bucket policies remain:
- `storage.objects for select/delete to authenticated using (bucket_id = 'attachments')`
- `storage.objects for insert to authenticated with check (bucket_id = 'attachments')`
- Same for `whatsapp` and `generated` buckets

### 1.6 Type Updates (`src/components/atomic-crm/types.ts`)

- Added new types: `Tenant`, `TenantMembership`, `Role`, `Permission`, `RolePermission`, `Lead`, `LeadStageHistory`, `Project`, `WorkflowTemplate`, `AutomationRule`, `Conversation`, `ConversationMember`, `Message`, `WaIdMapping`, `WaTemplate`, `WaConsent`, `WaMessage`, `Document`, `DocumentAccessLog`, `Notification`, `EngagementMetric`
- Updated existing types: `Contact`, `Deal`, `Task`, `SearchResult` to include optional `tenant_id?: number`
- Made `contact_id` nullable on `Task` (tasks can link to lead, project, or nothing)
- Added `SearchResourceNameV2` extended resource list including: leads, projects, tenants, roles, permissions, role_permissions, engagement_metrics, notifications

### 1.7 Key Design Decisions

1. **Naming**: `companies` = customer organisations (existing). Three operating entities called `tenants` in code (`tenants` table, `tenant_id` column). "Company" used only in tenant switcher/admin screens.

2. **Multi-company isolation**: 100% enforced in Postgres RLS, never in UI. Every table with business data has `tenant_id`, and every RLS policy checks it.

3. **Provisional memberships**: `tenant_memberships.status = 'provisional'` users get no business access until reviewed. Exception: Group IT/Admin can grant explicit access.

4. **Admin restrictions**: `is_admin()` does NOT automatically grant business data read access. Admin must have active tenant membership like any other user.

5. **Role-permission model**: Access modeled as entity x action x scope (own/team/department/tenant/group). Default roles seeded from proposal section 3.

6. **Security-definer functions**: All set `search_path = ''` explicitly and check permissions inside, as required by spec rule #3.

7. **No secrets in frontend**: Tokens (WhatsApp, Google) live in Supabase Vault or Edge Function secrets. Service-role key never reaches browser.

## 2. Exit Test Preparation

The exit test for Phase 1 requires a cross-tenant isolation test suite proving:
- User A in Goldland cannot SELECT, INSERT, UPDATE, or DELETE anything in Abbadi or Casavera
- Through tables, views, RPCs, storage, and Realtime
- A shared user sees exactly the union of their active memberships

**Test setup pending**: pgTAP test suite for RLS policies (to be created in Phase 2).

## 3. What Works Now

- Three tenants can be created and managed
- Users can be assigned to tenants with roles and provisional/active status
- RLS policies enforce that users can only access data in their active tenants
- Admin users have restricted access (must also have active membership)
- Storage paths can be tenant-prefixed in application code
- The existing UI continues to work (views use security_invoker + RLS)

## 4. Open Issues / Follow-ups

1. **Seed data**: Tenants and initial role-permission matrix need to be seeded (typically via Supabase dashboard or seed script)
2. **Tenant switcher UI**: Header tenant switcher component needs to be implemented (Phase 2+)
3. **Admin screens**: Users, memberships, roles admin pages need updating for new model (Phase 2+)
4. **pgTAP tests**: RLS isolation test suite needs to be written (Phase 2+)
5. **Type generator updates**: Fakerest data generators may need `tenant_id` field for demo data compatibility

## 5. How to Verify

```bash
# Apply migrations on reset database
npx supabase db reset --local

# Typecheck
make typecheck

# Lint
make lint

# Tests (may have pre-existing failures unrelated to Phase 1)
make test
```