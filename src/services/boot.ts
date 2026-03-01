import { signInAnonymously } from './auth';

export type BootResult = { ready: true } | { error: Error };

/**
 * Ensures auth is ready on app launch. Call once before rendering the app.
 * Signs in anonymously if no session exists; reuses existing session otherwise.
 */
export async function boot(): Promise<BootResult> {
  const result = await signInAnonymously();
  if ('error' in result) {
    return { error: result.error };
  }
  return { ready: true };
}
