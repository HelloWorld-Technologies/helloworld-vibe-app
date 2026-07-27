import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import type { RoomMateType } from '@/types/roommate';
import { postRoomMateDetails } from '@/api/roommate';

type AddMateSheetProps = {
  visible: boolean;
  inType: RoomMateType;
  bookingId?: string;
  onClose: () => void;
  onSuccess: () => void;
};

type FormState = {
  name: string;
  mobile: string;
  email: string;
};

const EMPTY_FORM: FormState = { name: '', mobile: '', email: '' };

function getMateLabel(inType: RoomMateType) {
  return inType === 'ROOMMATE' ? 'Roommate' : 'Visitor';
}

function validateForm(form: FormState) {
  const errors: Partial<FormState> = {};
  if (!form.name.trim()) errors.name = 'Enter full name';
  if (!/^\d{10}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email';
  return errors;
}

export function AddMateSheet({ visible, inType, bookingId, onClose, onSuccess }: AddMateSheetProps) {
  const mateLabel = getMateLabel(inType);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function reset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitError('');
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !bookingId) return;

    setLoading(true);
    setSubmitError('');
    try {
      const result = await postRoomMateDetails({
        bookingId,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        inType,
      });
      if (result?.success === false) {
        setSubmitError(result.message ?? `Failed to add ${mateLabel.toLowerCase()}`);
        return;
      }
      reset();
      onSuccess();
      onClose();
    } catch {
      setSubmitError(`Failed to add ${mateLabel.toLowerCase()}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <Typography variant="text" size="lg" weight="bold" style={styles.title}>
          Add {mateLabel}
        </Typography>

        <TextField
          label="Full Name"
          placeholder="Enter full name"
          value={form.name}
          onChangeText={(name) => setForm((current) => ({ ...current, name }))}
          error={errors.name}
        />
        <TextField
          label="Mobile Number"
          placeholder="Enter 10 digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
          value={form.mobile}
          onChangeText={(mobile) => setForm((current) => ({ ...current, mobile }))}
          error={errors.mobile}
        />
        <TextField
          label="Email"
          placeholder="Enter valid email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(email) => setForm((current) => ({ ...current, email }))}
          error={errors.email}
        />

        {submitError ? (
          <Typography variant="text" size="sm" color={palette.red[600]}>
            {submitError}
          </Typography>
        ) : null}

        <Button label={`Add ${mateLabel}`} loading={loading} onPress={handleSubmit} style={styles.submit} />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  submit: {
    marginTop: 8,
  },
});
