/**
 * Typography — futuristic sci-fi telemetry console.
 * Headings: Orbitron-style. Body: clean sci-fi sans. Data: JetBrains Mono–style.
 * Falls back to system fonts if custom fonts are not loaded.
 */
import { TextStyle, Platform } from 'react-native';

// Futuristic display/heading (Orbitron-like). Use exact name after loading via expo-font.
const fontFamilyHeading = Platform.select({
  ios: 'System', // Replace with 'Orbitron-SemiBold' once loaded
  android: 'sans-serif-medium',
  default: 'System',
});

// Clean sci-fi sans for body. Replace with 'Exo2-Regular' / 'Rajdhani-Regular' if loaded.
const fontFamilyBody = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// Monospace for data/code (JetBrains Mono–style). Replace with 'JetBrainsMono-Regular' if loaded.
const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const fontFamilies = {
  heading: fontFamilyHeading,
  body: fontFamilyBody,
  mono: fontFamilyMono,
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 19,
  '2xl': 22,
  '3xl': 26,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.45,
  relaxed: 1.6,
} as const;

/** Reusable text styles for AppText variants. */
export const textVariants: Record<string, TextStyle> = {
  title: {
    fontFamily: fontFamilyHeading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.tight,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fontFamilyHeading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: 0.25,
  },
  body: {
    fontFamily: fontFamilyBody,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  mono: {
    fontFamily: fontFamilyMono,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: 0.25,
  },
  label: {
    fontFamily: fontFamilyBody,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: 0.5,
  },
};

export type TextVariant = keyof typeof textVariants;
