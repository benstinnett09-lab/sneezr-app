import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppText, Card } from '../components/ui';
import { colors, spacing } from '../theme';
import { listSneezes } from '../services';
import type { SneezeEvent } from '../state/types';
import { computeAnalysisStats } from '../utils/analysis';
import type { AnalysisStats, CountMap, SeverityHistogram } from '../utils/analysis';
import type { AnalysisStackParamList } from '../navigation';
import type { CategoricalFilterType } from '../navigation';

const MIN_ASSESSED_FOR_INFERENCE = 3;

/** Sort CountMap entries by count descending, then by label. */
function sortedCountEntries(map: CountMap): [string, number][] {
  return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Format completion rate as percentage. */
function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

/** Bar-list row for a single (label, count) with optional max for bar width. */
function BarRow({
  label,
  count,
  maxCount,
  onPress,
}: {
  label: string;
  count: number;
  maxCount: number;
  onPress?: () => void;
}) {
  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const content = (
    <>
      <AppText variant="body" numberOfLines={1} style={styles.barLabel}>
        {label}
      </AppText>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barWidth}%` }]} />
      </View>
      <AppText variant="mono" style={styles.barCount}>
        {count}
      </AppText>
    </>
  );
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.barRow, pressed && styles.barRowPressed]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.barRow}>{content}</View>;
}

/** Render a CountMap as a bar list; optional onPressItem for drill-down. */
function CountMapBarList({
  data,
  onPressItem,
}: {
  data: CountMap;
  onPressItem?: (label: string) => void;
}) {
  const entries = sortedCountEntries(data);
  const maxCount = Math.max(0, ...entries.map(([, c]) => c));
  if (entries.length === 0) {
    return (
      <AppText variant="body" muted>
        No data.
      </AppText>
    );
  }
  return (
    <>
      {entries.map(([label, count]) => (
        <BarRow
          key={label}
          label={label}
          count={count}
          maxCount={maxCount}
          onPress={onPressItem ? () => onPressItem(label) : undefined}
        />
      ))}
    </>
  );
}

/** Severity 1–5 as bar list. */
function SeverityBarList({ data }: { data: SeverityHistogram }) {
  const entries: [string, number][] = [1, 2, 3, 4, 5].map((s) => [
    `Severity ${s}`,
    data[s as 1 | 2 | 3 | 4 | 5],
  ]);
  const maxCount = Math.max(0, ...entries.map(([, c]) => c));
  return (
    <>
      {entries.map(([label, count]) => (
        <BarRow key={label} label={label} count={count} maxCount={maxCount} />
      ))}
    </>
  );
}

type AnalysisNav = NativeStackNavigationProp<AnalysisStackParamList, 'Analysis'>;

export function AnalysisScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AnalysisNav>();
  const [events, setEvents] = useState<SneezeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const drillToFiltered = useCallback(
    (filterType: CategoricalFilterType, filterValue: string) => {
      navigation.navigate('FilteredEvents', { filterType, filterValue });
    },
    [navigation]
  );

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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stats: AnalysisStats = computeAnalysisStats(events);
  const showInference = stats.assessedEventsCount >= MIN_ASSESSED_FOR_INFERENCE;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primary}
        />
      }
    >
      <AppText variant="title">Incident Analysis Console</AppText>
      <AppText variant="body" muted style={styles.subtitle}>
        Dataset summary and assessed-event distributions.
      </AppText>

      {/* Section 1: Dataset Overview */}
      <AppText variant="label" style={styles.sectionLabel}>
        DATASET OVERVIEW
      </AppText>
      <Card style={styles.card}>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewItem}>
            <AppText variant="label" muted>
              Total Recorded Events
            </AppText>
            <AppText variant="subtitle">{stats.totalEvents}</AppText>
          </View>
          <View style={styles.overviewItem}>
            <AppText variant="label" muted>
              Completed Assessments
            </AppText>
            <AppText variant="subtitle">{stats.assessedEventsCount}</AppText>
          </View>
          <View style={styles.overviewItem}>
            <AppText variant="label" muted>
              Assessment Completion Rate
            </AppText>
            <AppText variant="subtitle">
              {formatRate(stats.assessmentCompletionRate)}
            </AppText>
          </View>
          <View style={styles.overviewItem}>
            <AppText variant="label" muted>
              Mean Severity Index
            </AppText>
            <AppText variant="subtitle">
              {stats.meanSeverity != null
                ? stats.meanSeverity.toFixed(2)
                : '—'}
            </AppText>
          </View>
        </View>
      </Card>

      {!showInference ? (
        <Card style={styles.card}>
          <AppText variant="body" muted>
            Insufficient assessed events for statistical inference.
          </AppText>
        </Card>
      ) : (
        <>
          {/* Section 2: Severity Distribution */}
          <AppText variant="label" style={styles.sectionLabel}>
            SEVERITY DISTRIBUTION (1–5)
          </AppText>
          <Card style={styles.card}>
            <SeverityBarList data={stats.severityDistribution} />
          </Card>

          {/* Section 3: Trigger Attribution */}
          <AppText variant="label" style={styles.sectionLabel}>
            TRIGGER ATTRIBUTION DISTRIBUTION
          </AppText>
          <Card style={styles.card}>
            <CountMapBarList
              data={stats.triggerDistribution}
              onPressItem={(label) => drillToFiltered('trigger', label)}
            />
          </Card>

          {/* Section 4: Environmental Context */}
          <AppText variant="label" style={styles.sectionLabel}>
            ENVIRONMENTAL CONTEXT DISTRIBUTION
          </AppText>
          <Card style={styles.card}>
            <CountMapBarList
              data={stats.environmentDistribution}
              onPressItem={(label) => drillToFiltered('environment', label)}
            />
          </Card>

          {/* Section 5: Associated Symptom Frequency */}
          <AppText variant="label" style={styles.sectionLabel}>
            ASSOCIATED SYMPTOM FREQUENCY
          </AppText>
          <Card style={styles.card}>
            <CountMapBarList data={stats.symptomFrequency} />
          </Card>

          {/* Section 6: Intervention Application */}
          <AppText variant="label" style={styles.sectionLabel}>
            INTERVENTION APPLICATION DISTRIBUTION
          </AppText>
          <Card style={styles.card}>
            <CountMapBarList
              data={stats.interventionDistribution}
              onPressItem={(label) => drillToFiltered('intervention', label)}
            />
          </Card>
        </>
      )}
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
  sectionLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  overviewItem: {
    minWidth: '45%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barRowPressed: {
    opacity: 0.8,
  },
  barLabel: {
    width: 120,
    marginRight: spacing.sm,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.chart ?? colors.primary,
    borderRadius: 4,
  },
  barCount: {
    width: 32,
    textAlign: 'right',
    color: colors.textMuted,
  },
});
