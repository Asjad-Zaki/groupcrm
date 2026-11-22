# Group CRM — Phase 0 design package

Status: design artifacts prepared for review. No application code, schema, migrations or security policies were changed in this phase. Existing uncommitted files (`BUILD_PROMPT.md`, `CLAUDE.md`, `docs/atomic-crm-map.md`) were preserved.

## Scope

Use the Atomic CRM + Supabase direction in Section 4 of the source build prompt. This design package translates the product requirements into the target ERD, access matrix, function API outline, threat model and wireframes. It is a proposal, not approval to implement a schema. Phase 0 must be reviewed before V1 foundation work.

## Deliverables

- `docs/atomic-crm-map.md` — source-reviewed map of the current Atomic CRM tables, policies, auth, functions, frontend hook points and migration plan.
- `docs/erd.md` — target data model and key constraints.
- `docs/access-matrix.md` — role- and record-scoped permissions with default denials.
- `docs/adr/README.md` — proposed decisions and open review points.
- `docs/phase-0-openapi.yaml` — design-only Edge Function contract skeleton; PostgREST CRUD remains governed by RLS.
- `docs/threat-model.md` — initial STRIDE review and test plan.
- `docs/wireframes.md` — text wireframes for the core user flows.

## Decisions and assumptions to review

1. `companies` will mean the three operating tenants. Rename Atomic's existing customer-company entity to `organizations`; rename legacy contact/deal references to `organization_id` before introducing tenant `company_id`.
2. Preserve Atomic's `sales` profile table. Proposed membership identity uses `auth.users.id` as canonical user ID.
3. Default customer/contact model is tenant-local. Sharing across companies requires an explicit audited grant.
4. Group-wide scope is explicit; NULL is never used to infer group scope.
5. IT administration does not grant access to business content. Break-glass is separate, bounded, approved and audited.
6. No user assignments or membership assumptions are seeded. Named staff assignments and temporary roles need confirmation.
7. Supabase PostgREST + RLS is the ordinary API; RPCs handle atomic transitions; Edge Functions handle signed webhooks, Drive proxy and server-only secrets.
8. Production hosting remains undecided. UAE data-path constraints apply to database, storage, backups, monitoring, identity, email, push and AI.

## Spikes and exit-gate status

The three-spike gate is not satisfied: the RLS policy logic passed on native PostgreSQL, but Supabase integration remains unverified and the WhatsApp and Drive spikes have not run.

| Spike | Current status | Blocker / required next evidence |
| --- | --- | --- |
| Supabase + RLS + membership-scoped requests | Native PostgreSQL policy spike passed; Supabase integration blocked | On an isolated PostgreSQL 17.5 cluster, the test was RED before policies (Alice saw 2 tenant rows) and passed after policies: scoped read/write denial, IT no-content, inactive temporary assignment, accountant scoping, and immediate revocation. This does not verify Supabase Auth/PostgREST/Storage/Realtime. Docker Desktop reports `wslUpdateRequired=true`; `wsl --update` reported no updates and the kernel is 5.10.102.1. The host reports build 21996, below Docker's current Windows 11 23H2 minimum build 22631; Docker's Windows 10 path requires 22H2/build 19045. Only 196 MB remains on C:, below the official WSL 3.0.3 MSI size (367,575,040 bytes), so no installer/reboot was attempted. |
| WhatsApp Cloud API webhook with BSUID | Not run | Requires a Meta developer app, test business/number, webhook secret and recorded BSUID payload. Test signature, replay, idempotency and response latency. |
| Drive Shared Drive permission proxy | Not run | Requires Workspace tenant, test Shared Drive and server-side credential strategy. Demonstrate CRM authorization before access, audit record and short-lived link/proxy behavior. |

The ERD/access matrix/ADR directions are proposals pending your approval, which you have given. Phase 1 cannot be marked complete until the RLS behavior is verified through Supabase Auth/PostgREST/Storage and automated isolation/revocation tests. The native PostgreSQL spike is supporting evidence only. Never use production customer data for these tests.

## Host/tooling verification

- Node v24.21.0 `npm run typecheck`: passed.
- `npm run build`: blocked before bundling; `@swc/html` native binding rejects the cache because `C:\` grants Everyone full control, and no safe cache ancestor is available on C:.
- `npm run test:unit:app -- --project app`: blocked before tests because the runner cannot listen on `::1` (`EACCES`).
- The broad `npm run test:unit:app` timed out at 300 seconds; harness subprocess tests also showed Windows path doubling (`C:\C:\CRM\...`). No application-source changes resulted.

## Review request

Please review the tenant/customer naming, identity linkage, cross-company sharing default, role boundaries, and the proposed API/security boundaries. Any permission-changing ambiguity must be resolved before migrations. Unconfirmed company membership, staff assignments, hosting provider, workspace layout, WhatsApp account status, retention, Arabic-at-launch and later payroll/attendance/invoicing are documented as open assumptions in the source build prompt and ADR index.
