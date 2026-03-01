/**
 * Format timestamp as absolute date/time.
 */
export function formatAbsolute(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${pad(hours)}:${pad(minutes)}`;
}

/**
 * Format timestamp as relative time (e.g. "5m ago", "2h ago").
 */
export function formatRelative(ts: number, now: number = Date.now()): string {
  const diffMs = now - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatAbsolute(ts);
}
