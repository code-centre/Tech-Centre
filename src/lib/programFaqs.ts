/**
 * `programs.faqs` quedó guardado con dos formas distintas según la época:
 *
 *   { id, pregunta, respuesta }   ← programas viejos, respuesta con HTML
 *   { question, answer }          ← programas nuevos, texto plano
 *
 * La página pública solo leía la primera, así que los programas nuevos
 * mostraban «No hay preguntas frecuentes» aunque tuvieran cinco guardadas.
 * Aquí se leen las dos y se escribe siempre la segunda, que es la que declara
 * el tipo `Faq`.
 */

export interface NormalizedFaq {
  question: string;
  answer: string;
}

function readText(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

/** Acepta el arreglo crudo, `{ faqs: [...] }`, null o basura. */
export function normalizeFaqs(raw: unknown): NormalizedFaq[] {
  let list: unknown = raw;

  if (raw && !Array.isArray(raw) && typeof raw === 'object' && 'faqs' in raw) {
    list = (raw as { faqs?: unknown }).faqs;
  }

  if (!Array.isArray(list)) return [];

  const faqs: NormalizedFaq[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const source = entry as Record<string, unknown>;
    const question = readText(source, 'question', 'pregunta');
    const answer = readText(source, 'answer', 'respuesta');
    // Una pregunta vacía no se muestra; una respuesta vacía todavía se puede
    // estar escribiendo, así que esa sí pasa.
    if (!question) continue;
    faqs.push({ question, answer });
  }
  return faqs;
}

/** La respuesta vieja trae HTML de Tiptap; la nueva es texto plano. */
export function faqAnswerIsHtml(answer: string): boolean {
  return answer.trim().startsWith('<');
}
