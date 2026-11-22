# S0: Map the Base (Read-Only)

## Overview

This document maps the current Atomic CRM base fork, documenting the data model, RLS policies, auth flow, edge functions, and hook points. This is a read-only snapshot for the S0 step — no code changes are made.

---

## Data Model (supabase/schemas/01_tables.sql)

| Table | Key Columns | Notes |
|---|---|---|
| `companies` | `id`, `name`, `sector`, `size`, `linkedin_url`, `website`, `phone_number`, `address`, `zipcode`, `city`, `state_abbr`, `sales_id`, `context_links`, `country`, `description`, `revenue`, `tax_identifier`, `logo` | CRM companies |
| `contacts` | `id`, `first_name`, `last_name`, `gender`, `title`, `background`, `avatar`, `first_seen`, `last_seen`, `has_newsletter`, `status`, `tags`, `company_id`, `sales_id`, `linkedin_url`, `email_jsonb`, `phone_jsonb` | Belongs to a company via `company_id` |
| `contact_notes` | `id`, `contact_id`, `text`, `date`, `sales_id`, `status`, `attachments` | Linked to contact and sales user |
| `deals` | `id`, `name`, `company_id`, `contact_ids`, `categories`, `stage`, `description`, `amount`, `created_at`, `updated_at`, `archived_at`, `expected_closing_date`, `sales_id`, `index` | Kanban deals, multi-contact |
| `deal_notes` | `id`, `deal_id`, `type`, `text`, `date`, `sales_id`, `attachments` | Linked to deal |
| `sales` | `id`, `first_name`, `last_name`, `email`, `administrator`, `user_id`, `disabled`, `secondary_emails` | One row per user; `user_id` -> `auth.users(id)` |
| `tags` | `id`, `name`, `color` | Shared across contacts/deals |
| `tasks` | `id`, `contact_id`, `type`, `text`, `due_date`, `done_date`, `sales_id`, `created_at` | Linked to contact and sales user |
| `configuration` | `id`, `config` | Singleton table for app config |
| `favicons_excluded_domains` | `id`, `domain` | Favicon exclusion list |
| `user_invitations` | `user_id` | Links auth users to invitation tracking |

**Foreign Keys:**
- `companies.sales_id` → `sales.id`
- `contacts.company_id` → `companies.id` (cascade)
- `contacts.sales_id` → `sales.id`
- `contact_notes.contact_id` → `contacts.id` (cascade)
- `contact_notes.sales_id` → `sales.id`
- `deals.company_id` → `companies.id` (cascade)
- `deals.sales_id` → `sales.id`
- `deal_notes.deal_id` → `deals.id` (cascade)
- `deal_notes.sales_id` → `sales.id`
- `tasks.contact_id` → `contacts.id` (cascade)
- `sales.user_id` → `auth.users(id)`

---

## RLS Policies (supabase/schemas/05_policies.sql)

**All current policies use `using (true)` / `with check (true)` — no company membership checks.**

| Table | Policy Name | Operation | Using/Check |
|---|---|---|---|
| `companies` | Enable read access for authenticated users | select | `using (true)` |
| `companies` | Enable insert for authenticated users only | insert | `with check (true)` |
| `companies` | Enable update for authenticated users only | update | `using (true) with check (true)` |
| `companies` | Company Delete Policy | delete | `using (true)` |
| `contacts` | Enable read access for authenticated users | select | `using (true)` |
| `contacts` | Enable insert for authenticated users only | insert | `with check (true)` |
| `contacts` | Enable update for authenticated users only | update | `using (true) with check (true)` |
| `contacts` | Contact Delete Policy | delete | `using (true)` |
| `contact_notes` | Enable read access for authenticated users | select | `using (true)` |
| `contact_notes` | Enable insert for authenticated users only | insert | `with check (true)` |
| `contact_notes` | Contact Notes Update policy | update | `using (true)` |
| `contact_notes` | Contact Notes Delete Policy | delete | `using (true)` |
| `deals` | Enable read access for authenticated users | select | `using (true)` |
| `deals` | Enable insert for authenticated users only | insert | `with check (true)` |
| `deals` | Enable update for authenticated users only | update | `using (true) with check (true)` |
| `deals` | Deals Delete Policy | delete | `using (true)` |
| `deal_notes` | Enable read access for authenticated users | select | `using (true)` |
| `deal_notes` | Enable insert for authenticated users only | insert | `with check (true)` |
| `deal_notes` | Deal Notes Update Policy | update | `using (true)` |
| `deal_notes` | Deal Notes Delete Policy | delete | `using (true)` |
| `sales` | Enable read access for authenticated users | select | `using (true)` |
| `tags` | Enable read access for authenticated users | select | `using (true)` |
| `tags` | Enable insert for authenticated users only | insert | `with check (true)` |
| `tags` | Enable update for authenticated users only | update | `using (true)` |
| `tags` | Enable delete for authenticated users only | delete | `using (true)` |
| `tasks` | Enable read access for authenticated users | select | `using (true)` |
| `tasks` | Enable insert for authenticated users only | insert | `with check (true)` |
| `tasks` | Task Update Policy | update | `using (true)` |
| `tasks` | Task Delete Policy | delete | `using (true)` |
| `configuration` | Enable read for authenticated | select | `using (true)` |
| `configuration` | Enable insert for admins | insert | `with check (public.is_admin())` |
| `configuration` | Enable update for admins | update | `using (public.is_admin()) with check (public.is_admin())` |
| `favicons_excluded_domains` | Enable access for authenticated users only | select | `using (true) with check (true)` |

**Key Function: `public.is_admin()`** (`supabase/schemas/02_functions.sql:284`)
- `SECURITY DEFINER`, `SET search_path TO ''`
- Checks `exists (select 1 from public.sales where user_id = auth.uid() and administrator = true)`
- Used in configuration RLS policies to restrict inserts/updates to admins only

---

## Auth Flow

1. **Google Workspace / SSO** — Users sign in via Google (configured in Supabase auth). On `auth.users` insert, trigger `handle_new_user()` creates a row in `public.sales` with `administrator = false` by default.
2. **Sales table** — Every authenticated user gets exactly one `sales` row (unique index on `user_id`). The `sales_id` on other tables is populated by the `set_sales_id_default()` trigger.
3. **`is_admin()`** — Determines if a user has administrative privileges based on the `administrator` flag in `sales`.
4. **No company-level auth** — Currently, all authenticated users can read/write all rows across all companies. There is no `company_id`-based RLS filtering.

---

## Edge Functions (supabase/functions/)

| Function | Purpose |
|---|---|
| `delete_note_attachments` | Cleanup storage attachments when contact/deal notes are updated/deleted |
| `mcp` | Multi-channel processor (AI/automation) |
| `postmark` | Email sending via Postmark |
| `update_password` | Password update handler |
| `users` | User management endpoint |
| `_shared` | Shared utilities |

---

## Hook Points (modules that can be extended)

| Area | Current Hook | What S1–S15 will modify |
|---|---|---|
| **Company membership** | No `company_id` on business tables; no RLS by company | Add `company_id` (or group scope) to all business tables; rewrite RLS policies |
| **User onboarding** | `handle_new_user()` creates sales row | Add role/company membership logic; `user_company_memberships` table |
| **Task auto-assign** | `set_sales_id_default()` trigger | Scope by company membership |
| **Avatar/favicon** | `handle_company_saved()`, `handle_contact_saved()` | May need company-aware favicon logic |
| **Contact merging** | `merge_contacts()` function | Add company validation — prevent cross-company merges without approval |
| **Activity log** | `activity_log` view (security_invoker = on) | Expand with company filtering; keep security_invoker = true |
| **Configuration** | `is_admin()` + RLS policies | Replace with role-based access control |
| **Storage** | Bucket policies for `attachments` | Audit all access; tie to company membership |

---

## Migration Plan & Risks

| Phase | Actions | Risks |
|---|---|---|
| **S1 (Company model)** | Rename `companies` → `organizations`; create `organizations`, `departments`, `roles`, `role_permissions`, `user_company_memberships`; migrate existing company data as `Goldland Contracting`, `Abbadi Tech`, `Casavera Interiors`; add `auth_company_ids()` and `has_role(company_id, role)` functions (SECURITY DEFINER, empty search_path); seed synthetic users; update all code referencing `companies` table to `organizations`; update RLS policies; update views; update exports/imports; update FakeRest data generators. | Renaming `companies` is a breaking change — all foreign keys, code, and queries must be updated. Risk of data loss if migration not applied atomically. |
| **S2 (RLS rewrite)** | Add `company_id` to every business table; rewrite every policy to require membership; make temporary memberships inert until approved; add break-glass admin access with reason, time-box, alert, audit; create insert-only `audit_log` with triggers; pgTAP tests for cross-company isolation. | Existing `using (true)` policies will break access for all users — must carefully migrate one table at a time. Audit log triggers must not cause circular dependencies. |
| **S3 (Login & admin UI)** | Google Workspace domain restriction + allowlist table; disable signups; short sessions; company switcher; admin screens for users/memberships/roles/temp-role approvals/access review; audit viewer. | Domain restrict may block legitimate users if allowlist is misconfigured. Company switcher must enforce RLS on every table view. |
| **S4 (Security gates in CI)** | GitHub Actions: lint, typecheck, unit tests, pgTAP tests, gitleaks, OSV-Scanner, Semgrep, check for public tables with RLS off, views without security_invoker, migration dry-run. | New CI checks may fail on existing code until S1–S2 are complete. |
| **S5–S15** | Incremental features (leads, tasks, WhatsApp, Drive, Projects, dashboards, AI, hardening). | Each step depends on prior RLS and company model being correct. Delay in one step blocks downstream. |

---

## Summary of Changes Needed (S1–S15)

1. **Rename `companies` → `organizations`** and create separate company records for Goldland Contracting, Abbadi Tech, Casavera Interiors.
2. **Add `company_id`** to `contacts`, `deals`, `tasks`, `contact_notes`, `deal_notes` (or use explicit group scope).
3. **Create tables:** `departments`, `roles`, `role_permissions`, `user_company_memberships`.
4. **Helper functions:** `auth_company_ids()` (returns set of company IDs the user memberships), `has_role(company_id, role)` (SECURITY DEFINER, checks role membership).
5. **Rewrite RLS:** Every policy must `USING` and `CHECK` that the calling user has a membership row with `status = 'approved'` (or `is_temporary` valid) for the relevant `company_id`.
6. **Create `audit_log`** insert-only table with triggers for edits, stage changes, deletions, permission changes.
7. **Set `security_invoker = true`** on all new views; ensure existing views already have it.
8. **Break-glass admin** access: IT admin can bypass RLS with a time-boxed, reason-required, audited mechanism.
9. **Replace `is_admin()`** with role-based access using the new tables.
10. **Update all frontend code** (`src/components/atomic-crm/`) to use new company-aware data fetching.
11. **Update edge functions** and storage policies for company scoping.
12. **Update CSV samples** and import/export functions.
13. **If using FakeRest**, update data generators.

---

*S0 complete: base mapped. Next step S1 will begin the company model overhaul.*