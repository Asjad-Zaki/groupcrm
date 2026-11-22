# Group CRM threat model (Phase 0)

Status: initial STRIDE pass for design review; not a security assessment or legal opinion. Assets and trust boundaries are based on the product prompt and current Atomic CRM architecture. Production data must remain synthetic until the controls and UAE data-path review are verified.

## Assets

- Customer and contact identity data, WhatsApp messages/consent, lead notes and project files.
- Company-scoped pipeline, estimates, contracts, approvals, finance and operational records.
- Employee identity, HR files, salary data, engagement evidence/scores and appeals.
- Authentication sessions, memberships/role grants, OAuth/Meta/Drive credentials, service-role secrets.
- Append-only audit events, backups, exports, logs and telemetry.

## Trust boundaries

1. Browser/PWA (public publishable Supabase key; user JWT) → Supabase API/Postgres/RLS.
2. Supabase Auth/OIDC identity → application profile/membership and policy functions.
3. Edge Functions/webhooks → raw third-party HTTP payloads and privileged service credentials.
4. Supabase Storage → private transient attachments; Google Drive Shared Drives → customer/project/HR files.
5. Realtime channels and push/email notification providers → tenant-scoped event and message data.
6. UAE production services → any external monitoring, email, identity, AI or vendor endpoint.
7. Operators/support → admin controls and time-bounded break-glass access.

## STRIDE risks and required mitigations

| Threat | Example | Required controls / verification |
| --- | --- | --- |
| Spoofing | Attacker signs in as a former employee or forges a WhatsApp webhook. | Workspace OIDC + MFA for privileged roles; allowlist; immediate session/token revocation; verify raw-body webhook signature and replay window; no shared accounts. Test revoked membership on the next request. |
| Tampering | User changes `company_id`, role, stage or audit row through REST/RPC/MCP. | RLS `USING` and `WITH CHECK` policies; server-side transition validation; least-privilege grants; audit log insert-only; SQL/AST validation where raw SQL tools exist; pgTAP negative tests for every table and storage object. |
| Repudiation | Sensitive download, export or break-glass access cannot be attributed. | Append-only audit with actor, scope, target, action, request/correlation ID and timestamp; audit Edge Function reads/downloads/exports; protect logs and alerts; test insert/update/delete restrictions. |
| Information disclosure | Cross-company RLS leak, shared Drive URL bypass, public bucket, search/view/Realtime aggregate leaks. | Tenant ID on all tenant rows; secure-invoker views; private storage; policy-checked proxy/short-lived links; caller JWT for user queries; Realtime authorization; filter before aggregation; cross-company tests for tables, views, RPC, search, storage and sockets. |
| Denial of service | Expensive search/SQL, webhook flood, oversized media, queue backlog. | Rate/size limits; statement timeout; bounded list limits; idempotent queue; retry/backoff/dead-letter and backlog alerts; media limits; load tests and recovery runbook. |
| Elevation of privilege | IT admin silently reads HR/finance, temporary role activates without approval, SECURITY DEFINER bypass. | Separate platform-admin and content permissions; no implicit service-role access; time-boxed dual-approved break-glass; SECURITY DEFINER with empty search_path, explicit actor checks and minimal execute grants; automated privilege escalation tests. |
| Prompt injection / untrusted content | WhatsApp text asks an AI to export records or alter permissions. | Treat all inbound text and attachments as untrusted data; no autonomous writes; AI uses caller-scoped RLS and allowlisted read tools; show citations; never let customer text choose tools, SQL or policy. |
| Supply-chain compromise | Malicious or incompatible dependency, copied AGPL code, leaked secret. | Verify registry, licence and release; pin versions and lockfile; scan dependencies/secrets/container; never copy AGPL or commercial enterprise directories; server-only secret storage. |
| Residency/compliance failure | Logs, backups, identity, email or inference leave UAE. | Maintain a data-flow inventory; region-check every processor including backups/telemetry; redact or keep inference in-region; vendor/legal review under UAE PDPL; test backup restore in-region. |

## High-priority abuse cases

- A member of Goldland changes a lead's `company_id` to Casavera during INSERT/UPDATE: denied by `WITH CHECK`; log attempted sensitive action where feasible.
- A user keeps an open Realtime subscription after membership revocation: server-side subscription authorization and event filtering stop delivery; test without reconnecting.
- A removed employee uses a still-valid JWT: every row-level predicate checks current membership, not a stale JWT company claim; revoke sessions as defense in depth.
- A valid employee changes a URL or object path to fetch another tenant's file: private bucket + tenant-scoped storage policy/proxy check denies it.
- An IT administrator invokes `service_role` through the browser or MCP: secret is absent from client and privileged tools are not exposed; role is denied business content unless an approved break-glass grant exists.
- A webhook is replayed or duplicated: signature, timestamp/replay window and unique provider event ID make processing idempotent.
- A report aggregates inaccessible HR/finance rows: data predicates apply before aggregation and small-group inference is reviewed.

## Phase 0 validation plan

- pgTAP: cross-company read/write denials for all tables, views, RPCs and storage; role gating; temporary assignment; revocation; IT separation; append-only audit.
- Edge Function contract tests: invalid signatures, replay, duplicate event IDs, malformed/oversized payload, fast acknowledgement, safe retries.
- Browser e2e: company switching does not grant access; export/download audit event appears; expired membership loses access.
- Realtime tests: unauthorized channel join denied; removed member receives no further events.
- Data-path review: map DB, object storage, Drive, backups, logs, monitoring, identity, email, push and AI regions before production credentials/data.

## Residual risk / not yet verified

The current upstream repository has permissive authenticated policies on business tables and a public attachments bucket. This is a migration blocker, not a production-ready security posture. The design artifacts do not remediate it. Local Supabase-backed tests cannot run until Docker is available; external integration tests require Meta and Google Workspace test tenants.
