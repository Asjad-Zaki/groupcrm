# Group CRM — Master Build Prompt

Source: `Group CRM — Restructured Build Prompt (v2)`, Section 2. Referenced from `CLAUDE.md`.

### ROLE

You are a principal full-stack engineer and security-minded architect. You are building **Group CRM**: one secure, company-aware workspace for three UAE operating companies — Goldland Contracting LLC (authority approvals, design, fit-out), Abbadi Tech Technical Services LLC (electrical, plumbing, technical services) and Casavera Interiors LLC (interior fit-out, renovation, delivery) — used by about 16 employees, several of whom work across companies.

### OUTCOME

Replace WhatsApp-based coordination and manual lead tracking with one platform for: leads and pipeline, internal communication, tasks, projects, documents, WhatsApp customer inbox, management reporting and fair employee-contribution recognition. Principle: simple for employees, accountable for managers, strict privacy across companies, one source of truth.

### NON-NEGOTIABLE PRINCIPLES

1. **One identity per person.** Access = company memberships × roles × departments × record-level rules. No duplicate accounts.
2. **Authorization is enforced in three layers:** NestJS guards (CASL abilities), the service layer (every query takes an actor context), and **Postgres Row-Level Security** as the backstop. A bug in one layer must not leak another company's data.
3. **Every company-owned row has company\_id; group-wide rows have scope = GROUP explicitly.** No nullable-company ambiguity.
4. **Audit everything sensitive**, append-only: login, record views of sensitive types, edits, stage changes, exports, downloads, permission changes, deletions, break-glass access.
5. **AI inherits the caller's permissions** and never sees another company's data. AI assists; it never makes employment, award or access decisions.
6. **No covert monitoring.** No keystroke, screenshot, click-count, online-time, private-chat or sentiment signals anywhere.
7. **Modular monolith first.** Clear module boundaries and contracts; no microservices.
8. **Open source over reinvention, but licence-checked.** Before adding any dependency, record its licence in docs/adr/. Reject AGPL/SSPL/BUSL libraries linked into our code unless approved. Never use enterprise-licensed directories of OSS projects.
9. **Secure by default:** least privilege, secrets in a manager, no secrets in the repo, dependency and image scanning in CI.
10. **Synthetic data only** until security and data-cleaning checks pass.

### LOCKED TECHNOLOGY DECISIONS

| Layer | Choice | Notes |
| --- | --- | --- |
| Monorepo | pnpm + Turborepo | apps/web, apps/api, apps/worker; packages/db, contracts (Zod schemas shared by API and web), authz, ui |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind + shadcn/ui, TanStack Query/Table, react-hook-form + Zod, TipTap, dnd-kit | Desktop-first, fully responsive, installable PWA with Web Push. i18n-ready (English first, Arabic/RTL later) |
| Backend | NestJS (TypeScript), REST + OpenAPI generated from Zod; WebSocket gateway via Socket.IO | Request-scoped actor context; global validation pipe; rate limiting |
| Database | PostgreSQL 16+ with RLS, pg\_trgm, pgvector (later), full-text search | Timestamps in UTC; business calendars in Asia/Dubai |
| ORM | Prisma for schema and types; **hand-written SQL migrations for RLS policies**; each request runs in a transaction that sets app.user\_id and app.company\_ids via set\_config | Add a lint/test that fails CI if any table with company\_id lacks a policy |
| Auth | Google Workspace OIDC as primary login (inherits Workspace 2-step verification and instant suspension on exit). TOTP (otplib) fallback and enforced MFA for privileged roles. Server-side sessions in Redis, httpOnly secure SameSite cookies | No password storage for Workspace users. If any local password accounts exist, Argon2id |
| Authorization | CASL abilities built per request from memberships, roles and temporary-assignment dates | Policy table in docs/access-matrix.md is the source of truth and is tested |
| Jobs | Redis + BullMQ (worker app) | Webhook processing, reminders, SLA timers, escalations, report snapshots, Drive sync, retries with idempotency keys |
| Files | Google Drive API (Shared Drives); object storage only for transient WhatsApp media and exports | CRM stores fileId, metadata, entity link and ACL |
| Messaging | Meta WhatsApp Cloud API direct, behind a MessagingChannel interface so a provider can be swapped |  |
| Email/notify | In-app, Web Push, transactional email (UAE-region capable provider) | Do not send internal notifications over WhatsApp templates |
| Observability | OpenTelemetry, structured logs (pino) with PII redaction, Sentry-compatible error tracking, uptime checks | Logs and telemetry stay in the UAE region |
| Hosting | AWS me-central-1 or Azure UAE North (final choice after review); managed Postgres with PITR; containers; IaC (Terraform) | Backups, replicas, logs and monitoring in-region; staging and production separated |
| CI/CD | GitHub Actions: lint, typecheck, unit/integration/e2e, SAST, dependency and container scan, migration dry-run, automated rollback plan | Trunk-based with protected main |

If you believe a decision is wrong, write an ADR with evidence and ask before changing it.

### AUTHORIZATION MODEL

- Entities: users, companies, user\_company\_memberships (status, effective\_from/to, **is\_temporary**, review\_by, approved\_by), departments, roles, role\_permissions, record-level grants.
- Temporary assignments (Rabeeh as accountant, Abrar's temp admin/graphic roles, etc.) are **inactive in production until an approver activates them**; show them on an access-review screen with expiry reminders.
- Role catalogue to seed: group\_admin\_it, md\_operations, sales, marketing\_leadgen, draftsman\_designer, approval\_consultant, site\_engineer, accountant, hr, admin, graphic\_designer, plus company-scoped manager roles.
- **IT support (Zaki) administers the platform but has no business-content access by default.** Content access requires break-glass: reason, time-boxed, alerting to MD and HR, fully audited.
- Sensitive domains with stricter policies: finance, salaries, HR files, contracts, management channels, engagement scores. HR and management only.
- Record rules: sales sees own and team leads; marketing sees leads they sourced (no customer financials); site engineers see assigned projects; managers see their department; MD/Operations see their companies; shared designers see only assigned work in each company.
- Company switcher in the UI sets context; a 'Group view' is allowed only for roles with group scope and never merges private company records the user cannot see.
- Tests (must be automated): cross-company isolation per entity, RLS bypass attempts, revoked-membership immediacy, temp-role gating, IT no-content-access, export and download auditing.

### DATA MODEL (core)

companies · users · user\_company\_memberships · departments · roles · permissions · customers · contacts (with channel identities: phone\_e164, email, whatsapp\_wa\_id, whatsapp\_bsuid) · services (per-company catalogue) · leads · lead\_assignments · lead\_activities · lead\_stage\_history · duplicate\_candidates · tasks · task\_templates · task\_comments · task\_events · conversations · messages · message\_links (to lead/project/task) · channel\_accounts · whatsapp\_templates · consent\_records · projects · project\_workflows · milestones · site\_visits · inspection\_reports · approvals · documents · notifications · engagement\_metrics · monthly\_reviews · review\_evidence · review\_appeals · audit\_logs.

Conventions: UUIDv7 keys plus human-readable codes (GL-L-2026-0001); created\_by, updated\_by, timestamps; soft delete or archive; optimistic locking; money as integer minor units with currency (AED default); audit\_logs append-only (insert-only role, hash-chained); all enums defined once in packages/contracts.

### MODULES AND ACCEPTANCE CRITERIA

**Leads.** Stages: NEW, INITIATED, UNDER\_FOLLOW\_UP, WARM, HOT, COLD, JUNK, WON, LOST. HIGH RISK is a separate flag (risk type, owner, mitigation), not a stage. Fields: unique ID, company, customer/contact, source (+campaign and form metadata), selected service(s), project type, location, owner, stage, priority, next follow-up, estimated value, notes, activity history. Rules: owner required within a configurable SLA; next follow-up mandatory in UNDER\_FOLLOW\_UP, WARM and HOT; reason mandatory for COLD, JUNK and LOST; allowed transitions are configuration, not code; WON atomically creates customer (if new), project, Drive folder from template and starter tasks, and keeps lead history. **Dedup:** normalise phone with libphonenumber-js (E.164), lowercase email, also match WhatsApp BSUID, fuzzy match name with pg\_trgm; matches go to a human review queue, never silent merge; merges are audited and reversible. Capture channels: manual, website form endpoint, Meta lead-form webhook, WhatsApp inbound. Acceptance: every open lead has an owner and a next action; overdue follow-ups are visible on dashboards and notified; stage changes are audited.

**Services selection.** Per-company service catalogue (name, category, default workflow template, default task templates, optional price list later). Selecting a service on a lead sets the project workflow and generates stage-triggered tasks.

**Tasks and notifications.** Owner, creator, company, linked lead/project/message, priority, due date, checklist, attachments, comments, reminders, escalation to manager after configurable overdue time. Task templates fire on lead stage changes and project milestones ('tasks for all users according to lead'). Business-hours and UAE work-week calendars are configurable per company for SLA maths.

**Internal communication.** Company and department channels, private channels, DMs, threads, mentions, reactions, file sharing via Drive, Postgres FTS search, read state, Web Push. Every lead, project and task has a comment thread. A message converts to a task with a back-link. Channel membership derives from company memberships and roles; private chats are never used for any scoring. If scope or time pressure threatens this module, stop and propose swapping in Zulip with OIDC login instead of cutting permissions.

**WhatsApp inbox.** Cloud API only. Inbound webhook: verify X-Hub-Signature-256, respond fast, enqueue, process idempotently by message ID, keep raw payload. Route by phone\_number\_id to the company inbox, then to the lead owner or an assignment rule; unmatched senders create a lead (source WhatsApp) after dedup. Track the 24-hour customer-service window: outside it, the composer allows approved templates only. Store opt-in and consent records. Handle statuses (sent, delivered, read, failed) and media (download promptly to transient storage, then attach to Drive). Do not hardcode prices; read them from configuration. Support multiple numbers (one per company), quality-rating and throughput monitoring, template management and per-conversation audit trail. Build for username/BSUID identities from day one.

**Documents (Drive).** Each company has a Shared Drive; each project gets a folder from a template on conversion. CRM stores fileId and metadata. Access check happens in the CRM, then the file is served through an audited proxy or a short-lived link. The CRM never grants broader Drive access than the user's CRM permissions, and sharing changes are logged. Upload and download are audited. HR documents live in a restricted HR-only space.

**Projects and operations.** Company workflow templates: Goldland (authority/developer identification → requirements and drawings → submission → authority comments → revisions → inspection coordination → approval/closure); Abbadi Tech (enquiry → site visit → scope → quotation → work assignment → execution → site report → completion/invoice); Casavera (enquiry → site visit/brief → concept and design → BOQ/quotation → client approval → execution → progress/variations → handover). Milestones, site visits, inspection reports, approvals tracker, progress updates, handover.

**Dashboard and reports.** Company filter and group overview (only if permitted). Widgets: assigned work, pipeline by stage and owner, overdue follow-ups, pending tasks, project and approval status, conversion by source, salesperson pipeline, revenue and quotation summaries. Filters: company, department, period, owner. Every report is a permission-scoped query; no BI tool may bypass RLS.

**Engagement and contribution ('Activity rate').** Monthly, role-family-adjusted score: Quality and outcomes 35%, Task ownership and delivery 25%, Collaboration and service 15%, Reliability 15%, Learning and improvement 10%. Evidence links on every number; normalise for approved leave, part-time and onboarding; compare within job families only. Flow: system builds shortlist and evidence summary → department manager adds context → HR checks consistency → authorised management approves. Employees see their own score and can appeal. AI may summarise evidence or flag anomalies only. Access is HR and management only, with defined retention. Attendance data is included only if lawfully collected and separately approved.

**Admin and HR.** User lifecycle (invite, activate, suspend, exit with immediate session and token revocation and Workspace suspension check), departments, roles, access requests, periodic access review, audit viewer.

**AI assistance (Phase 6, read-only first).** Tool-calling assistant that uses the same service layer and the caller's ability set, so it cannot retrieve what the user cannot open. Embeddings (pgvector) carry company\_id and are filtered by the same RLS. Inference must be in-region or personal data must be redacted before leaving the UAE; prompts and logs stay in-region. Show sources for every answer. No autonomous writes in v1.

### SECURITY AND COMPLIANCE CHECKLIST

OWASP ASVS L2 as the baseline; threat model (STRIDE) per module before coding it; CSRF protection, strict CSP, secure headers; input validation with Zod at every boundary; webhook signature verification and replay protection; rate limiting and brute-force lockout; encryption at rest (managed keys) and in transit (TLS 1.2+); field-level encryption for the most sensitive HR/finance fields; secrets in a secrets manager with rotation; backups with PITR and a **tested restore** each quarter; DR runbook and incident-response plan; UAE PDPL review with a qualified adviser (data inventory, lawful basis, retention, subject rights, breach notification, cross-border transfers, vendor terms); data-path map showing nothing leaves the UAE region unintentionally (logs, backups, telemetry, email, AI).

### NON-FUNCTIONAL TARGETS

p95 API latency under 300 ms for list endpoints at 50 concurrent users; real-time messages under 1 s; webhook acknowledgement under 2 s; 99.5% availability target initially; RPO 15 min and RTO 4 h; WCAG 2.1 AA on core flows; mobile-usable for site staff on slow connections.

### PHASES AND EXIT GATES

- **Phase 0 — Design and spikes.** Deliver ERD, access matrix, OpenAPI skeleton, threat model, ADRs, wireframes. Three spikes: (1) Prisma + RLS + request-scoped transactions, (2) WhatsApp Cloud API sandbox with BSUID payloads, (3) Drive Shared Drive proxy with permission check. *Gate: approved scope, access matrix and passing spikes.*
- **Phase 1 — Foundation.** Monorepo, CI, auth, company switcher, memberships, roles, RLS, audit log, admin screens, base dashboard shell. *Gate: automated cross-company isolation and revocation tests pass.*
- **Phase 2 — Leads and services.** Capture, dedup, assignment, stages, follow-ups, service catalogue, stage-triggered tasks, reports. *Gate: Goldland sales run daily work in it.*
- **Phase 3 — Tasks and collaboration.** Tasks, reminders, escalation, channels, DMs, threads, message-to-task, push. *Gate: teams coordinate without WhatsApp groups.*
- **Phase 4 — WhatsApp and Drive.** Inbox, routing, templates, consent, media, Drive folders and audited access. *Gate: end-to-end integration tests pass on real test numbers.*
- **Phase 5 — Projects and reporting.** Workflows per company, site reports, milestones, management reports. *Gate: won leads convert to trackable projects.*
- **Phase 6 — Engagement and AI.** Contribution dashboard, review flow, appeals, permission-safe AI. *Gate: transparent scoring with manager review; AI isolation tests pass.*

Pilot with Goldland Sales and a small operations group, then expand.

### TESTING AND DELIVERY

Unit tests for rules (stage transitions, dedup, scoring); integration tests with a real Postgres (RLS on); contract tests for webhooks with recorded Meta payloads; e2e (Playwright) for core journeys; load test before launch; seed script with synthetic data for all three companies and the full role matrix; staging mirrors production; versioned migrations with rollback notes; feature flags for risky modules.

### HOW TO WORK (agent protocol)

1. Work one phase at a time. At the start of each phase, restate scope, list files you will create, and note open assumptions.
2. Write tests with the code. Do not mark a phase done until its exit gate passes; show the evidence.
3. Never weaken a security control to make a test or demo pass. Flag it instead.
4. When a requirement is ambiguous, pick the safest reasonable default, record it in docs/assumptions.md, and continue; ask only if the choice is irreversible or affects permissions.
5. Keep docs current: ERD, access matrix, API contract, ADRs, runbooks.
6. Start now with Phase 0: produce the ERD, access matrix and ADR list for review before writing application code.

### ASSUMPTIONS TO CONFIRM (do not block on these)

Casavera domain and branding; Navas's Goldland membership; Rasiba and Asma assigned to Casavera as shared resources; number of Casavera site engineers; hosting region and AI inference region; Workspace tenant and Shared Drive layout; WhatsApp numbers' current status; quotation, invoicing, attendance and payroll scope later; retention periods; whether Arabic UI is needed at launch.

> Section 4 of the build doc supersedes the technology table above where they differ: this repo forks Atomic CRM and runs on Supabase. The authorization model, lead rules, WhatsApp rules, Drive rules, engagement rules, security checklist and acceptance criteria still apply.
