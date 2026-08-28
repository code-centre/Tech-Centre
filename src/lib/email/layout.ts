/** Branded HTML wrapper for transactional emails. */
export function wrapEmailLayout(bodyHtml: string, siteUrl?: string): string {
  const site = siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techcentre.co';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tech Centre</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f4f5;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="padding:28px 32px 16px;border-bottom:1px solid #e4e4e7;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#0F5C4C;letter-spacing:-0.02em">Tech Centre</p>
              <p style="margin:4px 0 0;font-size:12px;color:#a1a1aa">Centro de Tecnología del Caribe</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa">
                Tech Centre · Impulsa tu carrera en tecnología<br>
                <a href="${site}" style="color:#0F5C4C;text-decoration:none">${site.replace(/^https?:\/\//, '')}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Strip HTML tags for plain-text fallback. */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
