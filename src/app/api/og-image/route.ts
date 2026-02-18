import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_KB = 500; // WhatsApp limit ~600KB, we target 500KB to be safe

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow URLs from our domain or Supabase storage
  const allowedHosts = [
    'techcentre.co',
    'www.techcentre.co',
    'localhost',
    'jyrtclndzwhslfydadna.supabase.co',
  ];
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }
  const isAllowed = allowedHosts.some(
    (h) => parsedUrl.hostname === h || parsedUrl.hostname.endsWith('.' + h)
  );
  if (!isAllowed) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TechCentre-OG-Bot/1.0' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }
    const buffer = Buffer.from(await res.arrayBuffer());

    let output = await sharp(buffer)
      .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    // If still too large, reduce quality
    let quality = 80;
    while (output.length > MAX_KB * 1024 && quality > 40) {
      quality -= 10;
      output = await sharp(buffer)
        .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'center' })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }

    return new NextResponse(output, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err) {
    console.error('OG image error:', err);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}
