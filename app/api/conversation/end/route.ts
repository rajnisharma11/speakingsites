import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.BACKEND_EMBED_API_KEY;
  if (!backendUrl || !apiKey) {
    return NextResponse.json(
      { error: "BACKEND_URL or BACKEND_EMBED_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  const incoming = await request.formData();
  const sessionId = incoming.get("session_id");
  if (typeof sessionId !== "string" || sessionId === "") {
    return NextResponse.json(
      { error: "session_id is required" },
      { status: 400 },
    );
  }

  const forward = new FormData();
  forward.append("api_key", apiKey);
  forward.append("session_id", sessionId);

  const transcript = incoming.get("transcript");
  if (typeof transcript === "string") {
    forward.append("transcript", transcript);
  }
  for (const field of ["visitor_name", "visitor_email", "visitor_phone"]) {
    const v = incoming.get(field);
    if (typeof v === "string" && v !== "") {
      forward.append(field, v);
    }
  }
  const audio = incoming.get("audio");
  if (audio instanceof Blob && audio.size > 0) {
    const name = audio instanceof File ? audio.name : "conversation.webm";
    forward.append("audio", audio, name);
  }

  const upstream = await fetch(
    backendUrl.replace(/\/+$/, "") + "/api/widget/conversation/end",
    {
      method: "POST",
      body: forward,
      cache: "no-store",
    },
  );

  const json = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(
      { error: json.error ?? "Backend end request failed", upstream: json },
      { status: upstream.status },
    );
  }

  return NextResponse.json(json);
}
