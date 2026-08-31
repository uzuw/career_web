import { NextRequest } from "next/server";

// Server-side proxy to the Python FastAPI RAG service, so the browser never
// talks to :8000 directly (avoids CORS + keeps the service internal).
// Streams the SSE bytes straight through to the client.
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL ?? "http://localhost:8000/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const upstream = await fetch(CHAT_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      // Non-streaming fallback so the UI still shows a graceful message.
      return new Response(
        `data: ${JSON.stringify({
          error: "The guidance service is currently unavailable.",
        })}\n\n`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    // Pass the SSE stream through untouched.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(
      `data: ${JSON.stringify({
        error: "The guidance service is currently unavailable.",
      })}\n\n`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      }
    );
  }
}
