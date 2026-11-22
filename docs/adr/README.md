# Architecture decision records — index

All entries are proposed and require review. No technology or security decision below is implemented by this document. Record accepted decisions as individual `ADR-NNN-*.md` files before the corresponding code/migration. Check licences and current vendor/region terms at implementation time.

| ID | Decision | Proposed direction | Status / consequence |
| --- | --- | --- | --- |
| ADR-001 | Product foundation | Fork Atomic CRM (MIT) and retain its React + Supabase modular architecture for the vibe-coding path; do not copy AGPL code. | Prompt-selected; confirm fork provenance and lockfile licences. |
| ADR-002 | Tenant vs customer organisation names | Rename existing customer `companies` to `organizations`; new `companies` means Goldland, Abbadi Tech, Casavera tenants. Rename legacy `company_id` references on contacts/deals to `organization_id`. | Proposed; high-blast-radius migration and UI rename. |
| ADR-003 | Identity/profile linkage | Keep `sales` as the Atomic profile table; use Supabase `auth.users.id` as the canonical user identifier for memberships and RLS. | Proposed; audit auth triggers, invite flow, profile cache and disabled-user behavior. |
| ADR-004 | Authorization | Active tenant memberships + approved role grants + record grants; enforce through RLS, RPC/Edge Function checks and UI affordances. No broad authenticated `USING (true)` business policies. | Required security direction; existing policies are currently permissive. |
| ADR-005 | Membership and role lifecycle | Membership/grant rows carry effective dates, temporary flag, approver and review/expiry; temporary grants default inactive. Revocation is immediate. | Proposed; define approver roles and race-safe revocation semantics. |
| ADR-006 | Customer/contact tenant isolation | Tenant-local organizations and contacts in v1; explicit audited sharing if cross-company use is needed. | Safest default; may duplicate contact data and needs later reconciliation policy. |
| ADR-007 | Database API boundary | Supabase PostgREST under RLS for ordinary CRUD; narrowly scoped RPCs for atomic business transitions; Edge Functions for secrets, webhooks, Drive proxy and privileged admin tasks. | Proposed; no NestJS layer in this fork path. OpenAPI documents function contracts, not every generated PostgREST endpoint. |
| ADR-008 | Storage access | Make attachments private; tenant-scoped object paths and policies; serve Drive/HR files only through a permission check and audited proxy/short-lived authorization. | Required before real data; existing `attachments` bucket is public. |
| ADR-009 | Lead conversion and audit | Rename deals to leads with reversible ID mapping; stage/assignment history append-only; WON transition creates project/tasks atomically and starts Drive folder creation idempotently. | Proposed; clarify conversion cardinality and rollback behavior. |
| ADR-010 | Realtime collaboration | Use Supabase Realtime initially; channel scope and membership enforced in RLS and subscription tests. Consider Zulip only if native chat scope is unworkable. | Proposed; verify removal/revocation behavior across active sockets. |
| ADR-011 | WhatsApp integration | Meta Cloud API only, behind a channel abstraction; verify signatures, store raw events safely, dedupe idempotently, preserve BSUID separate from phone. | Proposed; requires Meta test business/number before spike can pass. |
| ADR-012 | Google Drive integration | Shared Drives; CRM authorization before file access; keep tokens server-side and audit uploads/downloads/sharing changes. | Proposed; requires Workspace tenant, service account/delegation decision and test Shared Drive. |
| ADR-013 | Jobs and queue | Prefer database-backed scheduling/queue only after confirming extension availability in pinned self-host image; otherwise evaluate a UAE-hosted worker/Redis queue. | Open spike; do not assume `pgmq` is included or deployable. |
| ADR-014 | UAE data residency | Production database, storage, backups, logs, monitoring, identity, email and AI paths remain in UAE unless counsel approves a lawful transfer. | Open decision: AWS me-central-1 vs Azure UAE North vs qualified UAE provider. |
| ADR-015 | Auth and domain restriction | Google Workspace OIDC, approved-domain/allowlist, MFA for privileged roles, immediate exit revocation; synthetic-data-only development. | Proposed; confirm Workspace tenant and operational recovery access. |
| ADR-016 | Audit model | Append-only audit log with actor/scope/target/action/correlation metadata; restrict updates/deletes at DB grants and monitor privileged break-glass. | Proposed; choose tamper-evidence mechanism and retention after threat/legal review. |
| ADR-017 | Engagement scoring | Outcome-based role-family score with evidence, human approval, employee visibility/appeal; exclude private chats and covert activity signals. | Product policy required; legal review and employee consultation before implementation. |
| ADR-018 | AI | Phase 6 read-only assistant, caller identity/RLS, citations, no employment decisions or autonomous writes; inference in-region or redact data before transfer. | Deferred; requires data-path and PDPL review. |

## Approval gates

- Phase 0 review: approve scope, ERD, access matrix, and ADR directions; resolve any permission-changing ambiguity before schema work.
- Before V1: verify the local Supabase image/extension, supported Node version, auth/Workspace approach, and migration rollback strategy.
- Before production data: qualified UAE PDPL review, regional vendor/data-path confirmation, security review, restore test, and cross-company isolation tests.
