import type { EmailTemplateRow, RenderedEmail, TemplateVariables } from './types';
import { wrapEmailLayout, htmlToPlainText } from './layout';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Replace {{variable}} placeholders; values are HTML-escaped unless key ends with _html. */
export function interpolateTemplate(
  template: string,
  variables: TemplateVariables,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const raw = variables[key] ?? '';
    if (key.endsWith('_html')) {
      return raw;
    }
    return escapeHtml(raw);
  });
}

export function renderEmailTemplate(
  template: Pick<EmailTemplateRow, 'subject' | 'html_body' | 'text_body'>,
  variables: TemplateVariables,
  options?: { wrapLayout?: boolean; siteUrl?: string },
): RenderedEmail {
  const subject = interpolateTemplate(template.subject, variables);
  const innerHtml = interpolateTemplate(template.html_body, variables);
  const html = options?.wrapLayout === false
    ? innerHtml
    : wrapEmailLayout(innerHtml, options?.siteUrl);

  const text = template.text_body
    ? interpolateTemplate(template.text_body, variables)
    : htmlToPlainText(innerHtml);

  return { subject, html, text };
}

export function previewEmailTemplate(
  template: Pick<EmailTemplateRow, 'subject' | 'html_body' | 'text_body' | 'sample_variables'>,
  overrides?: TemplateVariables,
): RenderedEmail {
  const variables: TemplateVariables = {
    ...(template.sample_variables ?? {}),
    ...(overrides ?? {}),
  };
  return renderEmailTemplate(template, variables);
}
