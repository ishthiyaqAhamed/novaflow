# NovaFlow CRM 🚀

A modern, multi-tenant B2B SaaS CRM built with **Next.js 16 (App Router)**, **Supabase PostgreSQL**, **Prisma ORM 7**, and an **OpenAI GPT-4o CRM Copilot**.

NovaFlow gives sales teams and founders an all-in-one workspace to manage pipeline deals, track stakeholder relationships, automate follow-up tasks, collaborate with invited teammates, and interact with a live AI assistant that understands their real-time CRM telemetry.

---

## ✨ Features & Capabilities

### 🏢 1. True Multi-Tenant SaaS Architecture
- **Dedicated Workspaces**: Every user who signs up automatically receives an isolated workspace (`Workspace` & `WorkspaceMember`).
- **Complete Data Isolation**: Deals, contacts, accounts, tasks, and activity logs are strictly scoped by `workspaceId`.
- **Team Collaboration**: Invite colleagues by email into your workspace and assign roles (`OWNER`, `ADMIN`, `MEMBER`).

### 🤖 2. Nova AI Copilot (OpenAI GPT-4o)
- **Context-Aware Assistant**: Floating AI copilot available across all CRM views (`Ask Nova AI`).
- **Real-Time Workspace RAG**: Nova AI queries live database records to answer questions about:
  - Active pipeline value and deal breakdown by stage.
  - Urgent pending tasks and upcoming due dates.
  - Key decision-makers and high-revenue target accounts.
  - Actionable sales strategy to advance deals in Negotiation to `WON`.
- **Quick-Action Chips**: One-click prompts for pipeline summaries, hot deals, and daily priorities.

### 📊 3. Visual Deal Pipeline (Kanban Board)
- **Stage Management**: Track opportunities across 7 stages: `LEAD`, `QUALIFIED`, `DEMO`, `PROPOSAL`, `NEGOTIATION`, `WON`, and `LOST`.
- **Pipeline Analytics**: Real-time revenue metrics, win probabilities, and expected close dates.
- **Flexible Data Entry**: Modals support direct typing and autocomplete with auto-creation of missing companies and contacts on the fly.

### 👥 4. Contacts & Company Accounts
- **Contacts Directory**: Manage leads, active clients, and churned accounts with titles, phone numbers, and linked deals.
- **Company Accounts**: Track target organizations, domain websites, industry categories, employee sizes, and pipeline value.
- **CSV Bulk Import & Export**:
  - Download entire contact lists and company accounts to standard `.csv` spreadsheets.
  - Upload CSV files with live preview, schema validation, and automatic company linking.

### ✅ 5. Task Manager & Activity Log
- **Task Prioritization**: Organize action items with priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and due dates.
- **Entity Linking**: Connect tasks directly to specific deals or contacts.
- **Audit & Activity Stream**: Real-time logging of calls, meetings, notes, and deal stage changes.

### 🔐 6. Authentication & Security
- **Email OTP Verification**: 6-digit verification codes powered by Resend email delivery.
- **Password Recovery**: Complete forgot password and password reset flow using secure single-use OTP tokens.
- **Protected Sessions**: Secure HTTP-only cookies (`novaflow_session`).

### 🛡️ 7. Super Administrator Portal
- **Hardcoded System Admin**: Dedicated login portal at `/admin/login` restricted to system administrators.
- **Default Credentials**:
  - **Email**: `admin@novaflow.com`
  - **Password**: `admin@nova`
- **System Telemetry**:
  - Inspect user registrations and workspace accounts.
  - Monitor live OTP token dispatch streams and verification status.
  - Database latency and Resend email delivery health checks.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (Managed PostgreSQL)
- **ORM**: [Prisma ORM 7](https://www.prisma.io/) with `@prisma/adapter-pg` driver adapter
- **AI Engine**: [OpenAI API](https://platform.openai.com/) (`gpt-4o-mini`)
- **Email Delivery**: [Resend](https://resend.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Project Structure

```text
novaflow/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Workspace, Deal, Contact, Company, Task, etc.)
│   └── prisma.config.ts       # Prisma CLI configuration
├── src/
│   ├── app/
│   │   ├── (app)/             # Authenticated User Workspace routes
│   │   │   ├── dashboard/     # Executive dashboard & metrics
│   │   │   ├── deals/         # Kanban pipeline board
│   │   │   ├── contacts/      # Contacts directory + CSV import/export
│   │   │   ├── companies/     # Company accounts + CSV import/export
│   │   │   ├── tasks/         # Task queue and status board
│   │   │   ├── activities/    # Workspace activity stream
│   │   │   └── settings/      # Profile & Workspace Team Member Invites
│   │   ├── (auth)/            # User Authentication
│   │   │   ├── login/         # SaaS user login
│   │   │   ├── signup/        # New user registration & workspace provisioning
│   │   │   ├── verify-otp/    # Email OTP code verification
│   │   │   ├── forgot-password/ # Password reset OTP request
│   │   │   └── reset-password/  # Password reset submission
│   │   ├── admin/             # Dedicated Super Admin Portal
│   │   │   ├── login/         # Admin credential login
│   │   │   ├── (dashboard)/   # Admin overview, users, OTPs, and system health
│   │   │   ├── users/         # User account administration
│   │   │   ├── otps/          # Token inspection & status
│   │   │   └── system/        # Resend & Supabase telemetry
│   │   └── api/
│   │       └── ai/chat/       # OpenAI Nova AI Copilot endpoint
│   ├── components/
│   │   ├── ai/
│   │   │   └── AiChatbot.tsx  # Floating Nova AI Copilot widget
│   │   └── layout/
│   │       ├── AppSidebar.tsx # User CRM navigation sidebar
│   │       └── AppHeader.tsx  # Top bar with user profile
│   └── lib/
│       ├── ai.ts              # Workspace RAG context builder & OpenAI integration
│       ├── admin.ts           # Super Admin constants and email guards
│       ├── csv.ts             # RFC-4180 CSV parser and exporter
│       ├── db.ts              # Prisma Client singleton with PG driver adapter
│       ├── email.ts           # Resend email templates (OTP, reset, team invite)
│       ├── otp.ts             # 6-digit OTP generation and verification
│       └── session.ts         # User cookie session helpers
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.18+ or v20+
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) account or PostgreSQL database

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/ishthiyaqAhamed/novaflow.git
cd novaflow
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root with the following variables:

```env
# Supabase PostgreSQL Connection Strings
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Resend Email Delivery API Key
RESEND_API_KEY="re_your_resend_api_key"

# OpenAI API Key (for Nova AI Copilot)
OPENAI_API_KEY="sk-proj-your_openai_api_key"

# Optional: Custom Super Admin Credentials (defaults to admin@novaflow.com / admin@nova)
ADMIN_EMAIL="admin@novaflow.com"
ADMIN_PASSWORD="admin@nova"
```

### 4. Push Database Schema
Synchronize the Prisma models with your Supabase database:
```bash
npx prisma db push
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 Database Visual GUI (Prisma Studio)

To inspect and manage all tables and rows directly in your browser:
```bash
npx prisma studio
```
Access Prisma Studio at [http://localhost:5555](http://localhost:5555).

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Add the environment variables (`DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `OPENAI_API_KEY`, `ADMIN_PASSWORD`) under **Project Settings > Environment Variables**.
4. Set the build command to:
   ```bash
   prisma generate && next build
   ```
5. Deploy!

---

## 📄 License

This project is licensed under the MIT License.
