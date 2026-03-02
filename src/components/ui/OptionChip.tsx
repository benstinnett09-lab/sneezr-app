import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../theme';

export interface OptionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionChip({ label, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
    >
      <AppText
        variant="body"
        style={[styles.label, selected && styles.labelSelected]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {},
  labelSelected: { color: colors.surface },
});
