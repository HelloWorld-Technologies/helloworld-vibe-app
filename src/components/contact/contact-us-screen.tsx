import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { sendOtpLeads, uploadContactLead } from '@/api/contact';
import { CallbackRequestSuccess } from '@/components/callback/callback-request-success';
import { ProfileIcon } from '@/components/profile-icon';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { TextField } from '@/components/ui/text-field';
import { fontStyleForWeight } from '@/constants/fonts';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useAuthStore } from '@/stores/auth-store';

const HELP_DESK_NUMBER = '8880008888';
const HELP_DESK_DISPLAY = '888 000 88 88';

type ContactStep = 'form' | 'otp' | 'success';

const compactLabel = { fontSize: 12, lineHeight: 18, color: palette.gray[700] };

export function ContactUsScreen({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset(embedded ? 0 : 24);

  const [step, setStep] = useState<ContactStep>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; otp?: string }>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const storedMobile = useAuthStore((state) => state.mobile);
  const storedCity = useAuthStore((state) => state.selectedCity);

  useEffect(() => {
    if (storedMobile) setPhone(storedMobile);
    if (storedCity) setLocation(storedCity);
  }, [storedMobile, storedCity]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollBottomPadding = keyboardVisible
    ? 16
    : embedded
      ? tabBarInset
      : Math.max(insets.bottom, 16) + 24;

  function validate() {
    const nextErrors: { name?: string; phone?: string } = {};
    if (!name.trim()) nextErrors.name = 'Please enter your full name';
    if (phone.replace(/\D/g, '').length !== 10) {
      nextErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onRequestCallback() {
    if (!validate()) return;

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

  async function onSubmitOtp() {
    if (otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter the 6-digit OTP' }));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const response = await uploadContactLead({
      name: name.trim(),
      phone,
      location: location.trim() || storedCity || 'HelloWorld',
      city: storedCity ?? undefined,
      otp: Number.parseInt(otp, 10),
      srp: false,
      propertyName: 'HelloWorld',
    });
    setLoading(false);

    if (response.success) {
      setStep('success');
      return;
    }

    if (response.message === 'OTP is Invalid') {
      setErrors((prev) => ({ ...prev, otp: 'Invalid OTP. Please try again.' }));
      return;
    }

    setErrorMessage(response.message ?? 'Something went wrong. Please try again.');
  }

  function onSuccessDone() {
    setStep('form');
    setName('');
    setOtp('');
    setErrorMessage(null);
    setErrors({});
    if (!embedded) {
      router.back();
    }
  }

  function onCallHelpDesk() {
    Linking.openURL(`tel:${HELP_DESK_NUMBER}`);
  }

  return (
    <LinearGradient
      colors={['#EAF7FE', palette.white]}
      locations={[0, 0.45]}
      style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.header, embedded && styles.headerEmbedded]}>
          {!embedded ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.backPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <HwSymbol
                name="chevron.left"
                size={18}
                weight="semibold"
                tintColor={palette.gray[800]}
              />
            </Pressable>
          ) : null}
          <Text style={[styles.headerTitle, embedded && styles.headerTitleEmbedded]}>
            Contact us
          </Text>
          {!embedded ? <View style={styles.backPlaceholder} /> : null}
        </View>

        <View style={styles.flex}>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: scrollBottomPadding }]}>
            {step === 'form' ? (
              <Image
                source={ImageAssets.contactIllustration}
                style={styles.illustration}
                contentFit="contain"
              />
            ) : null}

            {step === 'success' ? (
              <CallbackRequestSuccess onDone={onSuccessDone} />
            ) : step === 'otp' ? (
              <>
                <Text style={styles.headline}>Verify your number</Text>
                <Text style={styles.otpSubtitle}>Enter the 6-digit code sent to +91-{phone}</Text>
                <OtpInput
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                />
                {errors.otp ? <Text style={styles.error}>{errors.otp}</Text> : null}
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <View style={styles.otpActions}>
                  <Button
                    label="Edit phone"
                    variant="outline"
                    onPress={() => setStep('form')}
                    disabled={loading}
                    style={styles.otpActionButton}
                  />
                  <Button
                    label={loading ? 'Submitting...' : 'Submit'}
                    onPress={onSubmitOtp}
                    loading={loading}
                    disabled={otp.length !== 6}
                    style={styles.otpActionButton}
                  />
                </View>
              </>
            ) : (
              <>
            <Text style={styles.headline}>Let us help you!</Text>

            <View style={styles.form}>
              <TextField
                label="Full Name"
                labelStyle={compactLabel}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Full Name"
                autoCapitalize="words"
                error={errors.name}
                containerStyle={styles.field}
              />

              <TextField
                label="Phone Number"
                labelStyle={compactLabel}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/\D/g, '').slice(0, 10));
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="Mobile number"
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                maxLength={10}
                error={errors.phone}
                containerStyle={styles.field}
                leftIcon={<Text style={styles.phonePrefix}>+91-</Text>}
              />

              <TextField
                label="Location"
                labelStyle={compactLabel}
                value={location}
                onChangeText={setLocation}
                placeholder="Search your location"
                error={undefined}
                containerStyle={styles.field}
              />
            </View>

            <Button
              label="Request Callback"
              onPress={onRequestCallback}
              loading={loading}
              style={styles.submitButton}
            />

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <View style={styles.divider} />

            <Pressable
              onPress={onCallHelpDesk}
              style={({ pressed }) => [styles.helpDesk, pressed && styles.helpDeskPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Call help desk ${HELP_DESK_DISPLAY}`}>
              <View style={styles.helpDeskLeft}>
                <ProfileIcon name="support" size={20} color={palette.gray[900]} />
                <Text style={styles.helpDeskText}>
                  Help desk <Text style={styles.helpDeskBullet}>•</Text> {HELP_DESK_DISPLAY}
                </Text>
              </View>
              <View style={styles.helpDeskAction}>
                <Text style={styles.callNow}>Call now</Text>
                <HwSymbol
                  name="arrow.right"
                  size={14}
                  weight="semibold"
                  tintColor={palette.helloLime}
                />
              </View>
            </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerEmbedded: {
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backPressed: {
    opacity: 0.85,
  },
  backPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 28,
    ...fontStyleForWeight('bold'),
    color: palette.black,
    flex: 1,
  },
  headerTitleEmbedded: {
    flex: 0,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 20,
  },
  illustration: {
    width: '100%',
    height: 200,
    alignSelf: 'center',
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    ...fontStyleForWeight('bold'),
    color: palette.black,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  phonePrefix: {
    fontSize: 16,
    ...fontStyleForWeight('medium'),
    color: palette.gray[400],
  },
  error: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.red[600],
  },
  submitButton: {
    width: '100%',
  },
  otpSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    ...fontStyleForWeight('medium'),
    color: palette.gray[600],
    textAlign: 'center',
    marginTop: -8,
  },
  otpActions: {
    flexDirection: 'row',
    gap: 10,
  },
  otpActionButton: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[300],
    marginVertical: 4,
  },
  helpDesk: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: palette.lime[50],
    borderWidth: 1,
    borderColor: palette.lime[200],
    borderRadius: Radius.full,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  helpDeskPressed: {
    opacity: 0.9,
  },
  helpDeskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  helpDeskText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    ...fontStyleForWeight('medium'),
    color: palette.gray[900],
  },
  helpDeskBullet: {
    color: palette.gray[500],
  },
  helpDeskAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callNow: {
    fontSize: 13,
    lineHeight: 18,
    ...fontStyleForWeight('bold'),
    color: palette.helloLime,
  },
});
