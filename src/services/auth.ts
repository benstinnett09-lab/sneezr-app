import type { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

export type AuthResult = { session: Session } | { error: Error };

/**
 * Sign in anonymously. Session is persisted via AsyncStorage; existing session is reused.
 */
export async function signInAnonymously(): Promise<AuthResult> {
  const { data: { session }, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return { error: new Error(error.message) };
  }
  if (!session) {
    return { error: new Error('Anonymous sign-in returned no session') };
  }
  return { session };
}

/**
 * Get current session if already signed in.
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user id. Returns null if not signed in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export type SignOutResult = { ok: true } | { error: Error };

/**
 * Sign out and clear server session. Local persistence is cleared by Sign out;
 * use clearLocalCache() to clear AsyncStorage separately if needed.
 */
export async function signOut(): Promise<SignOutResult> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: new Error(error.message) };
  }
  return { ok: true };
}

/**
 * Clear all locally persisted data (session, any app cache).
 * Call boot() after this to obtain a new anonymous session if needed.
 */
export async function clearLocalCache(): Promise<void> {
  await AsyncStorage.clear();
}
