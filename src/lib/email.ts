import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOtpEmail(to: string, code: string) {
  try {
    const result = await resend.emails.send({
      from: "NovaFlow <onboarding@novaflowpro.online>",
      to,
      subject: "Verify your NovaFlow account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px;">NovaFlow Security</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">Verification code for your account</p>
          </div>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px;">Your 6-Digit Code</div>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: monospace; color: #0284c7;">${code}</div>
          </div>
          
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 16px;">
            This single-use code will expire in <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.
          </p>
          
          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center;">
            Sent by NovaFlow Automated Identity System • novaflowpro.online
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.warn("Resend email delivery warning:", result.error)
    }

    return { success: !result.error, data: result.data, error: result.error }
  } catch (err: any) {
    console.error("sendOtpEmail exception:", err?.message || err)
    return { success: false, error: err?.message || "Failed to send email" }
  }
}

export async function sendPasswordResetEmail(to: string, code: string) {
  try {
    const result = await resend.emails.send({
      from: "NovaFlow <onboarding@novaflowpro.online>",
      to,
      subject: "Reset your NovaFlow password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px;">NovaFlow Password Reset</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">Use the code below to reset your password</p>
          </div>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px;">Your 6-Digit Reset Code</div>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: monospace; color: #0284c7;">${code}</div>
          </div>
          
          <p style="font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 16px;">
            This security code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please secure your account immediately.
          </p>
          
          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center;">
            Sent by NovaFlow Automated Identity System • novaflowpro.online
          </div>
        </div>
      `,
    })

    if (result.error) {
      console.warn("Resend password reset delivery warning:", result.error)
    }

    return { success: !result.error, data: result.data, error: result.error }
  } catch (err: any) {
    console.error("sendPasswordResetEmail exception:", err?.message || err)
    return { success: false, error: err?.message || "Failed to send email" }
  }
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  tempPassword?: string
) {
  try {
    const result = await resend.emails.send({
      from: "NovaFlow <onboarding@novaflowpro.online>",
      to,
      subject: `You've been invited to join ${workspaceName} on NovaFlow`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Workspace Invitation</h2>
          <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin: 0 0 16px;">
            <strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> CRM workspace as a <strong>${role}</strong>.
          </p>
          ${
            tempPassword
              ? `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px;">
              <p style="margin: 0 0 6px 0; color: #374151;"><strong>Login Email:</strong> ${to}</p>
              <p style="margin: 0; color: #374151;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>
          `
              : ""
          }
          <a href="https://novaflowpro.online/login" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 600;">Sign In to NovaFlow</a>
          <div style="border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center;">
            Sent by NovaFlow Workspace Collaborations • novaflowpro.online
          </div>
        </div>
      `,
    })

    return { success: !result.error, error: result.error }
  } catch (err: any) {
    console.error("sendInviteEmail exception:", err?.message || err)
    return { success: false, error: err?.message || "Failed to send invite email" }
  }
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const result = await resend.emails.send({
      from: "NovaFlow <onboarding@novaflowpro.online>",
      to,
      subject,
      html,
    })
    return { success: !result.error, error: result.error }
  } catch (err: any) {
    console.error("sendEmail exception:", err?.message || err)
    return { success: false, error: err?.message || "Failed to send email" }
  }
}