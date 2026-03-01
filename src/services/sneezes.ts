import type { SneezeEvent } from '../state/types';
import { supabase } from './supabaseClient';
import { getCurrentUserId } from './auth';

/** DB row shape for public.sneezes */
interface SneezeRow {
  id: string;
  user_id: string;
  timestamp: number;
  photo_url: string | null;
  created_at: string;
}

function rowToEvent(row: SneezeRow): SneezeEvent {
  return {
    id: row.id,
    timestamp: row.timestamp,
    photoUrl: row.photo_url,
  };
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
      timestamp: params.timestamp,
      photo_url: params.photoUrl ?? null,
    })
    .select('id, user_id, timestamp, photo_url, created_at')
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
    .select('id, user_id, timestamp, photo_url, created_at')
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
