import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { AppText, Card } from '../components/ui';
import { colors, spacing } from '../theme';
import { listSneezes } from '../services';
import type { SneezeEvent } from '../state/types';
import {
  totalRecordedEvents,
  eventsToday,
  meanEventsPerDayLast14,
  peakActivityWindow,
  formatHourWindow,
  eventContinuityIndex,
  getActivityByDay,
} from '../utils/stats';

export function AnalysisScreen() {
  const [events, setEvents] = useState<SneezeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await listSneezes({ limit: 500 });
    if ('error' in result) {
      setEvents([]);
      return;
    }
    setEvents(result.events);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const total = totalRecordedEvents(events);
  const today = eventsToday(events);
  const mean14 = meanEventsPerDayLast14(events);
  const peakHour = peakActivityWindow(events);
  const continuity = eventContinuityIndex(events);
  const activityByDay = getActivityByDay(events);

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
      <AppText variant="title">Analysis</AppText>
      <AppText variant="body" muted style={styles.subtitle}>
        Data summary.
      </AppText>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          TOTAL RECORDED EVENTS
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {total}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          EVENTS TODAY
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {today}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          MEAN EVENTS / DAY (LAST 14 DAYS)
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {mean14.toFixed(2)}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          PEAK ACTIVITY WINDOW
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {formatHourWindow(peakHour)}
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="label" style={styles.cardLabel}>
          EVENT CONTINUITY INDEX
        </AppText>
        <AppText variant="subtitle" style={styles.cardValue}>
          {continuity} day{continuity !== 1 ? 's' : ''}
        </AppText>
      </Card>

      <AppText variant="subtitle" style={styles.sectionTitle}>
        Activity by Day
      </AppText>
      <Card style={styles.tableCard}>
        {activityByDay.length === 0 ? (
          <AppText variant="body" muted>
            No data.
          </AppText>
        ) : (
          activityByDay.map((row, i) => (
            <View
              key={row.dateKey}
              style={[
                styles.tableRow,
                i < activityByDay.length - 1 && styles.tableRowBorder,
              ]}
            >
              <AppText variant="body">{row.label}</AppText>
              <AppText variant="mono" style={styles.tableCount}>
                {row.count}
              </AppText>
            </View>
          ))
        )}
      </Card>
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
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  tableCard: {
    paddingVertical: 0,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tableCount: {
    color: colors.chart,
  },
});
