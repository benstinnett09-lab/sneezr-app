/**
 * Sneezr color palette — futuristic sci-fi telemetry console.
 * Dark mode only. Cyan glow primary, magenta accent, semantic status colors.
 */
export const colors = {
  // Base
  background: '#05070D',

  // Primary — cyan glow (CTAs, key UI, links)
  primary: '#00E5FF',
  primaryMuted: '#00B8CC',
  primaryGlow: 'rgba(0, 229, 255, 0.35)',
  primaryBorder: 'rgba(0, 229, 255, 0.5)',

  // Accent — magenta (highlights, secondary actions)
  accent: '#FF2BD6',
  accentMuted: '#CC22AB',
  accentGlow: 'rgba(255, 43, 214, 0.3)',
  accentBorder: 'rgba(255, 43, 214, 0.45)',

  // Surfaces (dark)
  surface: '#0C0F18',
  surfaceElevated: '#121720',
  surfaceOverlay: '#181D28',

  // Text
  text: '#E6F1FF',
  textSecondary: '#B8C9E0',
  textMuted: '#7A8BA8',

  // Semantic
  success: '#3BFF7A',
  successMuted: '#2ECC62',
  successGlow: 'rgba(59, 255, 122, 0.25)',
  warning: '#FFC857',
  warningMuted: '#E6B34D',
  warningGlow: 'rgba(255, 200, 87, 0.25)',
  danger: '#FF4D4D',
  dangerMuted: '#E64545',
  dangerGlow: 'rgba(255, 77, 77, 0.25)',

  // Data & charts (use primary/accent or semantic as needed)
  chart: '#00E5FF',
  chartMuted: '#00B8CC',

  // Validation / confirmed (alias to success for compatibility)
  valid: '#3BFF7A',
  validMuted: '#2ECC62',

  // UI — borders, dividers, focus (console-style)
  border: 'rgba(230, 241, 255, 0.12)',
  borderFocus: 'rgba(0, 229, 255, 0.6)',
  divider: 'rgba(230, 241, 255, 0.08)',

  // Card/button glow and border (reusable)
  cardBorder: 'rgba(0, 229, 255, 0.2)',
  cardGlow: 'rgba(0, 229, 255, 0.08)',
  buttonBorder: 'rgba(0, 229, 255, 0.4)',
  buttonGlow: 'rgba(0, 229, 255, 0.2)',
} as const;

export type Colors = typeof colors;
