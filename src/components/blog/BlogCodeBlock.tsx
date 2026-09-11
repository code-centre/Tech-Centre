import { Children, isValidElement, type ReactNode } from 'react';
import { languageFromClassName, languageLabel } from '@/lib/blog/codeLanguage';

function classNameFromChildren(children: ReactNode): string | undefined {
  const child = Children.toArray(children).find((node) => isValidElement(node));
  if (!isValidElement<{ className?: string | string[] }>(child)) return undefined;
  return child.props.className;
}

interface BlogCodeBlockProps {
  children?: ReactNode;
}

export default function BlogCodeBlock({ children }: BlogCodeBlockProps) {
  const language = languageFromClassName(classNameFromChildren(children));

  return (
    <figure className={language ? 'blog-code-block has-language' : 'blog-code-block'}>
      {language ? (
        <figcaption>
          <span className="blog-code-lang">{languageLabel(language)}</span>
        </figcaption>
      ) : null}
      <pre>{children}</pre>
    </figure>
  );
}
