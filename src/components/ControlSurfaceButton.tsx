import React, { useEffect, useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  Animated,
  type PressableProps,
} from 'react-native';
import { colors, radius, spacing, fontWeights, fontFamilies } from '../theme';

export type ControlSurfaceVariant = 'primary' | 'danger' | 'neutral';

const VARIANT_BORDER: Record<ControlSurfaceVariant, string> = {
  primary: colors.primaryBorder,
  danger: colors.danger,
  neutral: 'rgba(230, 241, 255, 0.25)',
};

const VARIANT_GLOW: Record<ControlSurfaceVariant, string> = {
  primary: colors.primary,
  danger: colors.danger,
  neutral: colors.textMuted,
};

const VARIANT_LABEL: Record<ControlSurfaceVariant, string> = {
  primary: colors.primary,
  danger: colors.danger,
  neutral: colors.textSecondary,
};

const DEFAULT_LABEL = 'INITIATE NASAL EVENT CAPTURE';

export interface ControlSurfaceButtonProps
  extends Omit<PressableProps, 'children'> {
  /** Uppercase monospace label. */
  title?: string;
  variant?: ControlSurfaceVariant;
  /** Subtle scale pulse when primary (idle). Disabled when pressed or neutral/danger. */
  pulse?: boolean;
}

const PULSE_MIN = 1;
const PULSE_MAX = 1.03;
const PULSE_MS = 2200;

export function ControlSurfaceButton({
  title = DEFAULT_LABEL,
  variant = 'primary',
  pulse = false,
  disabled,
  style,
  ...rest
}: ControlSurfaceButtonProps) {
  const borderColor = VARIANT_BORDER[variant];
  const glowColor = VARIANT_GLOW[variant];
  const labelColor = VARIANT_LABEL[variant];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const shouldPulse = pulse && variant === 'primary' && !disabled;

  useEffect(() => {
    if (!shouldPulse) {
      pulseAnim.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: PULSE_MAX,
          duration: PULSE_MS / 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: PULSE_MIN,
          duration: PULSE_MS / 2,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [shouldPulse, pulseAnim]);

  const pressable = (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          borderColor,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...Platform.select({
            ios: {
              shadowColor: glowColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: pressed ? 0.6 : 0.35,
              shadowRadius: pressed ? 14 : 10,
            },
            android: {
              elevation: pressed ? 10 : 6,
            },
            default: {},
          }),
        },
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.label,
            { color: labelColor, opacity: pressed ? 0.9 : 1 },
          ]}
        >
          {title.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );

  if (shouldPulse) {
    return (
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        {pressable}
      </Animated.View>
    );
  }
  return pressable;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  label: {
    fontFamily: fontFamilies.mono,
    fontSize: 14,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.2,
  },
  disabled: {
    opacity: 0.5,
  },
});
