import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button } from './ui';
import { colors, spacing, radius } from '../theme';
import { updateSneezeAssessment } from '../services';
import type { SneezeEvent, SneezeAssessmentPayload } from '../state/types';

const TRIGGERS = ['pollen', 'dust', 'pepper', 'pet_dander', 'cold_air', 'other'];
const ENVIRONMENTS = ['indoors', 'outdoors', 'vehicle', 'office', 'other'];
const SYMPTOMS = ['runny_nose', 'itchy_eyes', 'congestion', 'fatigue', 'other'];
const INTERVENTIONS = ['tissue', 'medication', 'avoided', 'none', 'other'];

export interface AssessmentModalProps {
  visible: boolean;
  event: SneezeEvent;
  onClose: () => void;
  onSaved: (updated: SneezeEvent) => void;
}

export function AssessmentModal({
  visible,
  event,
  onClose,
  onSaved,
}: AssessmentModalProps) {
  const [severity, setSeverity] = useState<number | null>(event.severity ?? null);
  const [trigger, setTrigger] = useState<string | null>(event.trigger ?? null);
  const [environment, setEnvironment] = useState<string | null>(event.environment ?? null);
  const [symptoms, setSymptoms] = useState<string[]>(event.symptoms ?? []);
  const [intervention, setIntervention] = useState<string | null>(event.intervention ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setSeverity(event.severity ?? null);
      setTrigger(event.trigger ?? null);
      setEnvironment(event.environment ?? null);
      setSymptoms(event.symptoms ?? []);
      setIntervention(event.intervention ?? null);
    }
  }, [visible, event]);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await updateSneezeAssessment(event.id, {
      severity: severity ?? undefined,
      trigger: trigger ?? undefined,
      environment: environment ?? undefined,
      symptoms: symptoms.length ? symptoms : undefined,
      intervention: intervention ?? undefined,
    });
    setLoading(false);
    if ('error' in result) {
      Alert.alert('Error', result.error.message);
      return;
    }
    onSaved(result.event);
  };

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
          <AppText variant="subtitle">Assessment</AppText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="label" style={styles.fieldLabel}>
            Severity (1–5)
          </AppText>
          <View style={styles.severityRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[styles.severityBtn, severity === n && styles.severityBtnActive]}
                onPress={() => setSeverity(n)}
              >
                <AppText style={severity === n ? styles.severityBtnTextActive : undefined}>
                  {n}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            Trigger
          </AppText>
          <View style={styles.optionsRow}>
            {TRIGGERS.map((t) => (
              <Pressable
                key={t}
                style={[styles.optionChip, trigger === t && styles.optionChipActive]}
                onPress={() => setTrigger(t)}
              >
                <AppText
                  variant="body"
                  style={trigger === t ? styles.optionChipTextActive : undefined}
                >
                  {t.replace('_', ' ')}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            Environment
          </AppText>
          <View style={styles.optionsRow}>
            {ENVIRONMENTS.map((e) => (
              <Pressable
                key={e}
                style={[styles.optionChip, environment === e && styles.optionChipActive]}
                onPress={() => setEnvironment(e)}
              >
                <AppText
                  variant="body"
                  style={environment === e ? styles.optionChipTextActive : undefined}
                >
                  {e}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            Symptoms (select all that apply)
          </AppText>
          <View style={styles.optionsRow}>
            {SYMPTOMS.map((s) => (
              <Pressable
                key={s}
                style={[styles.optionChip, symptoms.includes(s) && styles.optionChipActive]}
                onPress={() => toggleSymptom(s)}
              >
                <AppText
                  variant="body"
                  style={symptoms.includes(s) ? styles.optionChipTextActive : undefined}
                >
                  {s.replace('_', ' ')}
                </AppText>
              </Pressable>
            ))}
          </View>

          <AppText variant="label" style={styles.fieldLabel}>
            Intervention
          </AppText>
          <View style={styles.optionsRow}>
            {INTERVENTIONS.map((i) => (
              <Pressable
                key={i}
                style={[styles.optionChip, intervention === i && styles.optionChipActive]}
                onPress={() => setIntervention(i)}
              >
                <AppText
                  variant="body"
                  style={intervention === i ? styles.optionChipTextActive : undefined}
                >
                  {i}
                </AppText>
              </Pressable>
            ))}
          </View>

          <Button
            title="Save"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
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
  severityRow: { flexDirection: 'row', marginBottom: spacing.sm },
  severityBtn: {
    marginRight: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  severityBtnTextActive: { color: colors.surface },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  optionChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipTextActive: { color: colors.surface },
  saveBtn: { marginTop: spacing.xl },
});
