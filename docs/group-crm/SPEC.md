````text
# ROLE
You are a senior full-stack engineer extending an existing, working codebase: Atomic CRM
(marmelab/atomic-crm, MIT; React 19, Vite, shadcn-admin-kit/ra-core, Supabase).
You are turning it into "Group CRM": one secure workspace shared by three UAE companies.
Do not rebuild from scratch. Do not rewrite things that already work.

# PRODUCT
Group CRM serves three operating companies under one login system:
- Goldland Contracting LLC: authority approvals, engineering/design, fit-out and modification approvals
- Abbadi Tech Technical Services LLC: electrical, plumbing, technical services
- Casavera Interiors LLC: interior fit-out, construction, renovation

Principle: simple for employees, clear accountability for managers, strict privacy across companies,
measurable outcomes, one source of truth.

# NAMING (read twice)
- In this codebase, `companies` = CUSTOMER organisations. Never repurpose that table.
- The three operating entities are called `tenants` (table `tenants`, column `tenant_id`).
- In UI copy, call a tenant "Company" only in the tenant switcher and admin screens.

# FIRST, AUDIT BEFORE YOU CHANGE ANYTHING (Phase 0)
Earlier stages (through "S7 Realtime") were already completed by a previous session.
1. Read AGENTS.md, CLAUDE.md, MEMORY.md, supabase/schemas/*, supabase/migrations/*,
   src/App.tsx and src/components/atomic-crm/*.
2. Read any stage notes or docs left from earlier stages and list what S1 to S7 actually delivered.
3. Produce `docs/group-crm/00-audit.md`: what exists, what is partially done, what conflicts with this
   spec, and the minimal change list. Stop and show it before Phase 1.
Do not redo completed work. If earlier work conflicts with this spec, say so and propose the smallest fix.

# NON-NEGOTIABLE RULES
1. Isolation is enforced in Postgres RLS, never only in the UI. Every table with business data has
   `tenant_id`, and every RLS policy checks it. Replace ALL existing `using (true)` policies.
2. Schema changes go in `supabase/schemas/` (source of truth), then generate migrations with
   `npx supabase db diff --local -f <name>`. Follow the conventions in AGENTS.md.
3. Views must use `security_invoker = on`. Security-definer functions must set `search_path`
   explicitly and check permissions inside.
4. No secrets in the frontend bundle. Tokens (WhatsApp, Google) live in Supabase Vault or Edge
   Function secrets. The service-role key never reaches the browser.
5. Use only synthetic data in development. No real customer or employee data until security checks pass.
6. Every phase ends with: migrations applied cleanly on a reset database, `make typecheck`,
   `make lint`, `make test` passing, new tests for the phase, and a short `docs/group-crm/NN-phase.md`.
7. Open-source first: reuse Atomic CRM code and existing libraries before writing new code.
   Prefer MIT/Apache-2.0 dependencies. Record every new dependency and its licence.
8. Do not copy code, markup, icons or text from any proprietary product (including Bitrix24).
   Bitrix24 is a behavioural reference only; implement from this spec.
9. Do not invent decisions listed under OPEN DECISIONS. Implement the stated default, make it
   configurable, and flag it in the phase doc.
10. Keep it a modular monolith: one Supabase project, feature folders, no extra services.

# DATA MODEL TARGET
Keep and tenant-scope: contacts, companies (customer orgs), contact_notes, tags, tasks.
Add:
- tenants(id, name, legal_name, domain, branding jsonb, settings jsonb, active)
- tenant_memberships(id, user_id/sales_id, tenant_id, role_id, department, job_title,
  status in ('provisional','active','suspended','ended'), is_temporary bool,
  reviewed_by, reviewed_at, effective_from, effective_to)
- roles(id, key, label, scope_default), permissions(id, entity, action),
  role_permissions(role_id, permission_id, scope in ('own','team','department','tenant','group'))
- leads(id, tenant_id, contact_id, company_id, source, source_meta jsonb, service, project_type,
  location, owner_id, stage, priority, risk_flag jsonb null, next_followup_at, estimated_value,
  lost_reason, junk_reason, normalized_phone, normalized_email, created_by, updated_by, timestamps)
- lead_stage_history, lead_activities (call/meeting/note/message/file), lead_duplicate_candidates
- projects(id, tenant_id, lead_id, customer refs, workflow_template_id, current_stage, owner_id, ...)
  milestones, site_visits, inspection_reports, approvals (Goldland authority submissions/comments)
- workflow_templates(id, tenant_id, service, stages jsonb)  // stages as data, per tenant
- automation_rules(id, tenant_id, trigger, conditions jsonb, actions jsonb)  // small, no visual designer
- conversations, conversation_members, messages, message_links (to lead/project/task)
- channel_accounts(tenant_id, provider, phone_number_id, waba_id, status), wa_conversations,
  wa_messages, wa_templates, wa_consents
- documents(id, tenant_id, drive_file_id, name, mime, linked_type, linked_id, created_by),
  document_access_log
- notifications
- engagement_metrics, monthly_reviews, review_appeals
- audit_logs (append-only; no UPDATE or DELETE for any role; written by trigger/RPC)
Tasks: make contact_id nullable; add tenant_id, lead_id, project_id, creator_id, owner_id, priority,
checklist jsonb, remind_at, escalate_at, source_message_id; add task_comments, task_events.
Every business table: created_by, updated_by, created_at, updated_at, archived_at (soft delete).

# PERMISSIONS
Model access as entity x action x scope (scope: own, team, department, tenant, group).
RLS helpers in schema `private`:
- private.is_member(tenant_id)            -> active membership only
- private.can(tenant_id, 'leads', 'read') -> checks role_permissions and scope
- private.require_aal2()                  -> privileged roles must have MFA (aal2) in JWT
Do not depend on an "active tenant" claim in the JWT for security. RLS allows any tenant the user
belongs to. The UI tenant switcher is only a filter.
Provisional memberships get no access until reviewed, except what Group IT/Admin grants explicitly.
IT/system admin can manage users and see system health but must NOT automatically read business
content (finance, HR, contracts, customer data).

Default role matrix to implement (OPEN DECISION 1, make it editable data, not code):
- MD/Operations: all tenant data in their tenants; approve access; see all reports
- Sales: own and team leads/tasks; create projects from won leads; no finance, no HR
- Site Engineer / Site Inspection Engineer: assigned leads/projects, site visits, inspection reports
- Draftsman/Designer and Approval Submission Consultant: assigned projects, approvals, documents
- Marketing/Lead Generation: create/read leads and sources; no deal value or project detail
- Group Accountant: finance fields and quotation values; no HR files
- HR: HR documents and engagement records; no customer or finance data
- Admin: user lifecycle, access requests; no business content by default
- Group IT: system admin only (see above)
Seed the user directory from the proposal's section 3 table. Mark Rabeeh, Abrar, Navas, Rasiba, Asma
as provisional where the document flags them. Do not seed real email addresses or phone numbers.

# PHASES (do them in order; stop for review after each)

## Phase 1. Foundation: tenants, memberships, roles, audit, RLS rewrite
- tenants, memberships, roles, permissions, helpers, audit_logs.
- Add tenant_id to existing tables and backfill to a default tenant.
- Rewrite every RLS policy (tables, storage.objects, views). Make storage paths tenant-prefixed.
- Tenant switcher in the header (filter only). Admin screens for users, memberships, roles.
- Access revocation: ending a membership or disabling a person revokes access immediately
  (disable the profile and ban the auth user; sessions stop working).
- MFA: TOTP enrolment; privileged roles enforced via aal2.
Exit test: a cross-tenant isolation test suite (SQL or pgTAP) proving user A in Goldland cannot
select, insert, update or delete anything in Abbadi or Casavera, through tables, views, RPCs,
storage and Realtime. A shared user sees exactly the union of their active memberships.

## Phase 2. Leads
- Stages: NEW, INITIATED, UNDER FOLLOW-UP, WARM, HOT, COLD, JUNK, WON/CONVERTED, LOST.
- HIGH RISK is a separate flag with risk type, owner, mitigation (not a stage).
- Required on every lead: unique ID, tenant, contact, source, service, project type, location, owner,
  stage, priority, next follow-up, estimated value, notes, activity history.
- Rules: open lead must have owner and next follow-up; JUNK, LOST and COLD require a reason;
  HOT notifies the manager; stage changes write lead_stage_history and audit_logs.
- Dedup: normalise phone (E.164, default region AE, use libphonenumber-js) and email (lowercase,
  trimmed). Unique candidates check on create. A suspected duplicate goes to a review queue; a
  person decides merge, link, or keep separate. Never auto-merge.
- UI: reuse the Deals Kanban components for the lead pipeline; add list, filters, overdue view.
- Intake: manual, CSV import (reuse dataImport), website form endpoint, Meta lead webhook.
  Endpoints are authenticated (signed secret per tenant), idempotent, rate-limited; retain source,
  campaign and form metadata.
- Hide the existing Deals menu in v1 (OPEN DECISION 3).
Exit test: sales team can run daily lead work; duplicate and overdue behaviour verified.

## Phase 3. Tasks and internal communication
- Extended tasks (see data model), reminders and escalation via scheduled jobs.
- Conversations: DMs, channels per tenant/department, mentions, replies, attachments, search.
- Convert a message to a task; link any message to a lead or project.
- Realtime over RLS-protected tables; unread counts; notifications table (in-app first; email/push optional).
Exit test: non-members cannot read or subscribe to a channel; message-to-task round-trips.

## Phase 4. WhatsApp and Google Drive
WhatsApp (official Meta Cloud API only):
- Edge Function webhook: verify X-Hub-Signature-256, dedupe by message id, respond fast and process
  asynchronously. Route by phone_number_id to the owning tenant via channel_accounts.
- Inbox UI: conversation list, assignment to an authorised owner, inbound/outbound text and media,
  link or create a lead from a conversation, full audit trail.
- Enforce the 24-hour customer-service window; outside it, only approved templates.
- Store opt-in/consent records; no sending without consent state.
- Build and test against Meta's test number. Go-live is blocked until OPEN DECISION 7 is resolved.
Google Drive:
- CRM stores Drive file IDs and metadata only; Drive remains the file store.
- Shared Drives per tenant; server-side permission check in an Edge Function before returning a link;
  log opens, uploads, downloads and sharing changes in document_access_log and audit_logs.
- Least privilege on the Google service account.
Exit test: a message to Company A's number never appears for Company B; a document link is refused
for a user without access.

## Phase 5. Projects and reporting
- Convert WON lead to project through one RPC (transactional): creates or links customer, copies
  lead history reference, applies the tenant's workflow template, writes audit.
- Workflows (as workflow_templates data):
  Goldland: authority/developer identification, requirements and drawings, submission, authority
  comments, revisions, inspection coordination, approval/closure.
  Abbadi Tech: enquiry, site visit, scope, quotation, work assignment, execution, site report,
  completion/invoice.
  Casavera: enquiry, site visit/brief, concept and design, BOQ/quotation, client approval, project
  execution, progress/variations, handover.
- Milestones, site visits, inspection reports, approvals, progress updates, handover.
- Reports (security-invoker views or RPCs, filterable by company, department, period, owner):
  lead conversion, source performance, salesperson pipeline, task completion, overdue work,
  project status, revenue/quotation summary.
- Dashboard: company filter, group overview, assigned work, pipeline, overdue follow-ups, pending
  tasks, project/approval status.

## Phase 6. Engagement and contribution (build last, build carefully)
Purpose: recognise reliable, high-quality work. Not surveillance.
- Never collect clicks, keystrokes, screenshots, message volume, time online, private chats, or
  sentiment. Count completed, verified work and quality.
- Default weights (configurable per role family): Quality 35, Task delivery 25, Collaboration 15,
  Reliability 15, Learning 10. Attendance input off by default (OPEN DECISION 9 / s.13).
- Compare only within a role family. Monthly period. Normalise for approved leave and onboarding.
- Flow: system prepares shortlist and evidence summary -> department manager reviews -> HR checks
  consistency -> authorised management approves. Employees see their own score and evidence and
  can appeal. AI may summarise evidence or flag anomalies but must never decide an award.
- Access limited to HR and management. Define retention.

## Phase 7. AI assistance (optional, after everything above is stable)
Reuse the existing MCP pattern that runs queries inside the caller's RLS context. AI sees only what
the signed-in user can see. Add tests that prove AI queries cannot return another tenant's rows.

## Phase 8. Hardening and release
- Security review against section 7 of the requirements; threat model in docs.
- Run an exposure check on the production build (source maps, keys, unintended endpoints). The
  `rea audit-release-exposure` command from morluto/rea can be used on OUR OWN staging build.
- Backups with a tested restore; staging and production; versioned migrations; rollback plan.
- Run the acceptance checklist (section 12 of the requirements) and record pass/fail.
- Pilot: Goldland Sales plus a small operations group.

# TESTING
- RLS isolation matrix as an automated suite (every table x select/insert/update/delete x each role).
- Unit tests for rules (stage transitions, dedup, scoring) and Edge Function handlers (signature
  verification, idempotency, routing).
- Playwright e2e for: login, tenant switch, create lead, duplicate flow, convert to project, task
  creation, restricted-document refusal.

# HOW TO REPORT AFTER EACH PHASE
1. What changed (files, migrations).
2. How to run and verify it.
3. Tests added and results.
4. Deviations from this spec and why.
5. Open decisions you hit and the default you used.
Then stop and wait for approval.

# OPEN DECISIONS (implement defaults, keep configurable, flag)
1. Permission matrix (default above).
2. WARM/HOT/COLD as stages (default, as written in the requirements) or a separate temperature field.
3. Deals hidden in v1; revisit for quotations.
4. Casavera domain and branding: placeholder.
5. Navas, Rasiba, Asma assignments: provisional.
6. Hosting region: no personal data in production until decided.
7. WhatsApp go-live: blocked on WABA ownership, numbers, templates.
8. Drive structure: one Shared Drive per tenant (default).
9. Engagement policy, targets, appeals: configurable; attendance off.
10. Quotations, invoicing, attendance, payroll: out of scope.
````