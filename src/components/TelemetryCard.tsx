import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { AppText } from './ui';
import { colors, spacing, radius } from '../theme';

export type TelemetryCardVariant = 'default' | 'success' | 'warning' | 'danger';

const VARIANT_BORDER: Record<TelemetryCardVariant, string> = {
  default: colors.primaryBorder,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

const VARIANT_GLOW: Record<TelemetryCardVariant, string> = {
  default: colors.primary,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export interface TelemetryCardProps extends Omit<ViewProps, 'children'> {
  /** Optional monospace header label. */
  title?: string;
  children: React.ReactNode;
  variant?: TelemetryCardVariant;
}

export function TelemetryCard({
  title,
  children,
  variant = 'default',
  style,
  ...rest
}: TelemetryCardProps) {
  const borderColor = VARIANT_BORDER[variant];
  const glowColor = VARIANT_GLOW[variant];

  return (
    <View
      style={[
        styles.card,
        {
          borderColor,
          ...Platform.select({
            ios: {
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
            },
            android: {
              elevation: 6,
            },
            default: {},
          }),
        },
        style,
      ]}
      {...rest}
    >
      {title != null && title !== '' ? (
        <View style={styles.header}>
          <AppText variant="mono" style={styles.title}>
            {title}
          </AppText>
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const CARD_BG = 'rgba(12, 15, 24, 0.92)';

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    color: colors.textMuted,
    letterSpacing: 0.75,
  },
  content: {
    padding: spacing.md,
  },
});
