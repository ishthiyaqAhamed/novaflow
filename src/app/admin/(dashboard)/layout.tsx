import { getCurrentUser } from "@/lib/session"
import { isSystemAdminEmail } from "@/lib/admin"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

export const dynamic = "force-dynamic"

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN" || !isSystemAdminEmail(user.email)) {
    redirect("/admin/login")
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FBF9F5] text-ink font-sans selection:bg-accent/20">
      <AdminSidebar userName={user.name} />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}
