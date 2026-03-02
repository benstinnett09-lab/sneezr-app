import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { AppText, Button, Card } from '../components/ui';
import { PhotoEvidenceModal } from '../components/PhotoEvidenceModal';
import { AssessmentFormModal } from '../components/AssessmentFormModal';
import { colors, spacing, radius } from '../theme';
import { formatAbsolute, formatRelative } from '../utils/date';
import { usePhotoDisplayUrl } from '../hooks/usePhotoDisplayUrl';
import type { SneezeEvent } from '../state/types';
import type {
  EventLogStackScreenProps,
  AnalysisStackScreenProps,
} from '../navigation';

type Props =
  | EventLogStackScreenProps<'EventDetail'>
  | AnalysisStackScreenProps<'EventDetail'>;

export function EventDetailScreen({ route, navigation }: Props) {
  const { event } = route.params;
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [assessmentModalVisible, setAssessmentModalVisible] = useState(false);
  const [detailEvent, setDetailEvent] = useState<SneezeEvent>(event);
  const displayUrl = usePhotoDisplayUrl(detailEvent.photoUrl);
  const { width } = useWindowDimensions();

  const isAssessmentComplete = detailEvent.assessmentCompletedAt != null;

  const handleAssessmentSaved = (updated: SneezeEvent) => {
    setDetailEvent(updated);
    setAssessmentModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.card}>
        <AppText variant="label" style={styles.label}>
          TIMESTAMP
        </AppText>
        <AppText variant="mono" style={styles.absolute}>
          {formatAbsolute(detailEvent.timestamp)}
        </AppText>
        <AppText variant="body" muted>
          {formatRelative(detailEvent.timestamp)}
        </AppText>
      </Card>

      <AppText variant="label" style={styles.sectionLabel}>
        VISUAL EVIDENCE
      </AppText>
      {detailEvent.photoUrl ? (
        <Pressable onPress={() => setPhotoModalVisible(true)}>
          <Card style={styles.photoCard}>
            <Image
              source={{ uri: displayUrl ?? detailEvent.photoUrl }}
              style={[styles.thumbnail, { width: width - spacing.md * 4 }]}
              resizeMode="cover"
            />
            <AppText variant="label" muted style={styles.photoCaption}>
              Tap to expand. Scene documentation.
            </AppText>
          </Card>
        </Pressable>
      ) : (
        <Card style={styles.placeholderCard}>
          <AppText variant="body" muted>
            No visual evidence attached.
          </AppText>
        </Card>
      )}

      <AppText variant="label" style={styles.sectionLabel}>
        ASSESSMENT STATUS
      </AppText>
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            isAssessmentComplete ? styles.badgeComplete : styles.badgePending,
          ]}
        >
          <AppText
            variant="label"
            style={[
              styles.badgeText,
              isAssessmentComplete ? styles.badgeTextComplete : styles.badgeTextPending,
            ]}
          >
            {isAssessmentComplete ? 'COMPLETE' : 'PENDING'}
          </AppText>
        </View>
      </View>

      <Button
        title={isAssessmentComplete ? 'Edit Assessment' : 'Complete Assessment'}
        onPress={() => setAssessmentModalVisible(true)}
        style={styles.cta}
      />

      <PhotoEvidenceModal
        visible={photoModalVisible}
        event={detailEvent}
        onClose={() => setPhotoModalVisible(false)}
      />

      <AssessmentFormModal
        visible={assessmentModalVisible}
        event={detailEvent}
        onClose={() => setAssessmentModalVisible(false)}
        onSaved={handleAssessmentSaved}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing['2xl'] },
  card: { marginBottom: spacing.md },
  label: { color: colors.textMuted, letterSpacing: 0.5 },
  absolute: { marginTop: spacing.xs },
  sectionLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  photoCard: { padding: 0, overflow: 'hidden' },
  thumbnail: { height: 220 },
  photoCaption: { padding: spacing.sm },
  placeholderCard: { marginBottom: spacing.sm },
  badgeRow: { marginBottom: spacing.lg },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgePending: { backgroundColor: colors.border },
  badgeComplete: { backgroundColor: colors.validMuted },
  badgeText: { letterSpacing: 0.5 },
  badgeTextPending: { color: colors.textSecondary },
  badgeTextComplete: { color: colors.valid },
  cta: { marginTop: spacing.sm },
});
