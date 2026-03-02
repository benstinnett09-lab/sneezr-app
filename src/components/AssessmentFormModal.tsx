import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, OptionChip, SeverityScale } from './ui';
import { colors, spacing } from '../theme';
import { updateSneezeAssessment } from '../services';
import type { SneezeEvent, SneezeAssessmentPayload } from '../state/types';

const TRIGGER_OPTIONS: { value: string; label: string }[] = [
  { value: 'dust', label: 'Dust' },
  { value: 'pollen', label: 'Pollen' },
  { value: 'pet', label: 'Pet' },
  { value: 'food', label: 'Food' },
  { value: 'illness', label: 'Illness' },
  { value: 'irritant', label: 'Irritant' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

const ENVIRONMENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'indoors', label: 'Indoors' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'other', label: 'Other' },
];

const SYMPTOM_OPTIONS: { value: string; label: string }[] = [
  { value: 'watery_eyes', label: 'Watery eyes' },
  { value: 'runny_nose', label: 'Runny nose' },
  { value: 'congestion', label: 'Congestion' },
  { value: 'itchy_throat', label: 'Itchy throat' },
  { value: 'headache', label: 'Headache' },
  { value: 'none', label: 'None' },
];

const INTERVENTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'antihistamine', label: 'Antihistamine' },
  { value: 'nasal_spray', label: 'Nasal spray' },
  { value: 'rest', label: 'Rest' },
  { value: 'hydration', label: 'Hydration' },
  { value: 'other', label: 'Other' },
];

export interface AssessmentFormModalProps {
  visible: boolean;
  event: SneezeEvent;
  onClose: () => void;
  onSaved: (updated: SneezeEvent) => void;
}

export function AssessmentFormModal({
  visible,
  event,
  onClose,
  onSaved,
}: AssessmentFormModalProps) {
  const [severity, setSeverity] = useState<number | null>(event.severity ?? null);
  const [trigger, setTrigger] = useState<string | null>(event.trigger ?? null);
  const [environment, setEnvironment] = useState<string | null>(event.environment ?? null);
  const [symptoms, setSymptoms] = useState<string[]>(event.symptoms ?? []);
  const [intervention, setIntervention] = useState<string | null>(event.intervention ?? null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setSeverity(event.severity ?? null);
      setTrigger(event.trigger ?? null);
      setEnvironment(event.environment ?? null);
      setSymptoms(event.symptoms ?? []);
      setIntervention(event.intervention ?? null);
    }
  }, [visible, event]);

  const toggleSymptom = useCallback((value: string) => {
    if (value === 'none') {
      setSymptoms([]);
      return;
    }
    setSymptoms((prev) => {
      const withoutNone = prev.filter((s) => s !== 'none');
      return withoutNone.includes(value)
        ? withoutNone.filter((s) => s !== value)
        : [...withoutNone, value];
    });
  }, []);

  const buildPayload = useCallback((): SneezeAssessmentPayload => ({
    severity: severity ?? undefined,
    trigger: trigger ?? undefined,
    environment: environment ?? undefined,
    symptoms: symptoms.length ? symptoms : undefined,
    intervention: intervention ?? undefined,
  }), [severity, trigger, environment, symptoms, intervention]);

  const handleCommit = useCallback(async () => {
    const payload = buildPayload();
    const isFirstCompletion = event.assessmentCompletedAt == null;
    const completedAt = isFirstCompletion ? Date.now() : (event.assessmentCompletedAt ?? Date.now());

    const optimistic: SneezeEvent = {
      ...event,
      severity: payload.severity ?? event.severity,
      trigger: payload.trigger ?? event.trigger,
      environment: payload.environment ?? event.environment,
      symptoms: payload.symptoms ?? event.symptoms,
      intervention: payload.intervention ?? event.intervention,
      assessmentCompletedAt: completedAt,
      updatedAt: Date.now(),
    };

    onSaved(optimistic);
    onClose();
    setSaving(true);

    const result = await updateSneezeAssessment(event.id, payload);
    setSaving(false);

    if ('error' in result) {
      Alert.alert('Save failed', result.error.message);
      onSaved(event);
      return;
    }
    onSaved(result.event);
  }, [event, buildPayload, onSaved, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={16}>
            <AppText variant="body">Close</AppText>
          </Pressable>
          <AppText variant="subtitle">Post-Event Assessment</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="label" style={styles.fieldLabel}>
            1. Severity Index (1–5)
          </AppText>
          <SeverityScale value={severity} onChange={setSeverity} />

          <AppText variant="label" style={styles.fieldLabel}>
            2. Suspected Trigger
          </AppText>
          <View style={styles.chipRow}>
            {TRIGGER_OPTIONS.map(({ value: v, label }) => (
              <OptionChip
                key={v}
                label={label}
                selected={trigger === v}
                onPress={() => setTrigger(v)}
              />
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            3. Environment
          </AppText>
          <View style={styles.chipRow}>
            {ENVIRONMENT_OPTIONS.map(({ value: v, label }) => (
              <OptionChip
                key={v}
                label={label}
                selected={environment === v}
                onPress={() => setEnvironment(v)}
              />
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            4. Associated Symptoms (select all that apply)
          </AppText>
          <View style={styles.chipRow}>
            {SYMPTOM_OPTIONS.map(({ value: v, label }) => (
              <OptionChip
                key={v}
                label={label}
                selected={v === 'none' ? symptoms.length === 0 : symptoms.includes(v)}
                onPress={() => toggleSymptom(v)}
              />
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            5. Intervention Applied
          </AppText>
          <View style={styles.chipRow}>
            {INTERVENTION_OPTIONS.map(({ value: v, label }) => (
              <OptionChip
                key={v}
                label={label}
                selected={intervention === v}
                onPress={() => setIntervention(v)}
              />
            ))}
          </View>

          <Button
            title="Commit Observations"
            onPress={handleCommit}
            loading={saving}
            style={styles.commitBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSpacer: { width: 60 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing['2xl'] },
  fieldLabel: {
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  commitBtn: { marginTop: spacing.xl },
});
