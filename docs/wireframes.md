# Phase 0 wireframe outlines

Text-only sketches for review. They define information hierarchy, not final visual design. Do not show records or navigation the current actor cannot access.

## 1. Company workspace / dashboard

```text
┌ Group CRM ────────────────────────────────────────────────────────────┐
│ [Company: Goldland ▾]   Search…               Notifications  Profile  │
├──────────────┬────────────────────────────────────────────────────────┤
│ Dashboard    │ My work                                                │
│ Leads        │ [Overdue follow-ups] [Tasks due] [Open projects]        │
│ Tasks        │                                                        │
│ Projects     │ Pipeline by stage       Approvals / project status       │
│ Inbox        │ [permission-scoped chart] [permission-scoped list]       │
│ Documents    │                                                        │
│ Reports      │ Recent activity (only records actor can open)           │
│ Admin*       │ *visible only with relevant permission                  │
└──────────────┴────────────────────────────────────────────────────────┘
```

Company switcher lists active memberships only. Group overview appears only to explicit group-scope roles. Dashboard filters never broaden authorization.

## 2. Leads list and detail

```text
Leads  [New lead]  [Stage ▾] [Owner ▾] [Service ▾] [Follow-up overdue □]
┌ Code ── Customer ── Service ── Owner ── Stage ── Next action ── Risk ┐
│ GL-L-…  …           …          …       …       …             …       │
└───────────────────────────────────────────────────────────────────────┘

Lead detail: Summary | Activity | Tasks | Messages | Documents
- Company badge, source, contact channel identities, selected service(s)
- Owner, stage, priority, next follow-up; stage transition requires reason where configured
- HIGH RISK is a separate flag with type, owner and mitigation
- Possible duplicates shown in human review queue; merge is never automatic
- Activity history and stage changes are auditable
```

Only authorized fields render. Marketing users do not receive customer financial fields from the API, even if the UI hides them.

## 3. Task / project workspace

```text
Project: [company + name] [status] [owner] [permitted collaborators]
Tabs: Overview | Workflow | Tasks | Site visits | Approvals | Documents | Activity
Milestones: [stage lane / list]
Task panel: owner, due date, priority, checklist, comments, linked lead/message
```

Unassigned or cross-company items do not leak in search or count badges. Task templates are visible/editable only to their authorized company administrators.

## 4. Internal communication and customer inbox

```text
Inbox / Channels
┌ Company channels ── DMs ── Customer conversations ────────────────────┐
│ Channel/conversation list (membership-filtered) | thread and messages │
│ Search (RLS-scoped)                          | linked lead/project     │
│                                                | Message → task action  │
└───────────────────────────────────────────────────────────────────────┘
```

Private DMs are excluded from contribution scoring. WhatsApp composer shows consent and service-window state; outside the 24-hour window only approved templates are available. BSUID and phone are separate identity fields.

## 5. Access review / temporary assignments

```text
Access review (authorized approvers only)
User | Company | Role | Temporary | Starts/Expires | Approver | Status
[view request] [approve/reject] [revoke] [renew with reason]
```

Pending or expired grants provide no access. The subject cannot approve their own assignment. IT support sees platform state but no business record details by default.

## 6. Engagement review

```text
Monthly review (HR / authorized management)
Employee + job family | permitted period | evidence links | manager context
Quality/outcomes 35 | delivery 25 | collaboration 15 | reliability 15 | learning 10
Status: draft → manager context → HR check → management approval
Employee view: own score, evidence summary, corrections/appeal and status
```

Do not display click/online-time/private-chat/sentiment signals. Every score is evidence-linked and subject to an appeal.
