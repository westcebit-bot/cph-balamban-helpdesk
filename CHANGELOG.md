# Changelog - CPH-Balamban IT Helpdesk Ticketing System

All notable changes to the Cebu Provincial Hospital – Balamban IT Helpdesk system are documented here.

## [2.0.0] - 2026-09-23

### Added
- **Phase 1: Foundation & RBAC Architecture**
  - Vite React + TypeScript project scaffolding with Tailwind CSS.
  - Full PostgreSQL schema migration (`supabase/migrations/01_schema.sql`).
  - AuthContext supporting 4 roles: System Admin, IT Technician, Department Head / Supervisor, and Hospital Employee.
  - Interactive top-bar role switcher for evaluation.

- **Phase 2: Ticket Submission & Workflow Engine**
  - Atomic ticket sequence generator (`CPH-IT-2026-00001`).
  - New IT Ticket submission form with RA 10173 privacy warning box.
  - Configurable categories, subcategories, device types, and priority matrix.
  - Interactive visual ticket timeline displaying audit history, status changes, and troubleshooting notes.

- **Phase 3: IT Staff Assignment & Workspace**
  - Dedicated Technician Workspace with availability toggles (Available / Busy / Unavailable).
  - Unassigned queue intake with 1-click accept action.
  - Status transitions (`NEW` ➔ `OPEN` ➔ `ASSIGNED` ➔ `IN PROGRESS` ➔ `ON HOLD` ➔ `RESOLVED` ➔ `CLOSED`).
  - Mandatory on-hold reasons and resolution summaries.

- **Phase 4: Executive Dashboards & SLA Monitoring**
  - Real-time SLA engine evaluating response and resolution target countdowns.
  - Admin Executive Dashboard with Recharts graphs (Status breakdown, Priority distribution, Department incidents, Technician Workload).

- **Phase 5: IT Asset Registry & Reports**
  - IT Asset Registry tracking workstations, PhilHealth/iHOMIS terminals, printers, and network switches.
  - Incident repair history linked per asset tag.
  - 12 exportable/printable reports with official CPH-Balamban headers and CSV export.

- **Phase 6: Audit & Deployment Readiness**
  - Security audit logs tracking user authentication and ticket modifications.
  - `vercel.json` SPA routing setup.
  - Complete `.env.example` and `README.md` setup documentation.
