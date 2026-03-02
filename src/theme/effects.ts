/**
 * Reusable sci-fi telemetry visual effects — glow, dividers, instrument panel styling.
 * Lightweight: style objects only; no components. Use with StyleSheet.create or spread.
 */
import { Platform, type ViewStyle } from 'react-native';
import { colors } from './colors';

/** Glow styles keyed by intensity. Use for cards, buttons, active elements. */
export const glowStyles = {
  /** Very subtle — borders and inactive surfaces. */
  subtle: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }),
  /** Default active element glow. */
  default: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
    default: {},
  }),
  /** Stronger glow for focused/primary CTAs. */
  strong: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
    },
    android: { elevation: 8 },
    default: {},
  }),
} as const;

/** Thin horizontal line resembling instrument panel divider. */
export const instrumentDivider: ViewStyle = {
  height: 1,
  backgroundColor: colors.divider,
  marginVertical: 0,
};

/** Slightly brighter divider with primary tint (use sparingly). */
export const instrumentDividerAccent: ViewStyle = {
  height: 1,
  backgroundColor: 'rgba(0, 229, 255, 0.15)',
  marginVertical: 0,
};

/** Border style for panel edges — thin, muted. */
export const instrumentPanelBorder: ViewStyle = {
  borderBottomWidth: 1,
  borderColor: colors.divider,
};

/** Optional glow border (combine with borderWidth + borderColor elsewhere). */
export const instrumentPanelBorderGlow: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  default: {},
});
