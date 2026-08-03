import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/tenant/dashboard/dashboard-section-header';
import { Typography } from '@/components/ui/typography';
import { DashboardImages } from '@/constants/assets';
import { DASHBOARD_REFERRAL_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { priceFormatter } from '@/utils/tenant-format';

type DashboardReferralCardProps = {
  unlockedAmount?: number;
  friendsJoined?: number;
  referralCode?: string;
  onViewRewards?: () => void;
};

export function DashboardReferralCard({
  unlockedAmount = 0,
  friendsJoined = 0,
  referralCode,
  onViewRewards,
}: DashboardReferralCardProps) {
  async function copyCode() {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
  }

  async function shareCode() {
    if (!referralCode) return;
    await Share.share({
      message: `Join HelloWorld with my referral code: ${referralCode}`,
    });
  }

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title="Share. Refer. Earn."
        actionLabel="View Rewards"
        onActionPress={onViewRewards ?? shareCode}
      />

      <View style={styles.cardShadow}>
        <LinearGradient
          colors={[...DASHBOARD_REFERRAL_GRADIENT.colors]}
          start={DASHBOARD_REFERRAL_GRADIENT.start}
          end={DASHBOARD_REFERRAL_GRADIENT.end}
          style={styles.card}>
          <View style={styles.content}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Refer friends. Earn on your rent!
            </Typography>
            <Typography variant="display" size="xs" weight="bold" color={palette.gray[900]}>
              {priceFormatter(unlockedAmount)} Unlocked
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              {friendsJoined} Friends Joined through You
            </Typography>

            {referralCode ? (
              <View style={styles.codeRow}>
                <Pressable style={styles.codeBox} onPress={copyCode} accessibilityRole="button">
                  <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
                    {referralCode}
                  </Typography>
                </Pressable>
                <Pressable style={styles.shareButton} onPress={shareCode} accessibilityRole="button">
                  <Typography variant="text" size="sm" weight="medium" color={palette.blue[800]}>
                    Share
                  </Typography>
                </Pressable>
              </View>
            ) : null}
          </View>

          <Image
            source={DashboardImages.referralIllustration}
            style={styles.illustration}
            contentFit="contain"
          />
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  cardShadow: {
    borderRadius: Radius.md,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  card: {
    borderRadius: Radius.md,
    padding: 16,
    minHeight: 168,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
    zIndex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  codeBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.blue[300],
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.white,
  },
  shareButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  illustration: {
    width: 112,
    height: 132,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
