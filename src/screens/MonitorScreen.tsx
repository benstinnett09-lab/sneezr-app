import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppText, Button, ReadoutCard } from '../components/ui';
import { colors, spacing } from '../theme';
import {
  listSneezes,
  createSneeze,
  uploadSneezePhoto,
  getCurrentUserId,
} from '../services';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const COMPRESS_WIDTH = 1024;
const COMPRESS_QUALITY = 0.8;

function countLast24h(events: { timestamp: number }[]): number {
  const cutoff = Date.now() - ONE_DAY_MS;
  return events.filter((e) => e.timestamp >= cutoff).length;
}

export function MonitorScreen() {
  const [count24h, setCount24h] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

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

  const recordWithPhoto = async (uri: string) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      Alert.alert('Error', 'Session expired. Please restart the app.');
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
        Alert.alert('Upload failed', uploadResult.error.message);
        return;
      }

      const createResult = await createSneeze({
        timestamp: Date.now(),
        photoUrl: uploadResult.photoUrl,
      });
      if ('error' in createResult) {
        Alert.alert('Error', createResult.error.message);
        return;
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await refreshCount();
      Alert.alert('Recorded.', 'Event logged with photographic evidence.');
    } finally {
      setLoading(false);
    }
  };

  const recordWithoutPhoto = async () => {
    setLoading(true);
    try {
      const result = await createSneeze({ timestamp: Date.now() });
      if ('error' in result) {
        Alert.alert('Error', result.error.message);
        return;
      }
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await refreshCount();
      Alert.alert('Recorded.', 'Event logged. No evidence attached.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to capture evidence.');
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
  };

  const handleChooseLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to attach evidence.');
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppText variant="title">Nasal Activity Monitor</AppText>
      <AppText variant="body" muted style={styles.subtitle}>
        Live observation.
      </AppText>

      <ReadoutCard
        label="SNEEZE EVENTS (LAST 24H)"
        value={refreshing ? 0 : count24h}
      />

      <Button
        title="Record Nasal Event"
        onPress={showRecordOptions}
        loading={loading}
        style={styles.primaryButton}
      />
    </ScrollView>
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
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    marginTop: spacing.xl,
  },
});
