const LANGUAGE_LABELS: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  jsx: 'JSX',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TSX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  java: 'Java',
  php: 'PHP',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  cs: 'C#',
  swift: 'Swift',
  kotlin: 'Kotlin',
  sh: 'Shell',
  bash: 'Bash',
  zsh: 'Zsh',
  shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  graphql: 'GraphQL',
  md: 'Markdown',
  markdown: 'Markdown',
  diff: 'Diff',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  text: 'Texto',
  txt: 'Texto',
  plaintext: 'Texto',
};

export function languageFromClassName(className?: string): string | undefined {
  if (!className) return undefined;
  const token = className
    .split(/\s+/)
    .find((part) => part.startsWith('language-') || part.startsWith('lang-'));
  if (!token) return undefined;
  const id = token.replace(/^(language|lang)-/, '').trim();
  return id || undefined;
}

export function languageLabel(id: string): string {
  return LANGUAGE_LABELS[id.toLowerCase()] ?? id;
}
