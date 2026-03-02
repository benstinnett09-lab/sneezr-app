import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
  Modal,
  Text,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppText } from '../components/ui';
import { TelemetryCard } from '../components/TelemetryCard';
import { ControlSurfaceButton } from '../components/ControlSurfaceButton';
import { colors, spacing, fontFamilies, fontWeights } from '../theme';
import {
  listSneezes,
  createSneeze,
  uploadSneezePhoto,
  getCurrentUserId,
} from '../services';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const COMPRESS_WIDTH = 1024;
const COMPRESS_QUALITY = 0.8;
const CONFIRMATION_DURATION_MS = 2500;

/** Show alert; on web use window.alert so user sees errors. */
function alertUser(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert([title, message].filter(Boolean).join('\n'));
  } else {
    Alert.alert(title, message);
  }
}

function countLast24h(events: { timestamp: number }[]): number {
  const cutoff = Date.now() - ONE_DAY_MS;
  return events.filter((e) => e.timestamp >= cutoff).length;
}

export function MonitorScreen() {
  const [count24h, setCount24h] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showWebRecordModal, setShowWebRecordModal] = useState(false);
  const isWeb = Platform.OS === 'web';

  const refreshCount = useCallback(async () => {
    const result = await listSneezes({ limit: 200 });
    if ('error' in result) {
      setCount24h(0);
      return;
    }
    setCount24h(countLast24h(result.events));
  }, []);

  useEffect(() => {
    (async () => {
      await refreshCount();
      setRefreshing(false);
    })();
  }, [refreshCount]);

  const showAnomalyRegistered = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  useEffect(() => {
    if (!showConfirmation) return;
    const t = setTimeout(() => setShowConfirmation(false), CONFIRMATION_DURATION_MS);
    return () => clearTimeout(t);
  }, [showConfirmation]);

  const recordWithPhoto = async (uri: string) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      alertUser('Error', 'Session expired. Please restart the app.');
      return;
    }

    setLoading(true);
    try {
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: COMPRESS_WIDTH } }],
        { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );

      const uploadResult = await uploadSneezePhoto({
        userId,
        localUri: compressed.uri,
      });
      if ('error' in uploadResult) {
        alertUser('Upload failed', uploadResult.error.message);
        return;
      }

      const createResult = await createSneeze({
        timestamp: Date.now(),
        photoUrl: uploadResult.photoUrl,
      });
      if ('error' in createResult) {
        alertUser('Error', createResult.error.message);
        return;
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await refreshCount();
      showAnomalyRegistered();
    } finally {
      setLoading(false);
    }
  };

  const recordWithoutPhoto = async () => {
    setLoading(true);
    try {
      const result = await createSneeze({ timestamp: Date.now() });
      if ('error' in result) {
        alertUser('Error', result.error.message);
        return;
      }
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await refreshCount();
      showAnomalyRegistered();
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alertUser('Permission required', 'Camera access is needed to capture evidence.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        await recordWithPhoto(result.assets[0].uri);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('simulator') || msg.includes('not available') || msg.includes('Camera')) {
        alertUser(
          'Camera unavailable',
          'Camera is not available in the simulator. Use a physical device or choose from library.'
        );
      } else {
        alertUser('Error', msg);
      }
    }
  };

  const handleChooseLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alertUser('Permission required', 'Photo library access is needed to attach evidence.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        await recordWithPhoto(result.assets[0].uri);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alertUser('Error', msg);
    }
  };

  const showRecordOptions = () => {
    const options = ['Take Photo', 'Choose From Library', 'Skip Evidence', 'Cancel'];
    const cancelIndex = 3;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
        },
        async (index) => {
          if (index === 0) await handleTakePhoto();
          else if (index === 1) await handleChooseLibrary();
          else if (index === 2) await recordWithoutPhoto();
        }
      );
    } else if (isWeb) {
      setShowWebRecordModal(true);
    } else {
      Alert.alert(
        'Record nasal event',
        'Add evidence or log without.',
        [
          { text: 'Take Photo', onPress: handleTakePhoto },
          { text: 'Choose From Library', onPress: handleChooseLibrary },
          { text: 'Skip Evidence', onPress: recordWithoutPhoto },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const closeWebRecordModal = () => setShowWebRecordModal(false);

  const webOption = (label: string, onPress: () => void | Promise<void>) => (
    <Pressable
      style={({ pressed }) => [styles.webOption, pressed && styles.webOptionPressed]}
      onPress={() => {
        closeWebRecordModal();
        void onPress();
      }}
    >
      <AppText variant="body" style={styles.webOptionText}>{label}</AppText>
    </Pressable>
  );

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="title" style={styles.header}>
          NASAL EVENT TELEMETRY
        </AppText>
        <AppText variant="body" muted style={styles.subtitle}>
          Biosurveillance console.
        </AppText>

        <TelemetryCard title="EVENT COUNT (24H)" style={styles.telemetryCard}>
          <AppText variant="mono" style={styles.countValue}>
            {refreshing ? '—' : String(count24h)}
          </AppText>
        </TelemetryCard>

        <ControlSurfaceButton
          title="INITIATE NASAL EVENT CAPTURE"
          variant="primary"
          pulse
          onPress={showRecordOptions}
          disabled={loading}
          style={styles.primaryButton}
        />
      </ScrollView>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowConfirmation(false)}
        >
          <View style={styles.confirmationCard}>
            <Text style={styles.confirmationText}>ANOMALY REGISTERED</Text>
          </View>
        </Pressable>
      </Modal>

      {isWeb && (
        <Modal
          visible={showWebRecordModal}
          transparent
          animationType="fade"
          onRequestClose={closeWebRecordModal}
        >
          <View style={styles.webModalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeWebRecordModal} />
            <View style={styles.webModalCard}>
              <AppText variant="label" muted style={styles.webModalTitle}>
                RECORD NASAL EVENT
              </AppText>
              <AppText variant="body" muted style={styles.webModalSubtitle}>
                Add evidence or log without.
              </AppText>
              {webOption('Take Photo', handleTakePhoto)}
              {webOption('Choose From Library', handleChooseLibrary)}
              {webOption('Skip Evidence', recordWithoutPhoto)}
              <Pressable
                style={({ pressed }) => [styles.webOption, styles.webOptionCancel, pressed && styles.webOptionPressed]}
                onPress={closeWebRecordModal}
              >
                <AppText variant="body" style={styles.webOptionTextCancel}>Cancel</AppText>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  header: {
    color: colors.text,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  telemetryCard: {
    marginBottom: spacing.lg,
  },
  countValue: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    letterSpacing: 2,
  },
  primaryButton: {
    marginTop: spacing.xl,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  confirmationCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 20,
      },
      default: {},
    }),
  },
  confirmationText: {
    fontFamily: fontFamilies.mono,
    fontSize: 22,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    letterSpacing: 3,
  },
  webModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 13, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  webModalCard: {
    zIndex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: 8,
    padding: spacing.lg,
    minWidth: 280,
    maxWidth: 360,
  },
  webModalTitle: {
    marginBottom: spacing.xs,
  },
  webModalSubtitle: {
    marginBottom: spacing.lg,
  },
  webOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  webOptionCancel: {
    borderBottomWidth: 0,
    marginTop: spacing.xs,
  },
  webOptionPressed: {
    opacity: 0.8,
  },
  webOptionText: {
    color: colors.primary,
  },
  webOptionTextCancel: {
    color: colors.textMuted,
  },
});
