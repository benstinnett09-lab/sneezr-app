import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

const LINE_COUNT = 12;
const LINE_OPACITY = 0.03;

/**
 * Lightweight scanline overlay for sci-fi telemetry aesthetic.
 * Renders a fixed number of horizontal lines; use as sibling in absolute container.
 * pointerEvents: 'none' so touches pass through. Low perf cost.
 */
export function ScanlineOverlay() {
  const lines = useMemo(
    () =>
      Array.from({ length: LINE_COUNT }, (_, i) => (
        <View
          key={i}
          style={[styles.line, { backgroundColor: `rgba(0, 229, 255, ${LINE_OPACITY})` }]}
        />
      )),
    []
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {lines}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  line: {
    height: 1,
    width: '100%',
  },
});
