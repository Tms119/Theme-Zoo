import { Resend } from 'resend';
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const convex = new ConvexHttpClient((process.env.NEXT_PUBLIC_CONVEX_URL || '').replace('.site', '.cloud'));

// ─── Config ─────────────────────────────────────────────────────
const OWNER_EMAIL   = process.env.CONTACT_EMAIL ?? 'hello@themezoo.dev';
const FROM_ADDRESS  = process.env.FROM_EMAIL    ?? 'Themes Zoo <hello@themeszoo.com>';
const SITE_NAME     = 'Themes Zoo';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, projectType, budget, message } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!name || !email || !message) {
      return Response.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // ── 1. Store in Convex DB ───────────────────────────────────
    try {
      await convex.mutation(api.contacts.create, {
        name,
        email,
        project_type: projectType,
        budget,
        message
      });
    } catch (dbErr) {
      console.error('[contact/route] Failed to save to Convex:', dbErr);
      // We continue anyway so they at least get the email
    }

    // ── 2. Notify the owner ─────────────────────────────────────
    await resend.emails.send({
      from: FROM_ADDRESS,
      to:   OWNER_EMAIL,
      replyTo: email,
      subject: `🛠 New Custom Order Request from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #07070f; color: #e8e9f0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a0a2e 0%, #0d0d1e 100%); padding: 32px 40px; border-bottom: 1px solid rgba(139,92,246,0.2);">
            <p style="margin:0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #8b5cf6;">New Enquiry</p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 900; color: #fcfcfd; letter-spacing: -0.5px;">Custom Website Order</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px 40px;">
            
            <!-- Client Info -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #6b6f7b; font-weight: 600; width: 130px;">Name</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; color: #fcfcfd; font-weight: 700;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #6b6f7b; font-weight: 600;">Email</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; color: #8b5cf6;"><a href="mailto:${email}" style="color: #8b5cf6; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #6b6f7b; font-weight: 600;">Project Type</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; color: #06b6d4; font-weight: 700;">${projectType ?? 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #6b6f7b; font-weight: 600;">Budget Range</td>
                <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px; color: #10b981; font-weight: 700;">${budget ?? 'Not specified'}</td>
              </tr>
            </table>

            <!-- Message -->
            <div style="background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #6b6f7b;">Project Description</p>
              <p style="margin: 0; font-size: 14px; color: #c5c7d0; line-height: 1.7; white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>

            <!-- CTA -->
            <div style="margin-top: 28px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Your Custom Website Enquiry" style="display: inline-block; padding: 12px 28px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 14px;">Reply to ${name}</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b6f7b;">${SITE_NAME} · Custom Order System · ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>
      `,
    });

    // ── 3. Auto-reply to the customer ───────────────────────────
    await resend.emails.send({
      from: FROM_ADDRESS,
      to:   email,
      subject: `We received your request, ${name.split(' ')[0]}! 👋`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #07070f; color: #e8e9f0; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06);">
          
          <div style="background: linear-gradient(135deg, #1a0a2e 0%, #0d0d1e 100%); padding: 32px 40px; border-bottom: 1px solid rgba(139,92,246,0.2);">
            <p style="margin:0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #8b5cf6;">${SITE_NAME}</p>
            <h1 style="margin: 8px 0 0; font-size: 24px; font-weight: 900; color: #fcfcfd;">Thanks for reaching out!</h1>
          </div>

          <div style="padding: 32px 40px;">
            <p style="font-size: 15px; color: #c5c7d0; line-height: 1.7; margin: 0 0 20px;">
              Hi <strong style="color: #fcfcfd;">${name.split(' ')[0]}</strong>,<br><br>
              We've received your custom website enquiry and will get back to you within <strong style="color: #10b981;">24–48 hours</strong> with a tailored quote and timeline.
            </p>

            <!-- Summary card -->
            <div style="background: rgba(139,92,246,0.06); border: 1px solid rgba(139,92,246,0.2); border-radius: 14px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 12px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #8b5cf6;">Your Enquiry Summary</p>
              <p style="margin: 4px 0; font-size: 13px; color: #c5c7d0;"><span style="color: #6b6f7b; min-width: 110px; display: inline-block;">Project Type:</span> ${projectType ?? '—'}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #c5c7d0;"><span style="color: #6b6f7b; min-width: 110px; display: inline-block;">Budget:</span> ${budget ?? '—'}</p>
            </div>

            <p style="font-size: 14px; color: #6b6f7b; line-height: 1.6;">
              In the meantime, feel free to browse our <a href="https://themezoo.dev/templates" style="color: #8b5cf6; text-decoration: none;">template collection</a> for inspiration.
            </p>
          </div>

          <div style="padding: 20px 40px; border-top: 1px solid rgba(255,255,255,0.04); text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #6b6f7b;">${SITE_NAME} · Premium Web Templates & Custom Development</p>
          </div>
        </div>
      `,
    });

    return Response.json({ success: true, message: 'Your enquiry has been sent!' });

  } catch (err) {
    console.error('[contact/route] Error:', err);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
