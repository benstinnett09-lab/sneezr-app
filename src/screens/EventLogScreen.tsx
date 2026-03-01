import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { AppText } from '../components/ui';
import { EventRow } from '../components/EventRow';
import { PhotoEvidenceModal } from '../components/PhotoEvidenceModal';
import { colors, spacing } from '../theme';
import { listSneezes } from '../services';
import type { SneezeEvent } from '../state/types';

export function EventLogScreen() {
  const [events, setEvents] = useState<SneezeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SneezeEvent | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadEvents = useCallback(async () => {
    const result = await listSneezes({ limit: 100 });
    if ('error' in result) {
      setEvents([]);
      return;
    }
    setEvents(result.events);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEvents();
      setLoading(false);
    })();
  }, [loadEvents]);

  const handleRowPress = useCallback((event: SneezeEvent) => {
    setSelectedEvent(event);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedEvent(null);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="title">Event Log</AppText>
      <AppText variant="body" muted style={styles.subtitle}>
        Recorded events.
      </AppText>

      {events.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="body" muted>
            No events recorded.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <EventRow
              event={item}
              onPress={() => handleRowPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      <PhotoEvidenceModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  list: { flex: 1 },
  listContent: {
    paddingBottom: spacing['2xl'],
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
