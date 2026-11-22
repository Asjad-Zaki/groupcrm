# Group CRM — Canonical Domain Model & Glossary

This document defines the ubiquitous language for the multi-company Group CRM workspace across **Goldland Contracting LLC**, **Abbadi Tech Technical Services LLC**, and **Casavera Interiors LLC**.

---

## 1. Core Organizational Concepts

### Tenant (`tenant_id`)
- **Definition**: One of the three legal UAE operating companies under the Group umbrella:
  1. **Goldland Contracting LLC** (`goldland` / `GL`): Dubai authority approvals, engineering/architectural design, fit-out permitting.
  2. **Abbadi Tech Technical Services LLC** (`abbadi` / `AT`): Electrical contracting, plumbing, HVAC maintenance, DEWA approvals.
  3. **Casavera Interiors LLC** (`casavera` / `CV`): Interior concept, architectural 3D, luxury turnkey fit-out, bespoke joinery.
  4. **Group Overview** (`group` / `ALL`): Consolidated management vantage point combining all three companies.
- **Rules**: Every lead, project, task, quotation, document link, and audit event belongs to a Tenant. The database enforces isolation via PostgreSQL RLS. The UI Company Switcher allows shared employees to toggle their active working context.

### Customer Organization (`companies` table)
- **Definition**: An external client, developer, corporate entity, property manager, or landlord (e.g., *Emaar Hospitality*, *DAMAC Developments*, *Nakheel*, *DIFC Authority*).
- **Distinction**: In legacy Atomic CRM code, this table is named `companies`. To avoid confusing customer companies with our operating companies, the UI copy labels this **"Organizations"** or **"Clients"**, while operating companies are called **"Companies"** in the Switcher.

### Contact (`contacts` table)
- **Definition**: A specific human representative, procurement manager, project director, or homeowner associated with a Customer Organization.
- **Fields**: Name, UAE Phone (`+971 50/52/55/58`), Email, Role, Acquisition channel, Notes, and Activity history.

---

## 2. Sales & Leads Pipeline

### Lead (`deals` table)
- **Definition**: A commercial inquiry or project opportunity being pursued by one of our operating companies.
- **Currency**: UAE Dirham (**AED**).
- **The 9 UAE Pipeline Stages**:
  1. `NEW`: Lead received from web form, Meta campaign, referral, or walk-in. Requires rapid owner assignment.
  2. `INITIATED`: First contact attempt made (call, WhatsApp, email). Contact outcome logged.
  3. `UNDER_FOLLOW_UP`: Active technical or commercial requirements discussions. Next follow-up date is **mandatory**.
  4. `WARM`: Qualified client showing verified interest. Proposal or preliminary BOQ being prepared.
  5. `HOT`: High buying intent, shortlisted, proposal submitted. Triggers manager visibility.
  6. `COLD`: Prospect not proceeding immediately; requires explicit reason and scheduled future nurturing date.
  7. `JUNK`: Disqualified, duplicate, spam, or out-of-scope; requires reason.
  8. `WON`: Opportunity successfully secured; triggers conversion to Project.
  9. `LOST`: Closed without conversion; mandatory reason required for analysis.

### High Risk Flag (`high_risk`)
- **Definition**: A discrete attribute (NOT a pipeline stage) indicating critical engineering complexity, tight authority deadlines, commercial dispute risk, or payment exposure.
- **Fields**: Boolean flag `high_risk`, `risk_type`, `risk_mitigation`. Highlighted with red badge across Kanban and table views.

### Next Follow-up SLA (`next_followup_at`)
- **Definition**: The agreed date and time for the next touchpoint. Mandatory for all active leads (`UNDER_FOLLOW_UP`, `WARM`, `HOT`).
- **Overdue Rule**: If `next_followup_at < today`, visual warning badge surfaces on Kanban card and dashboard.

---

## 3. Operations & Projects

### Project (`projects` table)
- **Definition**: The operational delivery phase initiated immediately when a Lead is marked `WON`.
- **Tenant-Specific Workflows**:
  - **Goldland**: Authority Submission → DDA/DM/DCD/Nakheel Review → Technical Revisions → Site Inspection → Approval Certificate.
  - **Abbadi Tech**: Site Survey → Detailed BOQ → DEWA Load Enhancement / Approvals → MEP Execution → Commissioning & Handover.
  - **Casavera Interiors**: 3D Concept & Moodboard → Client Approval → Turnkey Joinery/Fit-out → Snagging → Handover.

### Task (`tasks` table)
- **Definition**: An actionable assignment given to an employee, optionally linked to a Lead, Project, or Customer Organization.
- **Attributes**: Priority (`low`, `normal`, `high`, `urgent`), Due date, Checklist, Reminders, and Escalation.

---

## 4. Employee Engagement & Recognition

### Balanced Contribution Score
- **Definition**: Objective, outcome-based monthly evaluation model designed for fair recognition (not keystroke or message surveillance).
- **Weighting**:
  - **Quality & Outcomes (35%)**: Accepted deliverables, zero-rework authority submissions, successful handover inspections.
  - **Task Ownership & Delivery (25%)**: On-time completion, proactive deadline management.
  - **Collaboration & Cross-Team Service (15%)**: Handovers between sales, engineering, and site teams.
  - **Reliability (15%)**: Commitment follow-through and SLA adherence.
  - **Learning & Continuous Improvement (10%)**: Process documentation, knowledge sharing, technical certifications.
