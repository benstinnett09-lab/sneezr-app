import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { instrumentDivider, instrumentDividerAccent } from '../theme/effects';

export interface InstrumentDividerProps extends ViewProps {
  /** Slightly brighter line with primary tint. */
  accent?: boolean;
}

/**
 * Thin horizontal line for instrument-panel style separation.
 * Reuses theme effect styles; minimal perf cost.
 */
export function InstrumentDivider({ accent = false, style, ...rest }: InstrumentDividerProps) {
  return (
    <View
      style={[styles.base, accent ? styles.accent : styles.default, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
  default: instrumentDivider,
  accent: instrumentDividerAccent,
});
