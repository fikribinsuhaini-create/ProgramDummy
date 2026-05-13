import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const upstream = await fetch("https://solat.my/api/locations", { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, status: upstream.status, statusText: upstream.statusText },
      { status: 502 }
    );
  }
  const json = await upstream.json();
  return NextResponse.json({ ok: true, data: json }, { status: 200 });
}
