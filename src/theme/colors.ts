/**
 * Sneezr color palette — clinical, research-instrument aesthetic.
 * Primary: deep scientific navy. Background: lab-white. Analytic blue for data/charts.
 * Green reserved for valid/confirmed data states.
 */
export const colors = {
  // Primary brand — deep scientific navy
  primary: '#0f1729',
  primaryMuted: '#1e293b',

  // Surfaces
  background: '#fafbfc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Text
  text: '#0f1729',
  textSecondary: '#475569',
  textMuted: '#64748b',

  // Data & charts — analytic blue
  chart: '#1d4ed8',
  chartMuted: '#3b82f6',

  // Validation / confirmed data
  valid: '#15803d',
  validMuted: '#22c55e',

  // UI
  border: '#e2e8f0',
  borderFocus: '#94a3b8',
  divider: '#f1f5f9',
} as const;

export type Colors = typeof colors;
