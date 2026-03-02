import type {
  SneezeEvent,
  SneezeAssessmentPayload,
} from '../state/types';
import { supabase } from './supabaseClient';
import { getCurrentUserId } from './auth';

const SEVERITY_MIN = 1;
const SEVERITY_MAX = 5;

/** Picklists for post-event assessment (validation). */
const TRIGGERS = ['dust', 'pollen', 'pet', 'food', 'illness', 'irritant', 'other', 'unknown'] as const;
const ENVIRONMENTS = ['indoors', 'outdoors', 'vehicle', 'workshop', 'bedroom', 'other'] as const;
const SYMPTOMS = ['watery_eyes', 'runny_nose', 'congestion', 'itchy_throat', 'headache', 'none'] as const;
const INTERVENTIONS = ['none', 'antihistamine', 'nasal_spray', 'rest', 'hydration', 'other'] as const;

/** DB row shape for public.sneezes (timestamp from DB may be ISO string or number). */
interface SneezeRow {
  id: string;
  user_id: string;
  timestamp: number | string;
  photo_url: string | null;
  created_at: string;
  severity?: number | null;
  trigger?: string | null;
  environment?: string | null;
  symptoms?: string[] | null;
  intervention?: string | null;
  assessment_completed_at?: string | null;
  updated_at?: string | null;
}

const SNEEZES_SELECT =
  'id, user_id, timestamp, photo_url, created_at, severity, trigger, environment, symptoms, intervention, assessment_completed_at, updated_at';

function toTimestampMs(ts: number | string | null | undefined): number | null {
  if (ts == null) return null;
  if (typeof ts === 'string') return Date.parse(ts);
  return ts < 1e12 ? ts * 1000 : ts;
}

function rowToEvent(row: SneezeRow): SneezeEvent {
  return {
    id: row.id,
    timestamp: toTimestampMs(row.timestamp)!,
    photoUrl: row.photo_url ?? undefined,
    severity: row.severity ?? undefined,
    trigger: row.trigger ?? undefined,
    environment: row.environment ?? undefined,
    symptoms: row.symptoms ?? undefined,
    intervention: row.intervention ?? undefined,
    assessmentCompletedAt: toTimestampMs(row.assessment_completed_at) ?? undefined,
    updatedAt: toTimestampMs(row.updated_at) ?? undefined,
  };
}

function validateAssessmentPayload(
  payload: SneezeAssessmentPayload
): { error?: Error } {
  if (payload.severity != null) {
    const n = Number(payload.severity);
    if (!Number.isInteger(n) || n < SEVERITY_MIN || n > SEVERITY_MAX) {
      return { error: new Error(`severity must be ${SEVERITY_MIN}-${SEVERITY_MAX}`) };
    }
  }
  if (payload.trigger != null && payload.trigger !== '' && !TRIGGERS.includes(payload.trigger as typeof TRIGGERS[number])) {
    return { error: new Error(`trigger must be one of: ${TRIGGERS.join(', ')}`) };
  }
  if (payload.environment != null && payload.environment !== '' && !ENVIRONMENTS.includes(payload.environment as typeof ENVIRONMENTS[number])) {
    return { error: new Error(`environment must be one of: ${ENVIRONMENTS.join(', ')}`) };
  }
  if (payload.symptoms != null && Array.isArray(payload.symptoms)) {
    for (const s of payload.symptoms) {
      if (s !== '' && !SYMPTOMS.includes(s as typeof SYMPTOMS[number])) {
        return { error: new Error(`symptoms must be from: ${SYMPTOMS.join(', ')}`) };
      }
    }
  }
  if (payload.intervention != null && payload.intervention !== '' && !INTERVENTIONS.includes(payload.intervention as typeof INTERVENTIONS[number])) {
    return { error: new Error(`intervention must be one of: ${INTERVENTIONS.join(', ')}`) };
  }
  return {};
}

export type CreateSneezeResult = { event: SneezeEvent } | { error: Error };
export type ListSneezesResult = { events: SneezeEvent[] } | { error: Error };

/**
 * Create a sneeze event for the current user. Uses session from auth.
 */
export async function createSneeze(params: {
  timestamp: number;
  photoUrl?: string | null;
}): Promise<CreateSneezeResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: new Error('Not authenticated') };
  }

  const { data, error } = await supabase
    .from('sneezes')
    .insert({
      user_id: userId,
      timestamp: new Date(params.timestamp).toISOString(),
      photo_url: params.photoUrl ?? null,
    })
    .select(SNEEZES_SELECT)
    .single();

  if (error) {
    return { error: new Error(error.message) };
  }
  if (!data) {
    return { error: new Error('Create returned no row') };
  }
  return { event: rowToEvent(data as SneezeRow) };
}

/**
 * List sneeze events for the current user, newest first.
 */
export async function listSneezes(params?: {
  limit?: number;
}): Promise<ListSneezesResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: new Error('Not authenticated') };
  }

  let query = supabase
    .from('sneezes')
    .select(SNEEZES_SELECT)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (params?.limit != null) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { error: new Error(error.message) };
  }
  return {
    events: (data ?? []).map((row) => rowToEvent(row as SneezeRow)),
  };
}

export type UpdateSneezeAssessmentResult = { event: SneezeEvent } | { error: Error };

/**
 * Update a sneeze's assessment (own rows only; RLS enforced).
 * Sets assessment_completed_at to now() when called.
 */
export async function updateSneezeAssessment(
  eventId: string,
  payload: SneezeAssessmentPayload
): Promise<UpdateSneezeAssessmentResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: new Error('Not authenticated') };
  }

  const validation = validateAssessmentPayload(payload);
  if (validation.error) {
    return { error: validation.error };
  }

  const update: Record<string, unknown> = {
    assessment_completed_at: new Date().toISOString(),
  };
  if (payload.severity !== undefined) update.severity = payload.severity;
  if (payload.trigger !== undefined) update.trigger = payload.trigger;
  if (payload.environment !== undefined) update.environment = payload.environment;
  if (payload.symptoms !== undefined) update.symptoms = payload.symptoms;
  if (payload.intervention !== undefined) update.intervention = payload.intervention;

  const { data, error } = await supabase
    .from('sneezes')
    .update(update)
    .eq('id', eventId)
    .eq('user_id', userId)
    .select(SNEEZES_SELECT)
    .single();

  if (error) {
    return { error: new Error(error.message) };
  }
  if (!data) {
    return { error: new Error('Update returned no row') };
  }
  return { event: rowToEvent(data as SneezeRow) };
}
