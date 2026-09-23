# Cebu Provincial Hospital – Balamban (CPH-Balamban)
## IT Helpdesk Ticketing System & ITSM Platform

![CPH-Balamban IT Helpdesk](https://img.shields.io/badge/System-CPH--Balamban%20IT%20Helpdesk-0284c7?style=for-the-badge)
![Data Privacy Act RA 10173](https://img.shields.io/badge/Compliance-RA%2010173%20Data%20Privacy-emerald?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Hosting-Vercel%20%2B%20Supabase-purple?style=for-the-badge)

---

## 📌 Executive Overview

The **CPH-Balamban IT Helpdesk Ticketing System** is a full-stack, enterprise-grade web application tailored for **Cebu Provincial Hospital – Balamban (CPH-Balamban), Cebu, Philippines**. 

It allows hospital employees to submit IT-related problems online (workstations, iHOMIS+, PhilHealth eClaims, printers, switches, network outages) and empowers the hospital IT staff to manage, assign, prioritize, troubleshoot, and resolve issues under strict ITIL incident management guidelines and customizable SLA countdown timers.

---

## 🚀 Key Features

* **Hospital Branding & Compliance**: Customized branding for Cebu Provincial Hospital – Balamban with prominent Data Privacy Act of 2012 (RA 10173) warning notices.
* **Role-Based Access Control (RBAC)**:
  * **System Admin**: Full control over users, departments, categories, SLAs, audit logs, and settings.
  * **IT Helpdesk Technician**: Dedicated workspace, unassigned queue intake, ticket acceptance, troubleshooting notes, escalation, and resolution sign-offs.
  * **Department Head / Supervisor**: Department incident monitoring, department summary analytics, resolution confirmation, and reopen permissions.
  * **Hospital Employee / Requester**: Streamlined ticket submission, real-time status tracker, comment feed, attachment upload.
* **Atomic Ticket Number Generator**: Auto-generates unique ticket IDs (`CPH-IT-2026-00001`) safely avoiding race conditions.
* **SLA Engine**: Real-time response and resolution countdown timers (Critical 15m, High 30m, Medium 4h, Low 8h) with breach detection.
* **IT Asset Registry**: Comprehensive hospital IT hardware asset tracking with linked incident repair histories.
* **Executive Dashboards & Recharts**: Visual status breakdowns, priority distribution, department trends, and technician workload graphs.
* **12 Official Reports**: Daily, Weekly, Monthly, Quarterly, Annual, Department, Category, Priority, Tech Performance, SLA Compliance, Pending Tickets, and IT Asset History with printable official headers and CSV export.
* **Dual-Mode Backend Engine**: Connects natively to Supabase PostgreSQL database; seamlessly operates with an enriched client-side store when credentials are omitted for instant evaluation.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite) + TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Charts**: Recharts
* **Backend & DB**: Supabase (PostgreSQL, Realtime, Auth, Storage)
* **Form Validation**: React Hook Form + Zod
* **Deployment**: Vercel & GitHub Integration

---

## 💻 Local Setup & Installation

### Prerequisites
* **Node.js**: v18+ or v24+
* **npm**: v9+ or v11+

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-org/cph-balamban-helpdesk.git
   cd cph-balamban-helpdesk
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Supabase URL and Anon Key:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Database Migrations (Supabase)**:
   * Open your Supabase Project SQL Editor.
   * Paste and execute the contents of `supabase/migrations/01_schema.sql`.

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ☁️ Vercel Deployment Guide

1. Push your repository to **GitHub**.
2. Connect your GitHub repository to **Vercel**.
3. In Vercel Project Settings ➔ Environment Variables, configure:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Set Build Command: `npm run build` and Output Directory: `dist`.
5. Deploy! Vercel will automatically build and publish your application.

---

## 🔒 Security & Data Privacy (RA 10173)

* **No Sensitive Patient Data**: The system explicitly warns users against entering patient names, medical records (MRN), or clinical chart details.
* **Row Level Security (RLS)**: Enforces departmental and role boundaries at the database level.
* **Immutable Audit Trail**: All authentication, status modifications, assignments, and resolution notes are logged in `audit_logs`.

---

## 📄 License & Attribution

Developed for **Cebu Provincial Hospital – Balamban (CPH-Balamban), Cebu, Philippines**.  
All rights reserved © 2026.
