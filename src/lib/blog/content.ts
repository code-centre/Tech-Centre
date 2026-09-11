const HTML_BLOCK_START =
  /^<(?:p|div|h[1-6]|ul|ol|table|article|section|blockquote|figure|header|main|span|strong|em|br|img|hr)\b/i;

/**
 * Detects legacy Jodit / Google Docs HTML posts so we can keep their
 * existing renderer. Markdown that happens to include an HTML island
 * usually does not start with a block tag plus a matching closer.
 */
export function looksLikeHtml(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  return HTML_BLOCK_START.test(trimmed) && /<\/[a-z][\w:-]*>/i.test(trimmed);
}

export function plainTextFromContent(content: string | null | undefined): string {
  if (!content) return '';
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function readingTimeMinutes(content: string | null | undefined): number {
  const text = plainTextFromContent(content);
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.round(words / 200));
}
