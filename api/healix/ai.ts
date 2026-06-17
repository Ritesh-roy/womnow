// Vercel serverless function — runs on Vercel only (not in Lovable preview SPA).
// Path: POST /api/healix/ai

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT =
  "You are HEALIX AI, a clinical reasoning assistant for licensed clinicians. " +
  "Be concise, evidence-based, and always remind that you are an AI assistant — not a substitute for clinical judgement. " +
  "Format responses with short paragraphs and bullet lists where appropriate.";

async function callGemini(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
    encodeURIComponent(apiKey);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    console.error("[healix/ai] Gemini error", res.status, raw.slice(0, 500));
    throw new Error(`Gemini ${res.status}: ${raw.slice(0, 300)}`);
  }
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`Gemini returned non-JSON: ${raw.slice(0, 200)}`);
  }
  const reply =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text ?? "").join("") ?? "";
  return reply || "(empty response from model)";
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("[healix/ai] handler invoked. has GEMINI_API_KEY:", Boolean(apiKey));

  let body: {
    messages?: ChatMessage[];
    sessionId?: string;
    userId?: string | null;
    userEmail?: string | null;
  } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ reply: "Invalid JSON body" }, { status: 400 });
  }

  if (!apiKey) {
    const msg = "GEMINI_API_KEY is not set in Vercel environment variables.";
    console.error("[healix/ai]", msg);
    return Response.json({ reply: msg, error: msg }, { status: 500 });
  }

  const messages = body.messages ?? [];
  const sessionId = body.sessionId || "anonymous";
  const userMessage =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  try {
    const reply = await callGemini(apiKey, messages);
    console.log("[healix/ai] Gemini reply length:", reply.length);

    // Persist to Supabase. Failures here must not break the chat.
    try {
      const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supaKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (supaUrl && supaKey) {
        const insertRes = await fetch(`${supaUrl}/rest/v1/healix_conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supaKey,
            Authorization: `Bearer ${supaKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: body.userId ?? null,
            user_email: body.userEmail ?? null,
            session_id: sessionId,
            user_message: userMessage,
            ai_response: reply,
          }),
        });
        if (!insertRes.ok) {
          const t = await insertRes.text();
          console.error("[healix/ai] supabase insert failed", insertRes.status, t.slice(0, 300));
        } else {
          console.log("[healix/ai] stored conversation row");
        }
      } else {
        console.warn("[healix/ai] Supabase env vars missing; skipping persist");
      }
    } catch (logErr) {
      console.error("[healix/ai] supabase insert threw", logErr);
    }

    return Response.json({ reply });
  } catch (err) {
    const message = (err as Error).message;
    console.error("[healix/ai] FAILED:", message);
    return Response.json({ reply: `AI request failed: ${message}`, error: message }, { status: 500 });
  }
}

export const config = { runtime: "edge" };