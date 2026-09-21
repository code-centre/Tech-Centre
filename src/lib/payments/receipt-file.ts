export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export function isPdfFile(file: Pick<File, 'type' | 'name'>): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function isPdfUrl(url: string): boolean {
  return url.toLowerCase().split('?')[0].endsWith('.pdf');
}

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type) && !isPdfFile(file)) {
    return 'Solo se permiten imágenes (JPG, PNG, WEBP) o PDF.';
  }
  if (file.size > RECEIPT_MAX_BYTES) {
    return 'El archivo no debe superar los 10MB.';
  }
  return null;
}
