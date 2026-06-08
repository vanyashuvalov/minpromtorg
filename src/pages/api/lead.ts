import type { APIRoute } from "astro";

export const prerender = false;

type LeadType = "consultation" | "quiz";

const recipients: Record<LeadType, string> = {
  consultation: "info@cer.moscow",
  quiz: "zapros@cer.moscow",
};

const subjects: Record<LeadType, string> = {
  consultation: "Заявка на консультацию с сайта ЦЭР",
  quiz: "Заявка по квизу/калькулятору с сайта ЦЭР",
};

const getRuntimeEnv = (locals: unknown) => {
  return (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env ?? import.meta.env;
};

const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const normalizeLeadType = (value: unknown): LeadType => {
  return value === "quiz" ? "quiz" : "consultation";
};

const formatPayload = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  return JSON.stringify(payload, null, 2);
};

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => null);
  const name = asText(body?.name);
  const phone = asText(body?.phone);
  const leadType = normalizeLeadType(body?.leadType);
  const source = asText(body?.source) || (leadType === "quiz" ? "Квиз/калькулятор" : "Консультация");
  const payload = formatPayload(body?.payload);

  if (!name || !phone) {
    return new Response(JSON.stringify({ error: "Name and phone are required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const env = getRuntimeEnv(locals);
  const resendApiKey = env.RESEND_API_KEY;
  const from = env.LEAD_MAIL_FROM || "ЦЭР <onboarding@resend.dev>";
  const to = recipients[leadType];
  const subject = subjects[leadType];
  const text = [
    subject,
    "",
    `Тип заявки: ${leadType === "quiz" ? "Квиз/калькулятор" : "Консультация"}`,
    `Источник: ${source}`,
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    payload ? "" : null,
    payload ? "Данные расчета:" : null,
    payload || null,
  ]
    .filter(Boolean)
    .join("\n");

  if (!resendApiKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "minpromtorg/1.0",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      reply_to: "info@cer.moscow",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    return new Response(JSON.stringify({ error: errorText || "Email provider error." }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
