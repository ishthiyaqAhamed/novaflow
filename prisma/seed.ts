import "dotenv/config";
import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database with connection:", process.env.DATABASE_URL?.slice(0, 30) + "...");

  // Clean existing data
  await db.activityLog.deleteMany();
  await db.task.deleteMany();
  await db.deal.deleteMany();
  await db.contact.deleteMany();
  await db.company.deleteMany();
  await db.otpCode.deleteMany();
  await db.user.deleteMany();

  const hashedPassword = await bcrypt.hash("NovaFlow2026!", 10);

  // 1. Create Demo User
  const demoUser = await db.user.create({
    data: {
      name: "Alex Morgan",
      email: "demo@novaflow.com",
      password: hashedPassword,
      role: "ADMIN",
      title: "Head of Revenue",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+1 (555) 234-5678",
    },
  });

  const memberUser = await db.user.create({
    data: {
      name: "Elena Rostova",
      email: "elena@novaflow.com",
      password: hashedPassword,
      role: "MEMBER",
      title: "Senior Enterprise AE",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      phone: "+1 (555) 876-5432",
    },
  });

  // 2. Create Companies
  const stripe = await db.company.create({
    data: {
      name: "Stripe",
      domain: "stripe.com",
      industry: "Fintech & Payments",
      size: "5,000+ employees",
      phone: "+1 (888) 926-2289",
      address: "354 Oyster Point Blvd, South San Francisco, CA",
      website: "https://stripe.com",
      annualRevenue: 14000000000,
      ownerId: demoUser.id,
    },
  });

  const linear = await db.company.create({
    data: {
      name: "Linear",
      domain: "linear.app",
      industry: "Software & Productivity",
      size: "50-100 employees",
      phone: "+1 (415) 341-9920",
      address: "San Francisco, CA",
      website: "https://linear.app",
      annualRevenue: 45000000,
      ownerId: demoUser.id,
    },
  });

  const vercel = await db.company.create({
    data: {
      name: "Vercel",
      domain: "vercel.com",
      industry: "Cloud Infrastructure",
      size: "500-1000 employees",
      phone: "+1 (800) 555-0199",
      address: "440 N Barranca Ave, Covina, CA",
      website: "https://vercel.com",
      annualRevenue: 150000000,
      ownerId: memberUser.id,
    },
  });

  const figma = await db.company.create({
    data: {
      name: "Figma",
      domain: "figma.com",
      industry: "Design & Collaboration",
      size: "1,000-5,000 employees",
      phone: "+1 (415) 890-1122",
      address: "767 Market St, San Francisco, CA",
      website: "https://figma.com",
      annualRevenue: 600000000,
      ownerId: demoUser.id,
    },
  });

  const supabase = await db.company.create({
    data: {
      name: "Supabase",
      domain: "supabase.com",
      industry: "Developer Tools & Database",
      size: "100-250 employees",
      phone: "+1 (650) 441-2090",
      address: "Singapore & Remote",
      website: "https://supabase.com",
      annualRevenue: 30000000,
      ownerId: memberUser.id,
    },
  });

  // 3. Create Contacts
  const patrick = await db.contact.create({
    data: {
      name: "Patrick Collison",
      email: "patrick@stripe.com",
      phone: "+1 (415) 555-0143",
      title: "Chief Executive Officer",
      status: "ACTIVE",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      companyId: stripe.id,
      ownerId: demoUser.id,
    },
  });

  const karri = await db.contact.create({
    data: {
      name: "Karri Saarinen",
      email: "karri@linear.app",
      phone: "+1 (415) 555-0182",
      title: "Co-Founder & CEO",
      status: "ACTIVE",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      companyId: linear.id,
      ownerId: demoUser.id,
    },
  });

  const guillermo = await db.contact.create({
    data: {
      name: "Guillermo Rauch",
      email: "rauchg@vercel.com",
      phone: "+1 (415) 555-0199",
      title: "CEO & Founder",
      status: "ACTIVE",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      companyId: vercel.id,
      ownerId: memberUser.id,
    },
  });

  const dylan = await db.contact.create({
    data: {
      name: "Dylan Field",
      email: "dylan@figma.com",
      phone: "+1 (415) 555-0120",
      title: "CEO & Co-founder",
      status: "ACTIVE",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      companyId: figma.id,
      ownerId: demoUser.id,
    },
  });

  const paul = await db.contact.create({
    data: {
      name: "Paul Copplestone",
      email: "paul@supabase.com",
      phone: "+1 (650) 555-0177",
      title: "CEO & Co-founder",
      status: "LEAD",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      companyId: supabase.id,
      ownerId: memberUser.id,
    },
  });

  // 4. Create Deals across Kanban Stages
  const deal1 = await db.deal.create({
    data: {
      title: "Global Enterprise Billing Integration",
      value: 120000,
      stage: "PROPOSAL",
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      companyId: stripe.id,
      contactId: patrick.id,
      ownerId: demoUser.id,
    },
  });

  const deal2 = await db.deal.create({
    data: {
      title: "Linear Workspace Multi-team Upgrade",
      value: 48000,
      stage: "NEGOTIATION",
      probability: 90,
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      companyId: linear.id,
      contactId: karri.id,
      ownerId: demoUser.id,
    },
  });

  const deal3 = await db.deal.create({
    data: {
      title: "Next.js Cloud Edge Automation Suite",
      value: 85000,
      stage: "WON",
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      companyId: vercel.id,
      contactId: guillermo.id,
      ownerId: memberUser.id,
    },
  });

  const deal4 = await db.deal.create({
    data: {
      title: "Figma Enterprise Design Workflow Sync",
      value: 95000,
      stage: "DEMO",
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      companyId: figma.id,
      contactId: dylan.id,
      ownerId: demoUser.id,
    },
  });

  const deal5 = await db.deal.create({
    data: {
      title: "Supabase Realtime Cloud Cluster Pilot",
      value: 36000,
      stage: "QUALIFIED",
      probability: 40,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      companyId: supabase.id,
      contactId: paul.id,
      ownerId: memberUser.id,
    },
  });

  const deal6 = await db.deal.create({
    data: {
      title: "Inbound Pipeline Expansion Pilot",
      value: 24000,
      stage: "LEAD",
      probability: 20,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      companyId: linear.id,
      contactId: karri.id,
      ownerId: demoUser.id,
    },
  });

  // 5. Create Tasks
  await db.task.createMany({
    data: [
      {
        title: "Send updated security compliance pack to Stripe legal",
        description: "Review SOC-2 Type II audit report with Patrick's procurement team.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        priority: "URGENT",
        status: "TODO",
        dealId: deal1.id,
        contactId: patrick.id,
        ownerId: demoUser.id,
      },
      {
        title: "Finalize MSA and commercial terms with Karri",
        description: "Sync on annual billing discount and SLA tier.",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        priority: "HIGH",
        status: "IN_PROGRESS",
        dealId: deal2.id,
        contactId: karri.id,
        ownerId: demoUser.id,
      },
      {
        title: "Prepare live technical demo for Figma design ops",
        description: "Highlight Figma plugin token synchronization and API latency.",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: "MEDIUM",
        status: "TODO",
        dealId: deal4.id,
        contactId: dylan.id,
        ownerId: demoUser.id,
      },
      {
        title: "Schedule onboarding kickoff with Vercel team",
        description: "Welcome call and workspace configuration.",
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        priority: "LOW",
        status: "DONE",
        dealId: deal3.id,
        contactId: guillermo.id,
        ownerId: memberUser.id,
      },
    ],
  });

  // 6. Create Activity Logs
  await db.activityLog.createMany({
    data: [
      {
        type: "MEETING",
        note: "Executive demo with Patrick Collison. Highly impressed with multi-tenant pipeline velocity.",
        relatedType: "DEAL",
        relatedId: deal1.id,
        userId: demoUser.id,
      },
      {
        type: "STAGE_CHANGE",
        note: "Deal 'Linear Workspace Multi-team Upgrade' moved from PROPOSAL to NEGOTIATION.",
        relatedType: "DEAL",
        relatedId: deal2.id,
        userId: demoUser.id,
      },
      {
        type: "CALL",
        note: "Commercial alignment call with Karri Saarinen regarding multi-seat provisioning.",
        relatedType: "CONTACT",
        relatedId: karri.id,
        userId: demoUser.id,
      },
      {
        type: "NOTE",
        note: "Vercel contract fully executed. Deal marked as Closed Won ($85,000 ARR).",
        relatedType: "DEAL",
        relatedId: deal3.id,
        userId: memberUser.id,
      },
      {
        type: "EMAIL",
        note: "Sent technical architecture overview and latency benchmarks to Paul Copplestone.",
        relatedType: "CONTACT",
        relatedId: paul.id,
        userId: memberUser.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  });
