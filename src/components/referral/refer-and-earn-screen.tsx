import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { HowItWorksSection } from '@/components/referral/how-it-works-section';
import { PointsHistorySection } from '@/components/referral/points-history-section';
import { ReferralHeroCard } from '@/components/referral/referral-hero-card';
import { ReferralTermsSection } from '@/components/referral/referral-terms-section';
import { Snackbar } from '@/components/ui/snackbar';
import { getReferralHowItWorksSteps } from '@/constants/referral';
import palette from '@/constants/palette';
import { useReferralDetails, useReferralTerms } from '@/queries/use-referral';
import { useTenantProfile } from '@/stores/tenant-store';

export function ReferAndEarnScreen() {
  const profile = useTenantProfile();
  const { data: referral, isLoading: referralLoading } = useReferralDetails();
  const { data: terms } = useReferralTerms();
  const [copySnackbarVisible, setCopySnackbarVisible] = useState(false);
  const dismissCopySnackbar = useCallback(() => {
    setCopySnackbarVisible(false);
  }, []);

  const creditInfo = profile?.creditInfo;
  const referralCode = referral?.referralCode ?? creditInfo?.referralCode;
  const unlockedAmount =
    referral?.totalCredits ?? referral?.balanceCredits ?? creditInfo?.totalCredits ?? creditInfo?.balanceCredits ?? 0;
  const friendsJoined = referral?.friendsJoined ?? creditInfo?.friendsJoined ?? 0;
  const friendDiscount = terms?.amount ?? 1000;
  const steps = getReferralHowItWorksSteps(friendDiscount, 2000);
  const termItems = terms?.terms ?? [];

  return (
    <ProfileStackScreen title="Refer & Earn" centerTitle style={styles.screenBody}>
      {referralLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={palette.lime[700]} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <ReferralHeroCard
            unlockedAmount={unlockedAmount}
            friendsJoined={friendsJoined}
            referralCode={referralCode}
            userName={profile?.userInfo?.name}
            friendDiscount={friendDiscount}
            onCopied={() => setCopySnackbarVisible(true)}
          />

          <HowItWorksSection steps={steps} />

          <ReferralTermsSection terms={termItems} />

          <PointsHistorySection logs={referral?.logs ?? []} />
        </ScrollView>
      )}

      <Snackbar
        message="Referral code copied"
        visible={copySnackbarVisible}
        onDismiss={dismissCopySnackbar}
        bottomOffset={16}
      />
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 0,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
