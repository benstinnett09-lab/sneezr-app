import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform,
  RefreshControl,
} from 'react-native';
import { AppText, Button, Card } from '../components/ui';
import { colors, spacing } from '../theme';
import { shortenSubjectId } from '../utils/subject';
import {
  getCurrentUserId,
  listSneezes,
  signOut,
  clearLocalCache,
  boot,
} from '../services';

export function SubjectScreen() {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    const userId = await getCurrentUserId();
    setSubjectId(userId);
    const result = await listSneezes({ limit: 10000 });
    if ('error' in result) {
      setTotalEvents(0);
      return;
    }
    setTotalEvents(result.events.length);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const handleExport = useCallback(async () => {
    setActionLoading('export');
    try {
      const result = await listSneezes({ limit: 10000 });
      const events = 'error' in result ? [] : result.events;
      const payload = {
        exportedAt: new Date().toISOString(),
        subjectId: subjectId ?? null,
        eventCount: events.length,
        events,
      };
      const json = JSON.stringify(payload, null, 2);
      if (Platform.OS !== 'web') {
        await Share.share({
          message: json,
          title: 'Sneezr data export',
        });
        Alert.alert('Export complete.', 'Data shared.');
      } else {
        console.log('Sneezr export:', json);
        Alert.alert('Export complete.', 'Data written to console.');
      }
    } finally {
      setActionLoading(null);
    }
  }, [subjectId]);

  const handleClearCache = useCallback(async () => {
    setActionLoading('cache');
    try {
      await clearLocalCache();
      await boot();
      await load();
      Alert.alert('Local cache cleared.', 'Persisted data removed. Session re-initialized.');
    } finally {
      setActionLoading(null);
    }
  }, [load]);

  const handleSignOut = useCallback(async () => {
    setActionLoading('signout');
    try {
      const result = await signOut();
      if ('error' in result) {
        Alert.alert('Error', result.error.message);
        return;
      }
      await boot();
      await load();
      Alert.alert('Session terminated.', 'New subject ID assigned.');
    } finally {
      setActionLoading(null);
    }
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <AppText variant="body" muted>Loading subject data.</AppText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <AppText variant="title">Subject</AppText>
      <AppText variant="body" muted style={styles.subtitle}>
        Profile and session.
      </AppText>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          SUBJECT ID
        </AppText>
        <AppText variant="mono" style={styles.cardValue}>
          {subjectId ? shortenSubjectId(subjectId) : '—'}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          TOTAL EVENTS
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {totalEvents}
        </AppText>
      </Card>

      <AppText variant="label" style={styles.sectionLabel}>
        ACTIONS
      </AppText>

      <Button
        title="Export data"
        variant="secondary"
        loading={actionLoading === 'export'}
        onPress={handleExport}
        style={styles.button}
      />
      <Button
        title="Clear local cache"
        variant="secondary"
        loading={actionLoading === 'cache'}
        onPress={handleClearCache}
        style={styles.button}
      />
      <Button
        title="Sign out / reset session"
        variant="secondary"
        loading={actionLoading === 'signout'}
        onPress={handleSignOut}
        style={styles.button}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  cardValue: {
    marginTop: spacing.xs,
    color: colors.text,
  },
  sectionLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  button: {
    marginBottom: spacing.sm,
  },
});
