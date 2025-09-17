import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ ok: false, error: "invalid_content_type" }, { status: 415 });
    }
    const body = await req.json();
    const event = String(body?.event || "").slice(0, 64);
    const locale = String(body?.locale || "en").slice(0, 8);
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : {};
    if (!event) return NextResponse.json({ ok: false, error: "missing_event" }, { status: 400 });

    console.log("analytics:event", { event, locale, meta, ts: new Date().toISOString(), ua: req.headers.get("user-agent") || undefined });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analytics:error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
