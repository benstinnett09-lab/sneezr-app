/**
 * Domain types for Sneezr.
 */
export interface SneezeEvent {
  id: string;
  timestamp: number;
  /** Optional note, e.g. "pollen", "pepper". */
  note?: string;
  /** Optional photo URL from storage. */
  photoUrl?: string | null;
}
