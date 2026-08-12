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
import { getBankDetails, postBankDetails } from '@/api/user';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { BankDetails, BankDetailsForm } from '@/types/bank-details';
import {
  hasCompleteBankDetails,
  validateBankForm,
} from '@/utils/bank-details-validation';
import { useTenantProfile } from '@/stores/tenant-store';

const EMPTY_FORM: BankDetailsForm = {
  name: '',
  accountNumber: '',
  reEnterAccountNumber: '',
  ifscCode: '',
};

function BankDetailsCard({ details }: { details: BankDetails }) {
  const rows = [
    { label: 'Name', value: details.name },
    { label: 'Account Number', value: details.accountNumber },
    { label: 'IFSC Code', value: details.ifscCode },
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

export function BankDetailsProfileScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savedDetails, setSavedDetails] = useState<BankDetails | null>(null);
  const [form, setForm] = useState<BankDetailsForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BankDetailsForm, string>>>({});

  const fetchDetails = useCallback(async () => {
    if (!profile?.bookingId) {
      setLoading(false);
      setIsEditing(true);
      return;
    }

    setLoading(true);
    const response = await getBankDetails(profile.bookingId);
    const data = response?.data;

    if (response?.success && hasCompleteBankDetails(data)) {
      const details = {
        name: data!.name!.trim(),
        accountNumber: data!.accountNumber!.trim(),
        ifscCode: data!.ifscCode!.trim(),
      };
      setSavedDetails(details);
      setForm({
        ...details,
        reEnterAccountNumber: details.accountNumber,
      });
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

  function updateField<K extends keyof BankDetailsForm>(field: K, value: BankDetailsForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  async function handleSave() {
    const nextErrors = validateBankForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const response = await postBankDetails({
      name: form.name.trim(),
      accountNumber: form.accountNumber.trim(),
      ifscCode: form.ifscCode.trim().toUpperCase(),
      booking_id: profile?.bookingId,
    });
    setSaving(false);

    if (response?.success) {
      const details = {
        name: form.name.trim(),
        accountNumber: form.accountNumber.trim(),
        ifscCode: form.ifscCode.trim().toUpperCase(),
      };
      setSavedDetails(details);
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ['booking-status'] });
      Alert.alert('Saved', response.data ?? 'Bank details updated successfully');
      return;
    }

    Alert.alert('Unable to save', response?.message ?? 'Please try again');
  }

  function handleEdit() {
    if (savedDetails) {
      setForm({
        ...savedDetails,
        reEnterAccountNumber: savedDetails.accountNumber,
      });
    }
    setErrors({});
    setIsEditing(true);
  }

  return (
    <ProfileStackScreen title="Bank Details" style={styles.screen}>
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
                  label="Account Number"
                  placeholder="Enter your Account Number"
                  value={form.accountNumber}
                  onChangeText={(value) => updateField('accountNumber', value)}
                  error={errors.accountNumber}
                  keyboardType="number-pad"
                  containerStyle={styles.field}
                />
                <TextField
                  label="Re- Enter Account Number"
                  placeholder="Enter your Account Number"
                  value={form.reEnterAccountNumber}
                  onChangeText={(value) => updateField('reEnterAccountNumber', value)}
                  error={errors.reEnterAccountNumber}
                  keyboardType="number-pad"
                  containerStyle={styles.field}
                />
                <TextField
                  label="IFSC Code"
                  placeholder="Enter IFSC Code"
                  value={form.ifscCode}
                  onChangeText={(value) => updateField('ifscCode', value.toUpperCase())}
                  error={errors.ifscCode}
                  autoCapitalize="characters"
                  containerStyle={styles.field}
                />
              </View>
            ) : savedDetails ? (
              <BankDetailsCard details={savedDetails} />
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
