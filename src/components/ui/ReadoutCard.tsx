import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Card } from './Card';
import { colors, fontSizes, fontWeights, spacing } from '../../theme';

export interface ReadoutCardProps {
  label: string;
  value: number;
}

export function ReadoutCard({ label, value }: ReadoutCardProps) {
  return (
    <Card>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText style={styles.value}>{value}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textMuted,
    letterSpacing: 1,
  },
  valueRow: {
    marginTop: spacing.sm,
  },
  value: {
    fontSize: 40,
    fontWeight: fontWeights.semibold,
    color: colors.chart,
  },
});
