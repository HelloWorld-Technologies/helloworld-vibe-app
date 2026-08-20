import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  InteractionManager,
  Keyboard,
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
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from '@/utils/keyboard-controller';
import { consumePendingDeepLink } from '@/utils/pending-deep-link';
import { hrefFromHdpPath } from '@/utils/property-deep-link';
import { getDefaultTabRoute } from '@/utils/tenant-routing';

const RESEND_COOLDOWN_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mobile = '' } = useLocalSearchParams<{ mobile: string }>();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const [otpReady, setOtpReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const keyboardVisible = useKeyboardState((state) => state.isVisible);
  const keyboardHeight = useKeyboardState((state) => state.height);
  const verifyOtp = useVerifyOtpMutation();
  const sendOtp = useSendOtpMutation();
  const isVerifying = verifyOtp.isPending || isNavigating;

  // Keep footer bottom-aligned; lift the whole column above the IME on Android.
  // Use full keyboard height — edge-to-edge often leaves the root under the
  // keyboard even when window dimensions change.
  const androidKeyboardPad =
    Platform.OS === 'android' && keyboardHeight > 0 ? keyboardHeight : 0;

  // Login dismisses the keyboard before navigating here — wait until this
  // screen is focused, then mount the OTP field so autofocus can open it.
  useFocusEffect(
    useCallback(() => {
      setOtpReady(false);
      const task = InteractionManager.runAfterInteractions(() => {
        setOtpReady(true);
      });
      const timer = setTimeout(() => setOtpReady(true), 500);
      return () => {
        task.cancel();
        clearTimeout(timer);
        setOtpReady(false);
      };
    }, []),
  );

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const id = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [secondsLeft]);

  async function onVerify() {
    if (isVerifying) return;

    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setError('');
    Keyboard.dismiss();

    try {
      await verifyOtp.mutateAsync({ mobile, otp });
      setIsNavigating(true);
      await useTenantStore.getState().fetchProfile();
      const isTenant = Boolean(useTenantStore.getState().profile?.bookingId);
      const pending = await consumePendingDeepLink();
      router.replace(pending ? hrefFromHdpPath(pending) : getDefaultTabRoute(isTenant));
    } catch (err) {
      setIsNavigating(false);
      setError(err instanceof Error ? err.message : 'Please enter correct OTP');
    }
  }

  function onEditPhone() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({ pathname: '/login', params: { mobile } });
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
        style={[
          styles.flex,
          androidKeyboardPad > 0 ? { paddingBottom: androidKeyboardPad } : null,
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.flex}
          bounces={false}
          contentContainerStyle={[
            styles.scroll,
            keyboardVisible ? styles.scrollCompact : null,
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>
          <Image
            source={ImageAssets.otpIllustration}
            style={[styles.illustration, keyboardVisible ? styles.illustrationCompact : null]}
            contentFit="contain"
          />

          <View style={[styles.content, keyboardVisible ? styles.contentCompact : null]}>
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
                onPress={onEditPhone}
                style={styles.editButton}
                accessibilityRole="button"
                accessibilityLabel="Edit phone number">
                <HwIcon name="edit" size={12} color={palette.helloLime} />
                <Typography variant="text" size="sm" weight="bold" color={palette.helloLime}>
                  Edit
                </Typography>
              </Pressable>
            </View>

            {otpReady ? (
              <OtpInput value={otp} onChange={setOtp} autoFocus />
            ) : (
              <View style={styles.otpPlaceholder} />
            )}

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
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: keyboardVisible ?Platform.OS === 'ios' ? 10 : 60 : Math.max(insets.bottom, 16) + 8,
            },
          ]}>
          <Button
            label="Continue"
            loading={isVerifying}
            disabled={isVerifying}
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  scrollCompact: {
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 8,
  },
  illustration: {
    width: '100%',
    height: 220,
    alignSelf: 'center',
  },
  illustrationCompact: {
    height: 120,
  },
  content: {
    marginTop: 20,
    gap: 16,
    alignItems: 'stretch',
  },
  contentCompact: {
    marginTop: 8,
    gap: 10,
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
  otpPlaceholder: {
    height: 48,
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
  footer: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: palette.white,
  },
  continueButton: {
    width: '100%',
  },
});
