import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  type PressableProps,
} from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../theme';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.surface : colors.primary}
        />
      ) : (
        <AppText
          style={[styles.label, isPrimary ? styles.primaryLabel : styles.secondaryLabel]}
        >
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  label: { fontWeight: '600' },
  primaryLabel: { color: colors.surface },
  secondaryLabel: { color: colors.text },
});
