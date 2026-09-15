const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

const outputPath = path.join(__dirname, "..", "NovaFlow_CRM_Interview_Guide.pdf")
const doc = new PDFDocument({
  size: "A4",
  margins: { top: 45, bottom: 45, left: 50, right: 50 },
  bufferPages: true,
})

const stream = fs.createWriteStream(outputPath)
doc.pipe(stream)

// Colors
const PRIMARY = "#0F172A" // Deep navy / slate
const ACCENT = "#6366F1" // Indigo
const SECONDARY = "#475569" // Muted slate
const BORDER = "#E2E8F0"
const LIGHT_BG = "#F8FAFC"
const HIGHLIGHT = "#10B981" // Emerald

function drawHeader(title, subtitle) {
  doc.rect(0, 0, doc.page.width, 90).fill(PRIMARY)
  doc.fillColor("#FFFFFF").fontSize(20).font("Helvetica-Bold").text("NovaFlow CRM — Interview & Architecture Guide", 50, 28)
  doc.fontSize(10).font("Helvetica").fillColor("#94A3B8").text("Full-Stack Multi-Tenant SaaS CRM with Next.js 16, Supabase, Prisma 7 & OpenAI GPT-4o", 50, 54)
  doc.moveDown(2)
  doc.y = 110
}

function addSectionTitle(title) {
  doc.moveDown(0.8)
  const y = doc.y
  doc.rect(50, y, 4, 16).fill(ACCENT)
  doc.fontSize(14).font("Helvetica-Bold").fillColor(PRIMARY).text(title, 60, y + 1)
  doc.moveDown(0.6)
}

function addSubSectionTitle(title) {
  doc.moveDown(0.4)
  doc.fontSize(11).font("Helvetica-Bold").fillColor(ACCENT).text(title)
  doc.moveDown(0.2)
}

function addBullet(title, text) {
  const y = doc.y
  doc.circle(55, y + 5, 2.5).fill(ACCENT)
  doc.fontSize(9.5).font("Helvetica-Bold").fillColor(PRIMARY).text(title + ": ", 64, y, { continued: true })
  doc.font("Helvetica").fillColor(SECONDARY).text(text, { lineGap: 2.5 })
  doc.moveDown(0.3)
}

function addBox(title, text, borderColor = ACCENT) {
  const y = doc.y
  doc.roundedRect(50, y, doc.page.width - 100, 65, 6).fillAndStroke(LIGHT_BG, BORDER)
  doc.fontSize(10).font("Helvetica-Bold").fillColor(PRIMARY).text(title, 62, y + 10)
  doc.fontSize(8.5).font("Helvetica").fillColor(SECONDARY).text(text, 62, y + 26, {
    width: doc.page.width - 124,
    lineGap: 2,
  })
  doc.y = y + 75
}

// ================= PAGE 1 =================
drawHeader()

addSectionTitle("1. Project Executive Summary")
doc.fontSize(9.5).font("Helvetica").fillColor(SECONDARY).text(
  "NovaFlow is a production-grade, multi-tenant B2B SaaS CRM engineered with Next.js 16 (App Router), TypeScript, Supabase PostgreSQL, Prisma ORM 7, and an integrated OpenAI GPT-4o CRM Copilot. It gives sales leaders and founders an all-in-one workspace to manage 7-stage visual deal pipelines, customer relationships, company accounts, priority task queues, and team collaboration with automated email invitations and real-time database telemetry.",
  { lineGap: 3 }
)

addSectionTitle("2. Technology Stack & Architectural Decisions")

addBullet("Next.js 16 (App Router & Turbopack)", "Server Components for instant data streaming, Server Actions for zero-API-boilerplate type-safe mutations, and dynamic route rendering.")
addBullet("TypeScript (Strict Mode)", "End-to-end type safety spanning database relations, server actions, CSV schema validation, and AI prompt context structures.")
addBullet("Supabase PostgreSQL & Prisma 7", "Utilizes @prisma/adapter-pg with persistent pg.Pool connection pooling for single-digit millisecond latency and optimized composite indexes.")
addBullet("OpenAI GPT-4o CRM Copilot", "Context-aware RAG pipeline injecting real-time CRM state (pipeline volume, urgent tasks, hot deals) into system prompts for automated executive recommendations.")
addBullet("Resend API", "Transactional email delivery for 6-digit verification codes, password recovery, and team workspace email invitations.")
addBullet("Tailwind CSS v4 & Lucide Icons", "Custom, responsive dark/light theme with mobile slide-over drawers, touch snap Kanban columns, and bespoke UI components.")

addSectionTitle("3. Core Functional Modules")
addBullet("True Multi-Tenancy", "Every account belongs to an isolated Workspace. All queries are strictly scoped by workspaceId, with role-based permissions (OWNER, ADMIN, MEMBER).")
addBullet("Kanban Sales Pipeline", "7 visual stages (Lead, Qualified, Demo, Proposal, Negotiation, Won, Lost) with real-time win probability calculations and revenue forecasting.")
addBullet("CSV Bulk Import/Export", "RFC-4180 compliant CSV parser and generator for Contacts and Company accounts with live preview and auto-entity resolution.")
addBullet("Super Admin Telemetry", "Restricted administrative portal (/admin/login) for live user inspection, OTP stream verification logs, and database health metrics.")

doc.addPage()

// ================= PAGE 2 =================
doc.rect(0, 0, doc.page.width, 35).fill(PRIMARY)
doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold").text("NovaFlow CRM — Interview Presentation Masterclass", 50, 12)
doc.y = 55

addSectionTitle("4. How to Explain This Project in an Interview")

addSubSectionTitle("A. The 60-Second Elevator Pitch (Start with this)")
addBox(
  "Elevator Pitch Script (Memorize / Deliver Confidently):",
  "\"I built NovaFlow, a production-grade multi-tenant B2B SaaS CRM using Next.js 16, TypeScript, Supabase PostgreSQL, and Prisma 7. The core innovation is a live OpenAI GPT-4o CRM Copilot that injects real-time database telemetry—like active pipeline value, deal stages, and overdue tasks—directly into prompt context to give founders instant executive insights. I also built a 7-stage Kanban board, custom CSV bulk import/export engine, passwordless email OTP verification, and a Super Admin observability portal.\""
)

addSubSectionTitle("B. Explaining the Architecture & Multi-Tenancy")
doc.fontSize(9.5).font("Helvetica").fillColor(SECONDARY).text(
  "When interviewers ask: \"How did you structure the architecture?\"\n" +
  "• Highlight Tenant Isolation: Explain that every data model (Deal, Contact, Company, Task, ActivityLog) contains a foreign key to Workspace. Middleware and session helpers (getCurrentUser) verify membership before executing any database mutation.\n" +
  "• Highlight Server Actions vs APIs: Mention that Next.js Server Actions handle form submissions and data updates directly on the server without needing boilerplate REST controllers, ensuring type safety from UI to DB.",
  { lineGap: 3 }
)

addSubSectionTitle("C. Explaining the Nova AI Copilot Integration")
doc.fontSize(9.5).font("Helvetica").fillColor(SECONDARY).text(
  "When interviewers ask: \"How does the AI feature work?\"\n" +
  "• Explain that rather than using a generic ChatGPT wrapper, NovaFlow implements a real-time CRM context builder (RAG). Before sending the user query to GPT-4o-mini, the backend aggregates top pipeline deals, pending high-priority tasks, and stakeholder summaries, structured as JSON in the system prompt. This allows the AI to answer specific questions like 'Which deals in negotiation should I close first?' with exact names and dollar values.",
  { lineGap: 3 }
)

doc.addPage()

// ================= PAGE 3 =================
doc.rect(0, 0, doc.page.width, 35).fill(PRIMARY)
doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold").text("NovaFlow CRM — Top Technical Questions & Answers", 50, 12)
doc.y = 55

addSectionTitle("5. Common Interview Questions & Winning Answers")

addSubSectionTitle("Q1: \"How did you handle database performance and connection latency?\"")
doc.fontSize(9).font("Helvetica").fillColor(SECONDARY).text(
  "Answer: \"Supabase uses connection pooling over AWS. Initially, unpooled queries created new SSL handshakes that added ~200ms per query. I solved this by configuring a shared pg.Pool inside @prisma/adapter-pg to reuse open TCP connections. Furthermore, I memoized user sessions across layout and page renders using React's cache() and added composite database indexes (like @@index([workspaceId, stage])) for instant B-tree lookups.\"",
  { lineGap: 2.5 }
)
doc.moveDown(0.5)

addSubSectionTitle("Q2: \"Why choose Next.js App Router over a separate React + Express backend?\"")
doc.fontSize(9).font("Helvetica").fillColor(SECONDARY).text(
  "Answer: \"Next.js App Router allowed me to eliminate client-side waterfall requests by rendering initial page data directly on the server (Server Components). It also provides built-in streaming, zero-bundle-size server utilities, and Server Actions that eliminate the need for redundant API client layers and DTO transformations while keeping full TypeScript type safety.\"",
  { lineGap: 2.5 }
)
doc.moveDown(0.5)

addSubSectionTitle("Q3: \"How is security and authentication handled?\"")
doc.fontSize(9).font("Helvetica").fillColor(SECONDARY).text(
  "Answer: \"I implemented a dual-layer security model: custom password hashing via bcryptjs with single-use 6-digit OTP verification codes sent through Resend API. Active sessions use secure, HTTP-only, SameSite cookies to protect against XSS and CSRF. System administration is strictly guarded by an isolated admin portal (/admin/login) with telemetry auditing.\"",
  { lineGap: 2.5 }
)
doc.moveDown(0.5)

addSubSectionTitle("Q4: \"What was the hardest bug or challenge you overcame?\"")
doc.fontSize(9).font("Helvetica").fillColor(SECONDARY).text(
  "Answer: \"During the Next.js production build phase, static page collection workers evaluated dynamic API modules before runtime environment variables were injected. I refactored the OpenAI client initialization to evaluate lazily only when a user requests a chat, and marked the endpoint as force-dynamic. This resolved CI/CD build worker crashes while maintaining high performance.\"",
  { lineGap: 2.5 }
)

// Footer on all pages
const totalPages = doc.bufferedPageRange().count
for (let i = 0; i < totalPages; i++) {
  doc.switchToPage(i)
  doc.fontSize(8).font("Helvetica").fillColor("#94A3B8").text(
    `NovaFlow CRM Interview Guide | Page ${i + 1} of ${totalPages}`,
    50,
    doc.page.height - 35,
    { align: "center", width: doc.page.width - 100 }
  )
}

doc.end()

stream.on("finish", () => {
  console.log("PDF generated successfully at:", outputPath)
})
