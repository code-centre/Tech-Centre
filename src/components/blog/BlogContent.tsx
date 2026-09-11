import { looksLikeHtml } from '@/lib/blog/content';
import BlogHtmlContent from '@/components/blog/BlogHtmlContent';
import BlogMarkdown from '@/components/blog/BlogMarkdown';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div className="blog-prose blog-content overflow-x-hidden">
      {looksLikeHtml(content) ? (
        <BlogHtmlContent html={content} />
      ) : (
        <BlogMarkdown content={content} />
      )}
    </div>
  );
}
