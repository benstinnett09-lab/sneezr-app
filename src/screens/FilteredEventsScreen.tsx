import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText } from '../components/ui';
import { EventRow } from '../components/EventRow';
import { colors, spacing } from '../theme';
import { listSneezes } from '../services';
import type { SneezeEvent } from '../state/types';
import type { AnalysisStackParamList } from '../navigation';

type FilteredEventsNav = NativeStackNavigationProp<
  AnalysisStackParamList,
  'FilteredEvents'
>;

type RouteParams = AnalysisStackParamList['FilteredEvents'];

export function FilteredEventsScreen() {
  const route = useRoute();
  const navigation = useNavigation<FilteredEventsNav>();
  const { filterType, filterValue } = route.params as RouteParams;

  const [events, setEvents] = useState<SneezeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    const result = await listSneezes({ limit: 500 });
    if ('error' in result) {
      setEvents([]);
      return;
    }
    const filtered = result.events.filter((e) => {
      const v = e[filterType];
      return v != null && String(v).trim() === filterValue;
    });
    setEvents(filtered);
  }, [filterType, filterValue]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await loadEvents();
      setLoading(false);
    })();
  }, [loadEvents]);

  const handleRowPress = useCallback(
    (event: SneezeEvent) => {
      navigation.navigate('EventDetail', { event });
    },
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <AppText variant="body" muted>
            No events match this filter.
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      style={styles.list}
      renderItem={({ item }) => (
        <EventRow event={item} onPress={() => handleRowPress(item)} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
});
