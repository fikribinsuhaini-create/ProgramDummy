import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const svgPath = join(process.cwd(), "src", "my.svg");
  const svg = await readFile(svgPath, "utf8");
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

