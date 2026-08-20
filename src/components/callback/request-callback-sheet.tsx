import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sendOtpLeads, uploadContactLead } from '@/api/contact';
import { CallbackRequestSuccess } from '@/components/callback/callback-request-success';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useAuthStore } from '@/stores/auth-store';

type Step = 'form' | 'otp' | 'success';

export type RequestCallbackSheetProps = {
  visible: boolean;
  onClose: () => void;
  propertyName: string;
  location?: string;
  city?: string;
  srp?: boolean;
};

function validateName(name: string) {
  return name.trim().length >= 2;
}

function validatePhone(phone: string) {
  return phone.replace(/\D/g, '').length === 10;
}

export function RequestCallbackSheet({
  visible,
  onClose,
  propertyName,
  location = '',
  city,
  srp = true,
}: RequestCallbackSheetProps) {
  const insets = useSafeAreaInsets();
  const storedMobile = useAuthStore((state) => state.mobile);

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; otp?: string }>(
    {},
  );

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setOtp('');
    setErrorMessage(null);
    setFieldErrors({});
    setPhone(storedMobile?.replace(/\D/g, '').slice(-10) ?? '');
  }, [visible, storedMobile]);

  function handleClose() {
    setStep('form');
    setName('');
    setOtp('');
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  }

  async function handleSendOtp() {
    const nextErrors: { name?: string; phone?: string } = {};
    if (!validateName(name)) nextErrors.name = 'Please enter your full name';
    if (!validatePhone(phone)) nextErrors.phone = 'Please enter a valid 10-digit phone number';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setErrorMessage(null);
    Keyboard.dismiss();
    const response = await sendOtpLeads(phone);
    setLoading(false);

    if (response.Status === 'Success') {
      setStep('otp');
      return;
    }

    setErrorMessage(response.message ?? 'Could not send OTP. Please try again.');
  }

  async function handleSubmitOtp() {
    if (otp.length !== 6) {
      setFieldErrors((current) => ({ ...current, otp: 'Please enter the 6-digit OTP' }));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const response = await uploadContactLead({
      name: name.trim(),
      phone,
      location: location || propertyName,
      city,
      otp: Number.parseInt(otp, 10),
      srp,
      propertyName,
    });
    setLoading(false);

    if (response.success) {
      setStep('success');
      return;
    }

    if (response.message === 'OTP is Invalid') {
      setFieldErrors((current) => ({ ...current, otp: 'Invalid OTP. Please try again.' }));
      return;
    }

    setErrorMessage(response.message ?? 'Something went wrong. Please try again.');
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} showCloseButton={step !== 'success'}>
      {step === 'success' ? (
        <CallbackRequestSuccess onDone={handleClose} />
      ) : step === 'otp' ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
          <Typography variant="heading" weight="bold" style={styles.title}>
            Verify your number
          </Typography>
          <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.subtitle}>
            Enter the 6-digit code sent to +91-{phone}
          </Typography>

          <OtpInput value={otp} onChange={(value) => {
            setOtp(value);
            if (fieldErrors.otp) setFieldErrors((current) => ({ ...current, otp: undefined }));
          }} />

          {fieldErrors.otp ? (
            <Typography variant="text" size="xs" color={palette.red[600]}>
              {fieldErrors.otp}
            </Typography>
          ) : null}
          {errorMessage ? (
            <Typography variant="text" size="xs" color={palette.red[600]}>
              {errorMessage}
            </Typography>
          ) : null}

          <View style={styles.actions}>
            <Button
              label="Edit phone"
              variant="outline"
              onPress={() => setStep('form')}
              disabled={loading}
              style={styles.actionButton}
            />
            <Button
              label={loading ? 'Submitting...' : 'Submit'}
              onPress={handleSubmitOtp}
              loading={loading}
              disabled={otp.length !== 6}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 16 }]}>
          <Typography variant="heading" weight="bold" style={styles.title}>
            Request a callback
          </Typography>
          <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.subtitle}>
            Share your details for {propertyName} and we&apos;ll reach out shortly.
          </Typography>

          <TextField
            label="Full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }));
            }}
            placeholder="Full name"
            autoCapitalize="words"
            error={fieldErrors.name}
          />

          <TextField
            label="Mobile number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text.replace(/\D/g, '').slice(0, 10));
              if (fieldErrors.phone) setFieldErrors((current) => ({ ...current, phone: undefined }));
            }}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            error={fieldErrors.phone}
          />

          {location ? (
            <View style={styles.locationPill}>
              <Typography variant="text" size="sm" color={palette.gray[700]}>
                {location}
              </Typography>
            </View>
          ) : null}

          {errorMessage ? (
            <Typography variant="text" size="xs" color={palette.red[600]}>
              {errorMessage}
            </Typography>
          ) : null}

          <Button
            label={loading ? 'Sending OTP...' : 'Continue'}
            onPress={handleSendOtp}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 16,
  },
  title: {
    textAlign: 'left',
  },
  subtitle: {
    marginTop: -8,
  },
  locationPill: {
    alignSelf: 'flex-start',
    backgroundColor: palette.gray[100],
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});
