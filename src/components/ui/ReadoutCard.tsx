import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { Card } from './Card';
import { colors, fontWeights, spacing } from '../../theme';

export interface ReadoutCardProps {
  label: string;
  value: number;
}

const VALUE_FONT_SIZE = 40;
const VALUE_LINE_HEIGHT = 48;

export function ReadoutCard({ label, value }: ReadoutCardProps) {
  return (
    <Card>
      <AppText variant="label" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="mono" style={styles.value}>
          {String(value)}
        </AppText>
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
    minHeight: VALUE_LINE_HEIGHT,
  },
  value: {
    fontSize: VALUE_FONT_SIZE,
    lineHeight: VALUE_LINE_HEIGHT,
    fontWeight: fontWeights.semibold,
    color: colors.chart,
  },
});
