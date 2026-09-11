import parse, { Element } from 'html-react-parser';

const STRIPPED_STYLE_PROPS = new Set([
  'color',
  'background-color',
  'background',
  'font-family',
  'font-size',
  'line-height',
]);

function sanitizeInlineStyle(style: string): string | undefined {
  const kept = style
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.split(':')[0]?.trim().toLowerCase();
      return prop ? !STRIPPED_STYLE_PROPS.has(prop) : false;
    });
  return kept.length ? kept.join(';') : undefined;
}

interface BlogHtmlContentProps {
  html: string;
}

export default function BlogHtmlContent({ html }: BlogHtmlContentProps) {
  return (
    <>
      {parse(html, {
        replace: (domNode) => {
          if (domNode instanceof Element && domNode.attribs) {
            if (domNode.name === 'img') {
              const { width: _w, height: _h, style: _s, ...rest } = domNode.attribs;
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  {...rest}
                  className="max-w-full h-auto rounded-lg my-4 block"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  loading="lazy"
                />
              );
            }
            if (domNode.attribs.style) {
              const cleaned = sanitizeInlineStyle(domNode.attribs.style);
              if (cleaned) domNode.attribs.style = cleaned;
              else delete domNode.attribs.style;
            }
          }
          return undefined;
        },
      })}
    </>
  );
}
