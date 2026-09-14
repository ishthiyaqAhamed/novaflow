import { db } from "@/lib/db"
import { AdminOtpsClient } from "./otps-client"

export default async function AdminOtpsPage() {
  const otps = await db.otpCode.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const serializedOtps = otps.map(o => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    expiresAt: o.expiresAt.toISOString(),
    consumedAt: o.consumedAt ? o.consumedAt.toISOString() : null,
  }))

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-16 border-b border-border bg-paper/80 backdrop-blur-xs px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div>
          <h1 className="text-base font-bold text-ink leading-tight">OTP Codes & Verification Security</h1>
          <p className="text-[11px] text-muted">Inspect active and consumed one-time security tokens sent to users.</p>
        </div>
      </header>

      <AdminOtpsClient initialOtps={serializedOtps} />
    </div>
  )
}
