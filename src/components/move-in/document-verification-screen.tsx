import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { getKycLink } from '@/api/user';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useBookingStatus } from '@/queries/use-booking-status';
import { useTenantProfile } from '@/stores/tenant-store';
import { extractKycUrl, openKycVerification } from '@/utils/kyc';

const VERIFICATION_STEPS = [
  'Keep your government ID ready (Aadhaar, PAN, or Passport).',
  'Complete the selfie verification in good lighting.',
  'Return to the app once you finish on the partner portal.',
];

function DocumentVerificationVerifiedView() {
  const insets = useSafeAreaInsets();

  return (
    <ProfileStackScreen title="Document Verification" centerTitle style={styles.screen}>
      <View style={[styles.verifiedContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.iconCircle}>
          <Typography variant="display" size="xs" weight="bold" color={palette.lime[600]}>
            ✓
          </Typography>
        </View>
        <Typography variant="text" size="xl" weight="bold" style={styles.verifiedHeading}>
          Documents verified
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.verifiedSubheading}>
          Your KYC is complete. You can continue with the remaining move-in steps.
        </Typography>
      </View>
    </ProfileStackScreen>
  );
}

export function DocumentVerificationScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const { data: status, refetch } = useBookingStatus();
  const [kycUrl, setKycUrl] = useState<string | null>(null);
  const [fetchState, setFetchState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [opening, setOpening] = useState(false);
  const [browserOpened, setBrowserOpened] = useState(false);
  const hasAutoOpened = useRef(false);

  const fetchLink = useCallback(async () => {
    if (!profile?.bookingId) {
      setFetchState('error');
      return;
    }

    setFetchState('loading');
    const response = await getKycLink(profile.bookingId);
    const url = extractKycUrl(response);

    if (url) {
      setKycUrl(url);
      setFetchState('ready');
      return;
    }

    setKycUrl(null);
    setFetchState('error');
  }, [profile?.bookingId]);

  const openVerification = useCallback(async () => {
    if (!kycUrl) return;

    setOpening(true);
    try {
      await openKycVerification(kycUrl);
      setBrowserOpened(true);
    } finally {
      setOpening(false);
      await refetch();
    }
  }, [kycUrl, refetch]);

  useEffect(() => {
    void fetchLink();
  }, [fetchLink]);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (kycUrl && fetchState === 'ready' && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      void openVerification();
    }
  }, [kycUrl, fetchState, openVerification]);

  if (status?.is_kyc_cleared) {
    return <DocumentVerificationVerifiedView />;
  }

  if (fetchState === 'loading' && !kycUrl) {
    return (
      <ProfileStackScreen title="Document Verification" centerTitle style={styles.screen}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.lime[500]} />
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Preparing verification portal...
          </Typography>
        </View>
      </ProfileStackScreen>
    );
  }

  if (fetchState === 'error' || !kycUrl) {
    return (
      <ProfileStackScreen title="Document Verification" centerTitle style={styles.screen}>
        <View style={[styles.errorState, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Typography variant="text" size="md" color={palette.gray[600]} style={styles.errorText}>
            We couldn&apos;t load the verification link right now.
          </Typography>
          <Button label="Try Again" onPress={() => void fetchLink()} />
        </View>
      </ProfileStackScreen>
    );
  }

  return (
    <ProfileStackScreen title="Document Verification" centerTitle style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 24) + 96 }]}>
        <View style={styles.banner}>
          <Typography variant="text" size="sm" color={palette.blue[800]} style={styles.bannerText}>
            You&apos;ll be redirected to our partner portal for KYC verification.
          </Typography>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <HwSymbol name="doc.text.fill" size={28} weight="medium" tintColor={palette.blue[700]} />
          </View>
          <Typography variant="display" size="xs" weight="bold" style={styles.title}>
            Verify Your Identity
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.subtitle}>
            {browserOpened
              ? 'The verification portal has been opened in your browser. Complete the steps there, then return here.'
              : 'Opening the secure verification portal in your browser.'}
          </Typography>
        </View>

        <View style={styles.stepsCard}>
          {VERIFICATION_STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Typography variant="text" size="xs" weight="bold" color={palette.gray[700]}>
                  {index + 1}
                </Typography>
              </View>
              <Typography variant="text" size="sm" color={palette.gray[700]} style={styles.stepText}>
                {step}
              </Typography>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button
          label={browserOpened ? 'Open Verification Again' : 'Start Verification'}
          onPress={() => void openVerification()}
          loading={opening}
        />
      </View>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  scroll: {
    paddingTop: 4,
    gap: 24,
  },
  banner: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    lineHeight: 22,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: palette.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsCard: {
    borderWidth: 1,
    borderColor: palette.gray[200],
    borderRadius: Radius.md,
    padding: 16,
    gap: 14,
    backgroundColor: palette.gray[25],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.gray[100],
  },
  verifiedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  verifiedHeading: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  verifiedSubheading: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
