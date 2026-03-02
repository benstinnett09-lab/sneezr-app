import type { SneezeEvent } from '../state/types';

/** Events with assessment completed (causal analyses use only these). */
export function getAssessedEvents(events: SneezeEvent[]): SneezeEvent[] {
  return events.filter(
    (e): e is SneezeEvent & { assessmentCompletedAt: number } =>
      e.assessmentCompletedAt != null
  );
}

/** Histogram keyed by severity 1–5. */
export type SeverityHistogram = Record<1 | 2 | 3 | 4 | 5, number>;

/** Count map for string-valued fields. */
export type CountMap = Record<string, number>;

export interface AnalysisStats {
  totalEvents: number;
  assessedEventsCount: number;
  assessmentCompletionRate: number;
  meanSeverity: number | null;
  severityDistribution: SeverityHistogram;
  triggerDistribution: CountMap;
  environmentDistribution: CountMap;
  symptomFrequency: CountMap;
  interventionDistribution: CountMap;
}

function emptySeverityHistogram(): SeverityHistogram {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

function countByString(values: (string | null | undefined)[]): CountMap {
  const out: CountMap = {};
  for (const v of values) {
    if (v == null || v === '') continue;
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

/** Total number of events. */
export function totalEvents(events: SneezeEvent[]): number {
  return events.length;
}

/** Number of events with assessment completed. */
export function assessedEventsCount(events: SneezeEvent[]): number {
  return getAssessedEvents(events).length;
}

/** Fraction of events that have been assessed (0–1). */
export function assessmentCompletionRate(events: SneezeEvent[]): number {
  const total = totalEvents(events);
  if (total === 0) return 0;
  return assessedEventsCount(events) / total;
}

/** Mean severity among assessed events with a severity value; null if none. */
export function meanSeverity(events: SneezeEvent[]): number | null {
  const assessed = getAssessedEvents(events);
  const withSeverity = assessed.filter(
    (e): e is SneezeEvent & { severity: number } =>
      e.severity != null && e.severity >= 1 && e.severity <= 5
  );
  if (withSeverity.length === 0) return null;
  const sum = withSeverity.reduce((s, e) => s + e.severity, 0);
  return sum / withSeverity.length;
}

/** Count of assessed events per severity 1–5. */
export function severityDistribution(events: SneezeEvent[]): SeverityHistogram {
  const assessed = getAssessedEvents(events);
  const out = emptySeverityHistogram();
  for (const e of assessed) {
    if (e.severity != null && e.severity >= 1 && e.severity <= 5) {
      const k = Math.floor(e.severity) as 1 | 2 | 3 | 4 | 5;
      out[k] += 1;
    }
  }
  return out;
}

/** Count of assessed events by trigger. */
export function triggerDistribution(events: SneezeEvent[]): CountMap {
  const assessed = getAssessedEvents(events);
  return countByString(assessed.map((e) => e.trigger));
}

/** Count of assessed events by environment. */
export function environmentDistribution(events: SneezeEvent[]): CountMap {
  const assessed = getAssessedEvents(events);
  return countByString(assessed.map((e) => e.environment));
}

/** Frequency of each symptom across assessed events (flattened symptoms array). */
export function symptomFrequency(events: SneezeEvent[]): CountMap {
  const assessed = getAssessedEvents(events);
  const out: CountMap = {};
  for (const e of assessed) {
    const arr = e.symptoms ?? [];
    for (const s of arr) {
      if (s != null && s !== '') {
        out[s] = (out[s] ?? 0) + 1;
      }
    }
  }
  return out;
}

/** Count of assessed events by intervention. */
export function interventionDistribution(events: SneezeEvent[]): CountMap {
  const assessed = getAssessedEvents(events);
  return countByString(assessed.map((e) => e.intervention));
}

/** Compute full analysis stats from an event list. Pure, unit-testable. */
export function computeAnalysisStats(events: SneezeEvent[]): AnalysisStats {
  return {
    totalEvents: totalEvents(events),
    assessedEventsCount: assessedEventsCount(events),
    assessmentCompletionRate: assessmentCompletionRate(events),
    meanSeverity: meanSeverity(events),
    severityDistribution: severityDistribution(events),
    triggerDistribution: triggerDistribution(events),
    environmentDistribution: environmentDistribution(events),
    symptomFrequency: symptomFrequency(events),
    interventionDistribution: interventionDistribution(events),
  };
}
