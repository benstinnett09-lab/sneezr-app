import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from './ui';
import { colors, spacing } from '../theme';
import { formatAbsolute } from '../utils/date';
import { usePhotoDisplayUrl } from '../hooks/usePhotoDisplayUrl';
import type { SneezeEvent } from '../state/types';

export interface PhotoEvidenceModalProps {
  visible: boolean;
  event: SneezeEvent | null;
  onClose: () => void;
}

export function PhotoEvidenceModal({
  visible,
  event,
  onClose,
}: PhotoEvidenceModalProps) {
  const { width, height } = useWindowDimensions();
  const displayUrl = usePhotoDisplayUrl(event?.photoUrl);

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={16}>
              <AppText variant="body" style={styles.close}>
                Close
              </AppText>
            </Pressable>
          </View>
          <View style={[styles.media, { width, height: height - 120 }]}>
            {event.photoUrl ? (
              <Image
                source={{ uri: displayUrl ?? event.photoUrl }}
                style={[styles.image, { width, height: height - 120 }]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.placeholder, { width, height: height - 120 }]}>
                <AppText variant="body" muted>
                  No visual evidence
                </AppText>
              </View>
            )}
          </View>
          <View style={styles.footer}>
            <AppText variant="mono" style={styles.timestamp}>
              {formatAbsolute(event.timestamp)}
            </AppText>
            <AppText variant="label" style={styles.caption}>
              Scene Documentation
            </AppText>
          </View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  close: {
    color: colors.surface,
  },
  media: {
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  timestamp: {
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  caption: {
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },
});
