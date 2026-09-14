"use client"

import { useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { resetPassword } from "./actions"
import { KeyRound, ArrowLeft, Lock } from "lucide-react"

const initialState = { error: "" }

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const [state, formAction, pending] = useActionState(resetPassword, initialState)

  return (
    <div className="w-full max-w-sm">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <span className="h-8 w-8 rounded-lg bg-ink text-paper flex items-center justify-center font-display font-bold text-lg shadow-sm">
            N
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">NovaFlow</span>
        </Link>
        <div className="mx-auto h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-3">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-ink">Set new password</h1>
        <p className="text-xs text-muted mt-1">
          Enter the 6-digit verification code sent to your email and your new password
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
            Account Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            placeholder="alex@company.com"
            required
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="code">
            6-Digit Reset Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            maxLength={6}
            placeholder="123456"
            required
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-center text-base tracking-widest font-mono font-bold text-ink placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="At least 8 characters"
            required
            minLength={8}
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-type password"
            required
            minLength={8}
            className="w-full rounded-lg border border-border bg-paper px-3 py-2 text-xs text-ink placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </div>

        {state?.error && (
          <div className="p-2.5 rounded-lg bg-alert/10 border border-alert/20 text-alert text-xs">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-ink text-paper py-2.5 text-xs font-semibold hover:bg-ink/90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {pending ? "Updating password..." : "Reset password"}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Request a new code
        </Link>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 selection:bg-accent/20">
      <Suspense fallback={<div className="text-xs text-muted">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
