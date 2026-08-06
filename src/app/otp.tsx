import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HwIcon } from '@/components/hw-icon';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { useSendOtpMutation, useVerifyOtpMutation } from '@/queries/use-auth';
import { useTenantStore } from '@/stores/tenant-store';
import { getDefaultTabRoute } from '@/utils/tenant-routing';

const RESEND_COOLDOWN_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mobile = '' } = useLocalSearchParams<{ mobile: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const verifyOtp = useVerifyOtpMutation();
  const sendOtp = useSendOtpMutation();

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [secondsLeft]);

  async function onVerify() {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError('');
    Keyboard.dismiss();

    try {
      await verifyOtp.mutateAsync({ mobile, otp });
      await useTenantStore.getState().fetchProfile();
      const isTenant = Boolean(useTenantStore.getState().profile?.bookingId);
      router.replace(getDefaultTabRoute(isTenant));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please enter correct OTP');
    }
  }

  async function onResendSms() {
    if (secondsLeft > 0 || sendOtp.isPending || !mobile) return;

    setError('');
    try {
      await sendOtp.mutateAsync(mobile);
      setOtp('');
      setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Image
            source={ImageAssets.otpIllustration}
            style={styles.illustration}
            contentFit="contain"
          />

          <View style={styles.content}>
            <Typography variant="display" size="xs" weight="bold" style={styles.title}>
              Verify Your Phone Number
            </Typography>

            <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.subtitle}>
              We&apos;ve sent a verification code to
            </Typography>

            <View style={styles.phoneLine}>
              <Typography variant="text" size="sm" weight="bold" color={palette.textPrimary}>
                +91-{mobile}
              </Typography>
              <Pressable
                onPress={() => router.back()}
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number">
                <HwIcon name="edit" size={12} color={palette.helloLime} />
                <Typography variant="text" size="sm" weight="bold" color={palette.helloLime}>
                  Edit
                </Typography>
              </Pressable>
            </View>

            <OtpInput value={otp} onChange={setOtp} autoFocus />

            {error ? (
              <Typography variant="label" color={palette.error} style={styles.error}>
                {error}
              </Typography>
            ) : null}

            <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.resendHint}>
              Didn&apos;t receive the code?
            </Typography>

            <View style={styles.resendRow}>
              {secondsLeft > 0 ? (
                <Typography variant="text" size="sm" color={palette.gray[400]}>
                  Resend SMS in {secondsLeft}s
                </Typography>
              ) : (
                <Pressable
                  onPress={onResendSms}
                  disabled={sendOtp.isPending}
                  accessibilityRole="button"
                  accessibilityLabel="Resend SMS">
                  <Typography
                    variant="text"
                    size="sm"
                    weight="medium"
                    color={sendOtp.isPending ? palette.gray[400] : palette.helloLime}>
                    {sendOtp.isPending ? 'Sending…' : 'Resend SMS'}
                  </Typography>
                </Pressable>
              )}
              {/* <View style={styles.resendDivider} />
              <Pressable style={styles.whatsappRow} accessibilityRole="button">
                <HwIcon name="whatsapp" size={20} />
                <Typography variant="text" size="sm" weight="medium" color={palette.helloLime}>
                  Resend via Whatsapp
                </Typography>
              </Pressable> */}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Continue"
            loading={verifyOtp.isPending}
            disabled={verifyOtp.isPending}
            onPress={onVerify}
            style={styles.continueButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.white,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  illustration: {
    width: '100%',
    height: 220,
    marginTop: 4,
    alignSelf: 'center',
  },
  content: {
    marginTop: 20,
    gap: 16,
    alignItems: 'stretch',
  },
  title: {
    textAlign: 'center',
    color: palette.black,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: -4,
  },
  phoneLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  error: {
    textAlign: 'center',
    marginTop: -8,
  },
  resendHint: {
    textAlign: 'center',
    marginTop: 4,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  resendDivider: {
    width: 1,
    height: 14,
    backgroundColor: palette.gray[300],
  },
  whatsappRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: palette.white,
  },
  continueButton: {
    width: '100%',
  },
});
