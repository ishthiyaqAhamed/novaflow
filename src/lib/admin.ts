export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@novaflow.com").toLowerCase().trim()
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "NovaFlowAdmin2026!"
export const ADMIN_NAME = "Super Administrator"

export function isSystemAdminEmail(email: string): boolean {
  return email.toLowerCase().trim() === ADMIN_EMAIL
}
