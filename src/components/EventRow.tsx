import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { AppText } from './ui';
import { colors, spacing, radius } from '../theme';
import { formatAbsolute, formatRelative } from '../utils/date';
import type { SneezeEvent } from '../state/types';

const THUMB_SIZE = 56;

export interface EventRowProps {
  event: SneezeEvent;
  onPress: () => void;
}

export function EventRow({ event, onPress }: EventRowProps) {
  const hasEvidence = Boolean(event.photoUrl);
  const evidenceLabel = hasEvidence ? 'PRESENT' : 'ABSENT';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumbnail}>
        {event.photoUrl ? (
          <Image
            source={{ uri: event.photoUrl }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.content}>
        <AppText variant="mono" style={styles.absolute}>
          {formatAbsolute(event.timestamp)}
        </AppText>
        <AppText variant="body" muted>
          {formatRelative(event.timestamp)}
        </AppText>
        <AppText variant="label" style={styles.evidenceLabel}>
          VISUAL EVIDENCE: {evidenceLabel}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.divider,
  },
  content: { flex: 1 },
  absolute: {
    color: colors.text,
  },
  evidenceLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
