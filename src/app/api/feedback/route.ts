import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";

const feedbackRequestSchema = z.object({
  title: z.string().min(3).max(80),
  body: z.string().min(10).max(4000),
  issueType: z.enum(["bug", "feature", "question", "other"]).optional(),
  userEmail: z.string().email().nullable().optional(),
});

function escapeHtml(str: string | null | undefined) {
  if (str == null) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = feedbackRequestSchema.safeParse(payload);
  if (!parsed.success) {
    if (!isProduction) {
      console.warn("Invalid feedback request", parsed.error.flatten());
    }
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 },
    );
  }

  const { title, body, issueType, userEmail } = parsed.data;

  // In development (and in production without RESEND_API_KEY), log feedback rather than fail hard.
  // This keeps local dev usable without requiring email credentials.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (isProduction) {
      console.error("Feedback submission failed: RESEND_API_KEY missing");
      return NextResponse.json(
        { ok: false, error: "Email service not configured" },
        { status: 500 },
      );
    }

    console.log("[feedback]", {
      title,
      body,
      issueType: issueType ?? "other",
      userEmail,
    });
    return NextResponse.json({ ok: true, delivered: false });
  }

  const resend = new Resend(apiKey);

  const to = ["support@tambo.co", "support@tambo.com"];
  const from =
    process.env.RESEND_EMAIL_FROM || "Strudel LM <noreply@strudellm.com>";

  const normalizedTitle = title.replace(/\s+/g, " ").trim();
  const subject = `StrudelLM feedback: ${normalizedTitle}`;

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
      <h2>${escapeHtml(title)}</h2>
      <p style="white-space: pre-wrap;">${escapeHtml(body)}</p>
      <hr />
      <p><strong>Issue type:</strong> ${escapeHtml(issueType ?? "other")}</p>
      <p><strong>User email:</strong> ${escapeHtml(userEmail ?? "(not provided)")}</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: userEmail ?? undefined,
    });
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("Failed to send feedback email", error);
    return NextResponse.json(
      { ok: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
