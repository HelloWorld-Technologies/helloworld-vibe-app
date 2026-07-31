import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { VisitContactDetails } from '@/types/visit';

type HdpVisitDetailsFormProps = {
  value: VisitContactDetails;
  errors?: Partial<Record<keyof VisitContactDetails, string>>;
  submitError?: string;
  scheduleLabel: string;
  loading?: boolean;
  onChange: (value: VisitContactDetails) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export function HdpVisitDetailsForm({
  value,
  errors,
  submitError,
  scheduleLabel,
  loading,
  onChange,
  onBack,
  onSubmit,
}: HdpVisitDetailsFormProps) {
  function updateField<K extends keyof VisitContactDetails>(key: K, fieldValue: VisitContactDetails[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryCopy}>
          <Typography variant="text" size="xs" color={palette.gray[600]}>
            Your house visit time
          </Typography>
          <Typography variant="text" size="sm" weight="bold">
            {scheduleLabel}
          </Typography>
        </View>
        <Pressable onPress={onBack} accessibilityRole="button">
          <Typography variant="text" size="sm" weight="bold" color={palette.helloLime}>
            Edit
          </Typography>
        </Pressable>
      </View>

      <Typography variant="text" size="md" weight="bold">
        Enter your details
      </Typography>

      <TextField
        label="Full Name"
        value={value.name}
        onChangeText={(text) => updateField('name', text)}
        autoCapitalize="words"
        error={errors?.name}
        placeholder="Please enter your full name"
      />

      <TextField
        label="Email"
        value={value.email}
        onChangeText={(text) => updateField('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors?.email}
        placeholder="Please enter valid email id"
      />

      {submitError ? (
        <Typography variant="text" size="xs" color={palette.red[600]}>
          {submitError}
        </Typography>
      ) : null}

      <Button label="Create Visit" onPress={onSubmit} loading={loading} style={styles.cta} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: palette.lime[50],
    borderRadius: Radius.md,
    padding: 14,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  cta: {
    marginTop: 8,
  },
});
