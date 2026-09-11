import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
  strongDelimiter: '**',
  hr: '---',
});

turndown.addRule('strikethrough', {
  filter: (node) => {
    const name = node.nodeName.toLowerCase();
    return name === 'del' || name === 's' || name === 'strike';
  },
  replacement: (content) => `~~${content}~~`,
});

turndown.addRule('underline', {
  filter: (node) => node.nodeName.toLowerCase() === 'u',
  replacement: (content) => content,
});

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';
  return turndown
    .turndown(html)
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function toEditorMarkdown(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  const looksLikeHtml =
    /^<(?:p|div|h[1-6]|ul|ol|table|article|section|blockquote|figure|header|main|span|strong|em|br|img|hr)\b/i.test(
      trimmed
    ) && /<\/[a-z][\w:-]*>/i.test(trimmed);
  return looksLikeHtml ? htmlToMarkdown(raw) : raw;
}
