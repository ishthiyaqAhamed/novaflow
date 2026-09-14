"use client"

import { useActionState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { verifyOtp } from "./actions"
import Link from "next/link"

const initialState = { error: "" }

function VerifyOtpForm() {
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId") ?? ""
  const [state, formAction, pending] = useActionState(verifyOtp, initialState)

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-9 w-9 rounded-xl bg-ink text-paper flex items-center justify-center font-display font-bold text-lg shadow-sm">
            N
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-ink">NovaFlow</span>
        </div>
        <h1 className="text-xl font-bold text-ink">Verification Code</h1>
        <p className="text-xs text-muted mt-1">Enter the 6-digit code sent to your email</p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="userId" value={userId} />

        <div>
          <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="code">
            6-Digit Security Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            placeholder="123456"
            autoFocus
            className="w-full rounded-lg border border-border bg-paper px-3 py-3 text-center tracking-widest text-xl font-mono text-ink placeholder:text-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
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
          {pending ? "Verifying..." : "Verify & Continue to Admin"}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link href="/login" className="text-xs text-muted hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 selection:bg-accent/20">
      <Suspense fallback={<div className="text-xs text-muted">Loading verification...</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  )
}
