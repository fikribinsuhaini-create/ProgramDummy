import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zone = (searchParams.get("zone") ?? "SGR01").toUpperCase();
  const period = (searchParams.get("period") ?? "today").toLowerCase();

  // Note: direct e-solat (JAKIM) endpoints often return CloudFront 403 in many environments.
  // We use solat.my API which sources data from JAKIM e-Solat and exposes stable JSON.
  const url =
    period === "today"
      ? `https://solat.my/api/daily/${encodeURIComponent(zone)}`
      : `https://solat.my/api/${encodeURIComponent(period)}/${encodeURIComponent(zone)}`;

  const upstream = await fetch(url, { cache: "no-store" });

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, status: upstream.status, statusText: upstream.statusText },
      { status: 502 }
    );
  }

  const json = await upstream.json();
  return NextResponse.json({ ok: true, data: json }, { status: 200 });
}
