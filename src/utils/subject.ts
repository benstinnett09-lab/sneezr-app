/**
 * Shorten a subject/user id for display (e.g. UUID to first 8 chars).
 */
export function shortenSubjectId(id: string, length: number = 8): string {
  if (!id) return '—';
  return id.slice(0, length).toUpperCase();
}
