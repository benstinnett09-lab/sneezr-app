import React from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { AppText } from './ui';
import { colors, spacing, radius } from '../theme';
import { formatAbsolute, formatRelative } from '../utils/date';
import { usePhotoDisplayUrl } from '../hooks/usePhotoDisplayUrl';
import type { SneezeEvent } from '../state/types';

const THUMB_SIZE = 56;

export interface EventRowProps {
  event: SneezeEvent;
  onPress: () => void;
}

export function EventRow({ event, onPress }: EventRowProps) {
  const displayUrl = usePhotoDisplayUrl(event.photoUrl);
  const hasEvidence = Boolean(event.photoUrl);
  const evidenceLabel = hasEvidence ? 'PRESENT' : 'ABSENT';
  const isAssessmentComplete = event.assessmentCompletedAt != null;
  const assessmentLabel = isAssessmentComplete ? 'COMPLETE' : 'PENDING';

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.thumbnail}>
        {event.photoUrl ? (
          <Image
            source={{ uri: displayUrl ?? event.photoUrl }}
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
        <View style={styles.badges}>
          <AppText variant="label" style={styles.badgeLabel}>
            VISUAL EVIDENCE: {evidenceLabel}
          </AppText>
          <AppText
            variant="label"
            style={[
              styles.badgeLabel,
              isAssessmentComplete ? styles.badgeComplete : styles.badgePending,
            ]}
          >
            ASSESSMENT: {assessmentLabel}
          </AppText>
        </View>
        {!isAssessmentComplete && (
          <Pressable
            style={({ pressed: p }) => [styles.completeCta, p && styles.completeCtaPressed]}
            onPress={onPress}
            hitSlop={8}
          >
            <AppText variant="label" style={styles.completeCtaText}>
              Complete
            </AppText>
          </Pressable>
        )}
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
  badges: {
    marginTop: spacing.xs,
  },
  badgeLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  badgePending: {
    color: colors.textMuted,
  },
  badgeComplete: {
    color: colors.valid,
  },
  completeCta: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  completeCtaPressed: { opacity: 0.8 },
  completeCtaText: {
    color: colors.primary,
    letterSpacing: 0.25,
  },
});
