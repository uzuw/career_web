import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the Python FastAPI RAG service, so the browser never
// talks to :8000 directly (avoids CORS + keeps the service internal).
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL ?? "http://localhost:8000/chat";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(CHAT_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { answer: "The guidance service is currently unavailable.", sources: [] },
        { status: 200 }
      );
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { answer: "The guidance service is currently unavailable.", sources: [] },
      { status: 200 }
    );
  }
}
