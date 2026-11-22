# Group CRM access matrix (Phase 0)

Status: proposed policy source for review. This matrix complements `BUILD_PROMPT.md`; it is not yet enforced by the current application. Effective access is the intersection of active company membership, approved role grants, department/record assignment, and the requested action. Postgres RLS is the final boundary; UI hiding is not authorization.

Legend: `own/team/assigned` means records within the actor's authorized company and record scope; `company` means all records in an active company membership; `explicit` means a separate grant is required; `—` means deny by default. All permissions are subject to field-level restrictions and audit requirements below.

| Role family | Leads / customer records | Tasks / projects | Internal channels | Finance / quotations | HR / engagement | Admin / access control |
| --- | --- | --- | --- | --- | --- | --- |
| Group IT administrator | — | — | — | — | — | Platform configuration, account lifecycle and technical support; no business-content access |
| Managing director / operations | Company records for assigned companies; group view only with explicit group scope | Company records for assigned companies | Permitted company and group channels | Explicit management permission; audit reads/exports | Management-approved review outputs only | Business settings for assigned scope; no self-granting roles |
| Company / department manager | Team or department records in assigned company | Team or department records in assigned company | Company/department channels | No access unless separately granted | No access unless HR/management role | Scoped operational settings; cannot grant broader scope |
| Sales | Own/team leads and linked customer/contact details | Assigned and lead-linked tasks/projects | Company sales channels; DMs as participants | No cost/payroll/HR data; quote access only if separately granted | Own score and appeal only | No role or membership administration |
| Marketing / lead generation | Leads sourced by the actor or explicit campaign assignment; no customer financials | Assigned lead-generation tasks only | Relevant company channels | — | Own score and appeal only | — |
| Designer / draftsman / approval consultant | Minimum lead brief for assigned work | Assigned projects, milestones, and tasks | Relevant project/company channels | No financial details beyond approved scope | Own score and appeal only | — |
| Site engineer | Minimum customer/project details needed for assigned work | Assigned projects, site visits, reports and tasks | Relevant project/company channels | No finance/quotation detail unless assigned | Own score and appeal only | — |
| Accountant | Customer/project records necessary for authorized accounting work | Tasks explicitly assigned | Finance channels only when a member | Company-scoped finance records | — | No user/role administration |
| HR | Minimum identity and employment records | HR tasks only | HR/management channels when a member | Salary/finance HR records only as required | Review evidence and workflow; employees see only their own score/appeal | HR lifecycle functions, not platform secrets |
| Company-scoped admin | Company master data and permitted operational records | Company scope as explicitly configured | Company channels | — by default | — by default | Manage company-scoped settings; cannot self-approve privileges |
| Employee self-service | Own profile and assigned records | Own tasks/projects | Channels they belong to | — | Own score, evidence summary and appeals | Own access requests only |

## Cross-cutting policy rules

1. Require an active, date-valid membership for the tenant on every read and write. Revocation must take effect on the next database statement; cached UI state cannot preserve access.
2. Company switcher selects query context; it does not grant access. Group aggregates are permitted only when a role has explicit group scope and only over rows that role may read individually.
3. Lead access: sales is owner/team-scoped; marketing is source/assignment-scoped and cannot read customer financials; shared specialists see the minimum fields for assigned work. Record-level grants must be auditable and revocable.
4. Sensitive domains (finance, salaries, HR files, contracts, management channels, engagement evidence/scores) require dedicated permissions. A broad operational role does not imply access.
5. Temporary assignments are denied until approved by an authorized approver, and are active only inside their effective date window. The subject cannot approve their own grant. Expiry removes access automatically and raises a review reminder.
6. IT support has no business-content access by default. Break-glass requires a reason, bounded duration, explicit approval/alert to MD and HR, and audit rows for every sensitive read and write. Emergency access never bypasses audit or retention controls.
7. Service-role and backend jobs do not imply user access. User-facing requests must execute under the caller's Supabase identity/RLS; privileged jobs need narrowly scoped service contracts, idempotency, and audit records.
8. Exports, downloads, permission changes, sensitive reads, stage changes, deletions, and break-glass use are audited. Audit records are insert-only to application roles.
9. Channel membership is checked both at subscription time and on each database event. A removed member must lose Realtime visibility without reconnecting as another user.
10. Aggregate reports must not reveal counts or values for inaccessible records. Apply the same row predicates before aggregation; test small-group inference risks for HR/engagement reports.

## Open questions (safe defaults until approved)

- Names and boundaries of departments and which manager roles are company-wide vs department-scoped.
- Which specific finance fields sales may see, if any. Default: none.
- Whether management channels are company-specific or group-scoped. Default: company-specific, group only by explicit membership.
- Who may approve temporary assignments and break-glass access. Default: independent authorized approver; IT cannot self-approve.
- Exact user assignments (including Navas, Rasiba, Asma, and temporary roles) remain unconfirmed; do not seed real identities or infer memberships.
