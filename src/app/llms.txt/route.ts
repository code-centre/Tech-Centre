import { createClient } from '@/lib/supabase/route-handler';
import { NextResponse } from 'next/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techcentre.co';

export async function GET() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const lines: string[] = [];

  // File groups: Blog section with links
  if (posts && posts.length > 0) {
    lines.push('## Blog');
    lines.push('');
    for (const post of posts) {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const desc = post.excerpt?.trim() || post.title;
      lines.push(`- [${post.title}](${url}): ${desc}`);
    }
    lines.push('');
  }

  // Supporting context
  lines.push('Tech Centre es el centro de tecnología del Caribe. Ofrecemos programas de formación en tecnología, desarrollo de software y habilidades digitales en Barranquilla, Colombia.');
  lines.push('');
  lines.push('> Centro de tecnología del Caribe. Formamos a los profesionales tech del futuro con programas prácticos, actualizados y de vanguardia. Educación tecnológica de calidad en Barranquilla, Colombia.');
  lines.push('');
  lines.push('# Tech Centre');

  const content = lines.join('\n');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
