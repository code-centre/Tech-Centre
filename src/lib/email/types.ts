export interface EmailTemplateRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  html_body: string;
  text_body: string | null;
  sample_variables: Record<string, string>;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export type TemplateVariables = Record<string, string>;
