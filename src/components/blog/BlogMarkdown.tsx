import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import BlogCodeBlock from '@/components/blog/BlogCodeBlock';

const markdownComponents: Components = {
  h1: ({ children }) => <h2>{children}</h2>,
  pre: ({ children }) => <BlogCodeBlock>{children}</BlogCodeBlock>,
  img: ({ src, alt }) => {
    if (!src || typeof src !== 'string') return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-lg my-4 block"
        style={{ maxWidth: '100%', height: 'auto' }}
        loading="lazy"
      />
    );
  },
  a: ({ href, children }) => {
    const external = typeof href === 'string' && /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        {...(external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {children}
      </a>
    );
  },
};

interface BlogMarkdownProps {
  content: string;
}

export default function BlogMarkdown({ content }: BlogMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
}
