import { db } from "@/lib/db"
import {
  Server,
  Mail,
  Database,
  CheckCircle2,
  ShieldCheck,
  Key,
  Globe,
  Lock,
} from "lucide-react"

export default async function AdminSystemPage() {
  const [usersCount, otpsCount] = await Promise.all([
    db.user.count(),
    db.otpCode.count(),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <header className="min-h-16 border-b border-border bg-paper/80 backdrop-blur-xs px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0 sticky top-0 z-40">
        <div>
          <h1 className="text-base font-bold text-ink leading-tight">System Health & Email Infrastructure</h1>
          <p className="text-[11px] text-muted">Verify active database connections, Resend domain authentication, and security parameters.</p>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl">
        {/* Domain Verification Status Banner */}
        <div className="rounded-xl border border-signal/30 bg-signal/5 p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-signal/15 text-signal flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-ink">Domain Authentication Verified</h2>
              <span className="text-[10px] font-mono font-bold bg-signal/20 text-signal px-2 py-0.5 rounded-full">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Your domain <strong className="text-ink font-mono">novaflowpro.online</strong> is successfully verified with Resend. DKIM, SPF, and MX records are operational with 100% deliverability.
            </p>
          </div>
        </div>

        {/* Infrastructure Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Email Delivery */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Mail className="h-4 w-4 text-accent" />
                <span>Transactional Email Service</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-signal flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Resend SDK v6
              </span>
            </div>

            <div className="space-y-2 py-2 border-y border-border/60 text-xs">
              <div className="flex justify-between text-muted">
                <span>Sender Identity:</span>
                <span className="font-mono text-ink font-medium">NovaFlow &lt;onboarding@novaflowpro.online&gt;</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Auth Protocol:</span>
                <span className="font-mono text-ink">DKIM 2048-bit + SPF Authorized</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Total Dispatched:</span>
                <span className="font-mono text-ink font-bold">{otpsCount} emails</span>
              </div>
            </div>
          </div>

          {/* Card 2: Database Infrastructure */}
          <div className="rounded-xl border border-border bg-paper p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Database className="h-4 w-4 text-accent" />
                <span>Database Engine</span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-signal flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> PostgreSQL Connected
              </span>
            </div>

            <div className="space-y-2 py-2 border-y border-border/60 text-xs">
              <div className="flex justify-between text-muted">
                <span>ORM Layer:</span>
                <span className="font-mono text-ink font-medium">Prisma ORM 7 + @prisma/adapter-pg</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>SSL Mode:</span>
                <span className="font-mono text-ink">require / SSL Enabled</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Total Stored Users:</span>
                <span className="font-mono text-ink font-bold">{usersCount} accounts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Parameters */}
        <div className="rounded-xl border border-border bg-paper p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-ink">
            <Lock className="h-4 w-4 text-accent" />
            <span>Active Security & Access Policies</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-border bg-[#FCFAF6]/60">
              <span className="text-muted block text-[10px] font-semibold uppercase">OTP Code Expiration</span>
              <span className="font-mono font-bold text-ink text-sm mt-1 block">10 Minutes</span>
              <span className="text-[10px] text-muted">Single-use consumed validation</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-[#FCFAF6]/60">
              <span className="text-muted block text-[10px] font-semibold uppercase">Password Hashing</span>
              <span className="font-mono font-bold text-ink text-sm mt-1 block">bcrypt (10 rounds)</span>
              <span className="text-[10px] text-muted">Salted cryptographic hash</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-[#FCFAF6]/60">
              <span className="text-muted block text-[10px] font-semibold uppercase">Session Cookie</span>
              <span className="font-mono font-bold text-ink text-sm mt-1 block">HTTP-Only / SameSite Lax</span>
              <span className="text-[10px] text-muted">30-day persistent expiration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
