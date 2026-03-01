/**
 * Pure stats from event lists. All inputs are { timestamp: number }[].
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Calendar day key YYYY-MM-DD in local time. */
function toDateKey(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Start of today (local) as timestamp. */
function startOfToday(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function totalRecordedEvents(events: { timestamp: number }[]): number {
  return events.length;
}

export function eventsToday(
  events: { timestamp: number }[],
  now: number = Date.now()
): number {
  const start = startOfToday(now);
  const end = start + MS_PER_DAY;
  return events.filter((e) => e.timestamp >= start && e.timestamp < end).length;
}

/** Mean events per day over the last 14 calendar days (including today). */
export function meanEventsPerDayLast14(
  events: { timestamp: number }[],
  now: number = Date.now()
): number {
  const start = startOfToday(now) - (13 * MS_PER_DAY);
  const end = now + 1;
  const inRange = events.filter(
    (e) => e.timestamp >= start && e.timestamp <= end
  );
  return inRange.length / 14;
}

/** Hour (0–23) with the most events. Ties go to earliest hour. */
export function peakActivityWindow(events: { timestamp: number }[]): number {
  if (events.length === 0) return 0;
  const buckets = new Array(24).fill(0);
  for (const e of events) {
    const h = new Date(e.timestamp).getHours();
    buckets[h]++;
  }
  let maxHour = 0;
  for (let h = 1; h < 24; h++) {
    if (buckets[h] > buckets[maxHour]) maxHour = h;
  }
  return maxHour;
}

/** Format hour as "14:00–15:00" style window. */
export function formatHourWindow(hour: number): string {
  const s = (h: number) => h.toString().padStart(2, '0');
  return `${s(hour)}:00–${s((hour + 1) % 24)}:00`;
}

/**
 * Longest streak of consecutive calendar days with at least one event.
 * "Consecutive" means no gap day between first and last day of the streak.
 */
export function eventContinuityIndex(events: {
  timestamp: number;
}[]): number {
  if (events.length === 0) return 0;
  const keys = [...new Set(events.map((e) => toDateKey(e.timestamp)))].sort();
  if (keys.length === 0) return 0;
  let maxStreak = 1;
  let current = 1;
  for (let i = 1; i < keys.length; i++) {
    const prev = new Date(keys[i - 1]).getTime();
    const curr = new Date(keys[i]).getTime();
    const diffDays = Math.round((curr - prev) / MS_PER_DAY);
    if (diffDays === 1) {
      current++;
      maxStreak = Math.max(maxStreak, current);
    } else {
      current = 1;
    }
  }
  return maxStreak;
}

export interface ActivityByDayRow {
  dateKey: string;
  label: string;
  count: number;
}

/** Activity by calendar day, newest first. */
export function getActivityByDay(events: {
  timestamp: number;
}[]): ActivityByDayRow[] {
  const byDay = new Map<string, number>();
  for (const e of events) {
    const key = toDateKey(e.timestamp);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const rows: ActivityByDayRow[] = [];
  byDay.forEach((count, dateKey) => {
    const [y, m, d] = dateKey.split('-');
    const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    const label = date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    rows.push({ dateKey, label, count });
  });
  rows.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return rows;
}
