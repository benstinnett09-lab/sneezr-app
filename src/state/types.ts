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
  /** Post-event assessment: 1–5. */
  severity?: number | null;
  /** Reported trigger (e.g. pollen, pepper). */
  trigger?: string | null;
  /** Where it happened (e.g. outdoors, office). */
  environment?: string | null;
  /** Symptom labels (e.g. runny_nose, itchy_eyes). */
  symptoms?: string[] | null;
  /** What they did (e.g. tissue, medication). */
  intervention?: string | null;
  /** When the assessment was completed (ms). */
  assessmentCompletedAt?: number | null;
  /** Last row update (ms). */
  updatedAt?: number | null;
}

/** Payload for updating a sneeze's assessment (all fields optional). */
export interface SneezeAssessmentPayload {
  severity?: number | null;
  trigger?: string | null;
  environment?: string | null;
  symptoms?: string[] | null;
  intervention?: string | null;
}
