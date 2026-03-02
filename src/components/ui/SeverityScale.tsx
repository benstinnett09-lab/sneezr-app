import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../../theme';

export interface SeverityScaleProps {
  value: number | null;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}

export function SeverityScale({
  value,
  min = 1,
  max = 5,
  onChange,
}: SeverityScaleProps) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <View style={styles.row}>
      {options.map((n) => (
        <Pressable
          key={n}
          style={[styles.cell, value === n && styles.cellSelected]}
          onPress={() => onChange(n)}
        >
          <AppText
            variant="body"
            style={[styles.cellText, value === n && styles.cellTextSelected]}
          >
            {n}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: spacing.sm },
  cell: {
    width: 44,
    height: 44,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cellText: {},
  cellTextSelected: { color: colors.surface },
});
