# Domain Docs

## Layout: single-context

This repo uses a single context layout with one `GLOSSARY.md` at the repo root and ADRs in `docs/adr/`.

### GLOSSARY.md

The canonical domain model and glossary living at `GLOSSARY.md` at the repo root. Defines the ubiquitous language for the multi-company Group CRM workspace.

### ADRs

Architecture Decision Records live in `docs/adr/`. Each ADR follows the format:
- Title
- Status
- Context
- Decision
- Consequences

### Consumer Rules

- Engineering skills (`to-spec`, `to-tickets`, `triage`) read from `GLOSSARY.md` and `docs/adr/` for terminology consistency.
- When referencing tenants, use: Goldland, Abbadi Tech, Casavera (or `goldland`, `abbadi`, `casavera` as internal codes).
- When referencing companies (customers), use the `companies` table - labeled as "Organizations" or "Clients" in the UI to distinguish from operating companies.
- Role groups for employee contribution scoring: draftsman, sales, site engineer, accountant, HR, admin, IT, designer, marketing.