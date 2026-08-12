import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { FormSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import { getEmergencyContactDetails, postEmergencyContactDetails } from '@/api/user';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { EmergencyContactDetails } from '@/types/emergency-contact';
import {
  hasCompleteEmergencyContact,
  validateEmergencyContactForm,
} from '@/utils/emergency-contact-validation';
import { useTenantProfile } from '@/stores/tenant-store';

const EMPTY_FORM: EmergencyContactDetails = {
  name: '',
  mobile: '',
  relation: '',
};

function EmergencyContactCard({ details }: { details: EmergencyContactDetails }) {
  const rows = [
    { label: 'Name', value: details.name },
    { label: 'Mobile Number', value: details.mobile },
    { label: 'Relation', value: details.relation },
  ];

  return (
    <View style={styles.card}>
      {rows.map((row, index) => (
        <View key={row.label}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <View style={styles.row}>
            <Typography variant="label" size="xs" color={palette.gray[500]}>
              {row.label}
            </Typography>
            <Typography variant="text" size="md" weight="medium">
              {row.value}
            </Typography>
          </View>
        </View>
      ))}
    </View>
  );
}

export function EmergencyContactProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedDetails, setSavedDetails] = useState<EmergencyContactDetails | null>(null);
  const [form, setForm] = useState<EmergencyContactDetails>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof EmergencyContactDetails, string>>>({});

  const fetchDetails = useCallback(async () => {
    if (!profile?.bookingId) {
      setLoading(false);
      setIsEditing(true);
      return;
    }

    setLoading(true);
    const response = await getEmergencyContactDetails(profile.bookingId);
    const data = response?.data;

    if (response?.success && hasCompleteEmergencyContact(data)) {
      const details = {
        name: data!.name!.trim(),
        mobile: data!.mobile!.trim(),
        relation: data!.relation!.trim(),
      };
      setSavedDetails(details);
      setForm(details);
      setIsEditing(false);
    } else {
      setSavedDetails(null);
      setForm(EMPTY_FORM);
      setIsEditing(true);
    }

    setLoading(false);
  }, [profile?.bookingId]);

  useEffect(() => {
    void fetchDetails();
  }, [fetchDetails]);

  function updateField<K extends keyof EmergencyContactDetails>(
    field: K,
    value: EmergencyContactDetails[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function handleSave() {
    const nextErrors = validateEmergencyContactForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const response = await postEmergencyContactDetails({
      contact_name: form.name.trim(),
      mobile: form.mobile.trim(),
      relation_to_customer: form.relation.trim(),
      bookingId: profile?.bookingId,
    });
    setSaving(false);

    if (response?.success) {
      const details = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        relation: form.relation.trim(),
      };
      setSavedDetails(details);
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['booking-status'] });
      Alert.alert('Saved', response.data ?? 'Emergency contact updated successfully');
      return;
    }

    Alert.alert('Unable to save', response?.error ?? response?.message ?? 'Please try again');
  }

  function handleEdit() {
    if (savedDetails) {
      setForm(savedDetails);
    }
    setErrors({});
    setIsEditing(true);
  }

  return (
    <ProfileStackScreen title="Emergency Contact Details" style={styles.screen}>
      {loading ? (
        <FormSkeleton style={styles.centered} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 12) }]}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            {isEditing ? (
              <View style={styles.form}>
                <TextField
                  label="Name"
                  placeholder="Enter Full Name"
                  value={form.name}
                  onChangeText={(value) => updateField('name', value)}
                  error={errors.name}
                  autoCapitalize="words"
                  containerStyle={styles.field}
                />
                <TextField
                  label="Mobile Number"
                  placeholder="Enter Mobile Number"
                  value={form.mobile}
                  onChangeText={(value) => updateField('mobile', value.replace(/\D/g, '').slice(0, 10))}
                  error={errors.mobile}
                  keyboardType="number-pad"
                  maxLength={10}
                  containerStyle={styles.field}
                />
                <TextField
                  label="Relation"
                  placeholder="Enter Relation"
                  value={form.relation}
                  onChangeText={(value) => updateField('relation', value)}
                  error={errors.relation}
                  autoCapitalize="words"
                  containerStyle={styles.field}
                />
              </View>
            ) : savedDetails ? (
              <EmergencyContactCard details={savedDetails} />
            ) : null}

            <View style={styles.footer}>
              {isEditing ? (
                <Button label="Save Details" loading={saving} onPress={handleSave} />
              ) : (
                <Button label="Edit Details" onPress={handleEdit} />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.gray[50],
    paddingTop: 0,
  },
  flex: {
    flex: 1,
  },
  centered: {
    marginTop: 16,
  },
  scroll: {
    gap: 20,
  },
  form: {
    gap: 10,
  },
  field: {
    gap: 4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    paddingHorizontal: 14,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    paddingVertical: 12,
    gap: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
  footer: {
    paddingTop: 4,
  },
});
