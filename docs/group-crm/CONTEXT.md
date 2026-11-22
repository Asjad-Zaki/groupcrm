# Group CRM: Context and Decisions

## Glossary

| Term | Definition |
|---|---|
| **Tenant** | A company unit within the Group CRM. Each tenant has independent data isolation via RLS. Currently: Goldland, Abbadi Tech, Casavera. |
| **Membership** | A user's assignment to one or more tenants with a specific role. Effective dates may apply. |
| **Customer Company** | The company associated with a lead/contact/project. Every record has `company_id` linking to a tenant. |
| **Lead** | An enquiry from website forms, Meta campaigns, WhatsApp, calls, referrals or manual entry. Has a unique ID, owner, stage, priority, next follow-up, source, service, estimated value. |
| **Project** | Converted work from a won lead. Has milestones, site visits, inspection reports, approvals, progress updates, handover. Company-specific workflow. |
| **Workflow Template** | Pre-defined step sequences per company: Goldland (approvals → drawings → submission → comments → revisions → inspection → closure), Abbadi Tech (enquiry → site visit → scope → quotation → work assignment → execution → site report → completion/invoice), Casavera (enquiry → site visit/brief → concept/design → BOQ/quotation → client approval → project execution → progress/variations → handover). |
| **Provisional Access** | Temporary user assignments that require review before production access is granted. Marked as 'temp' in the user directory. |
| **Engagement Score** | Role-adjusted contribution score (quality 35%, task ownership 25%, collaboration 15%, reliability 15%, learning 10%). Monthly review with role-specific targets. |
| **Audit Log** | Immutable record of: login, access to sensitive records, edits, exports, downloads, permission changes, deletion. |
| **Shared Employee** | A user assigned to multiple tenants without duplicate accounts. Switches company context instantly via the company switcher. |
| **Group-Wide Record** | A record explicitly marked as group-scope (not tied to a specific company). |
| **Privileged Role** | MD/Operations, Accountant, HR, Admin, IT. Enforced MFA (aal2) for these roles. |

## Open Decisions (Defaults + Configurable)

| # | Decision | Default | Configurable | Flag |
|---|---|---|---|---|
| 1 | Arabic/RTL in v1 | No (layout RTL-ready) | Yes | Layout is RTL-ready but Arabic support deferred |
| 2 | Google Workspace SSO at launch | Off | Yes | Email/password with MFA |
| 3 | PWA install at launch | Yes | Yes | Push notifications deferred to later |
| 4 | Brand colours/logos per company | Placeholders | Yes | Use existing tokens until client supplies |
| 5 | Temporary role production access | Requires review | Yes | Per-role decision needed |
| 6 | Navas Goldland membership | Group-level manager | Yes | Navis is group-level manager, not Goldland employee |
| 7 | Rasiba/Asma Casavera assignment | Formally assigned to Casavera | Yes | Rasiba and Asma formally added to Casavera column |
| 8 | Number of Casavera site engineers | Junaid, Arshad, Samson (3) | Yes | Confirmed: 3 site engineers |

## ADRs (Architecture Decision Records)

### ADR-001: Tenant Isolation via RLS (Not UI-Only)
- **Status**: Accepted
- **Decision**: Tenant isolation must be enforced in PostgreSQL RLS policies and storage policies, never only in the UI layer. All queries must pass through RLS. The `tenant_memberships` table determines which tenants each user can access.
- **Context**: Requirements section 7 and SPEC.md Part 5 mandate RLS-based isolation. The existing Atomic CRM has RLS policies in `supabase/schemas/05_policies.sql`.
- **Consequences**: Backend is the source of truth for data isolation. UI must not assume access; every API call respects RLS.

### ADR-002: Supabase as Source of Truth (Not NestJS/Prisma)
- **Status**: Accepted
- **Decision**: Database schema in `supabase/schemas/` is the source of truth. Migrations are generated from this schema using `npx supabase db diff`. Do not use NestJS/Prisma as the primary data layer.
- **Context**: Requirements section 6, SPEC.md Part 5, and non-negotiable rule #2 from the build prompt.
- **Consequences**: SQL migrations drive schema changes. Frontend queries use Supabase JS client. The existing `01_tables.sql` through `08_search.sql` define the complete data model.

### ADR-003: WhatsApp Integration via Meta Cloud API
- **Status**: Accepted
- **Decision**: Use official Meta Cloud API and webhooks. Each company has approved business numbers. Inbound/outbound messages routed to correct company inbox. 24-hour customer-service window and template rules respected.
- **Context**: Requirements section 8 (WhatsApp Business Platform) and section 8 (Integrations) of the build prompt.
- **Consequences**: Edge function `whatsapp` in `supabase/functions/` handles webhook processing. Conversation audit trail stored in `conversations` / `messages` tables.

### ADR-004: Google Drive Integration via API
- **Status**: Accepted
- **Decision**: Use Google Workspace Shared Drives or agreed group structure. CRM stores file IDs/metadata; Drive remains the file store. Least-privilege permissions and audit sharing.
- **Context**: Requirements section 8 (Google Drive) and section 8 (Integrations) of the build prompt.
- **Consequences**: File references stored in `documents` table with `drive_id`, `drive_version`, `permission_id`. Permission-aware access through Supabase Storage policies.

### ADR-005: Invite-Only Authentication (No Public Sign-Up)
- **Status**: Accepted
- **Decision**: First administrator bootstraps via existing first-user flow. Everyone else invited through `user_invitations`. No public registration page.
- **Context**: Build prompt section "Authentication and account lifecycle (Supabase Auth)" and REQUIREMENTS.md section 12 (acceptance criteria).
- **Consequences**: Sign-up flow uses Supabase Auth invitations. All new users have `invited_by` and `status` (invited/active/suspended/ended).

### ADR-006: Balanced Employee Contribution Scoring
- **Status**: Accepted
- **Decision**: Role-adjusted score with weighting: quality & outcomes 35%, task ownership 25%, collaboration 15%, reliability 15%, learning & improvement 10%. Compare within role groups, not across.
- **Context**: REQUIREMENTS.md section 5 (Employee engagement) and section 12 acceptance criteria.
- **Consequences**: Monthly review process with evidence summary. AI may summarize but must not make final employment decisions.

### ADR-007: Modular Monolith (One Supabase Project)
- **Status**: Accepted
- **Decision**: One Supabase project, feature folders in code, no extra services until scale justifies split. Start as modular monolith.
- **Context**: Build prompt section 9 (Recommended technology architecture) and non-negotiable rule #7.
- **Consequences**: All features in `src/components/atomic-crm/`. Shared data layer via Supabase. No microservices split unless proven necessary.

### ADR-008: Per-Company Theming via `data-tenant` Attribute
- **Status**: Accepted
- **Decision**: Branding (logo, primary, accent) stored in `tenants.branding` CSS variable applied through `[data-tenant]` attribute on html element. Same components restyle per company.
- **Context**: Build prompt design system section (per-company theming) and open decision #4.
- **Consequences**: Three brand variants (Goldland, Abbadi Tech, Casavera) using same component library. Placeholder colours until brand assets supplied.

### ADR-009: Motion Library for Clarity, Not Decoration
- **Status**: Accepted
- **Decision**: Use `motion/react` for shared-element transitions, drawers, list reordering, springs, subtle feedback. Never replace drag-and-drop library. Animations must have non-animated equivalents.
- **Context**: Build prompt section "Motion (Motion library: npm install motion)" and UX principles.
- **Consequences**: Reusable primitives in `src/components/motion/`. Bundle size budget: no more than 10% initial load regression. 60fps on mid-range Android.

## Phase 0 Checklist (from REQUIREMENTS.md §14)

- [x] Run requirements workshop (completed)
- [ ] Freeze company/user/role matrix and permission rules
- [ ] Produce ERD, API contract, threat model and wireframes
- [ ] Build authentication, company membership and audit logging first (Phase 1)
- [ ] Pilot with Goldland Sales and small operations group (Phase 9)

## Phase 5: General Chat and Messenger (Open Decisions + ADRs)

### Open Decisions

| # | Decision | Default | Configurable | Flag |
|---|---|---|---|---|
| 25 | Messenger UI framework | shadcn-admin-kit + MUI v5 | Yes | Could swap to Radix or Chakra |
| 26 | DM privacy: managers cannot read private DMs | Enforced via RLS | Yes | Requires explicit `is_admin()` check in policies |
| 27 | Message retention period | 90 days | Yes | Configurable per tenant |
| 28 | File attachments in messages | Allowed (image/pdf/zip) | Yes | Max size per tenant config |
| 29 | Realtime message updates | Enabled via Supabase Realtime | Yes | Can be disabled per tenant |
| 30 | Message search indexing | Enabled | Yes | Full-text search optional |

### ADRs

#### ADR-010: Messenger Architecture (Tenant-Isolated Chat)
- **Status**: Proposed
- **Decision**: Chat tables (`conversations`, `conversation_members`, `messages`, `message_links`, `issue_threads`) all have `tenant_id` columns. RLS policies enforce tenant membership via `tenant_memberships`. No `using (true)` policies. All chat data is tenant-scoped; cross-tenant messages impossible.
- **Context**: Non-negotiable rule #1 (tenant isolation) and rule #12 (private DMs not readable by managers/admins through the app). Requires `private_is_member()`, `private_can()`, `private_require_aal2()` patterns extended to chat tables.
- **Consequences**: 
  - DMs between users in same tenant only. Managers/admins cannot read another user's private DMs through the app UI or API.
  - Project chats auto-created when project is created; members stay in sync with `project_members`.
  - Issue threads linked to `Technical Issues` channel per project.
  - Message links associate messages with tasks/leads/projects for cross-referencing.
- **Related**: `supabase/schemas/01_tables.sql` conversations table, `supabase/schemas/05_policies.sql` RLS policies, `private_is_member()` / `private_can()` / `private_require_aal2()` functions in schema `private`.

#### ADR-011: Message Link Pattern (Task/Lead/Project Association)
- **Status**: Proposed
- **Decision**: `message_links` table associates messages with `task`, `lead`, or `project` target types. Enables "convert message to task" and quick navigation from chat to related records.
- **Context**: Needed for workflow continuity - users may want to turn a technical discussion into a tracked task.
- **Consequences**: 
  - Each message can link to multiple targets (one per type).
  - Indexes on `(target_type, target_id)` for efficient lookup.
  - UI shows linked record count on message hover.
- **Related**: `supabase/schemas/01_tables.sql` message_links table, `ConversationThread.tsx` convert-to-task handler.

#### ADR-012: Technical Issues Channel + Issue Threads
- **Status**: Proposed
- **Decision**: Each project gets a default `issue`-type conversation ("Technical Issues - {project name}"). Reporters can open threads with status tracking (`open`/`resolved`). Threads auto-close after 14 days of inactivity.
- **Context**: Technical teams need a structured way to raise and track issues within project chats.
- **Consequences**: 
  - `issue_threads` table tracks status, reporter, resolver, open count.
  - Conversation posting policy defaults to `everyone` but can be changed to `managers_only`.
  - Admins can resolve threads; resolution resets `open_count` to 0.
- **Related**: `supabase/schemas/01_tables.sql` issue_threads table, `ConversationThread.tsx` thread management.

## ADRs (Architecture Decision Records)

(...existing ADRs 1-9 remain unchanged...)

## Phase 0 Checklist (from REQUIREMENTS.md §14)

- [x] Run requirements workshop (completed)
- [ ] Freeze company/user/role matrix and permission rules
- [ ] Produce ERD, API contract, threat model and wireframes
- [ ] Build authentication, company membership and audit logging first (Phase 1)
- [ ] Pilot with Goldland Sales and small operations group (Phase 9)

## Next Steps

1. Freeze the user directory matrix (confirm Navas Goldland membership, Rasiba/Asma Casavera assignments, Casavera site engineer count)
2. Confirm temporary role production access policies
3. Produce ERD based on `supabase/schemas/01_tables.sql` with tenant isolation
4. Generate API contract from schema functions
5. Create wireframes for key screens (login, app shell, group dashboard, lead pipeline)
6. Begin Phase 1: Authentication and tenant isolation