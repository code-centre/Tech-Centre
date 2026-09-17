import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

/**
 * Alias estable de la miniatura social por defecto.
 * LinkedIn, WhatsApp y crawlers cachean /og-image; servimos el JPEG estático
 * para no romper esas URLs ni forzar un redirect.
 */
export const dynamic = "force-static";

export async function GET() {
  const file = await readFile(join(process.cwd(), "public/og-image.jpg"));

  return new NextResponse(file, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
