import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { DashboardSectionHeader } from '@/components/tenant/dashboard/dashboard-section-header';
import { Typography } from '@/components/ui/typography';
import { DashboardImages } from '@/constants/assets';
import { DASHBOARD_REFERRAL_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { SHARE_SYMBOL } from '@/constants/symbols';
import { Radius } from '@/constants/theme';
import { priceFormatter } from '@/utils/tenant-format';

type DashboardReferralCardProps = {
  unlockedAmount?: number;
  referralCode?: string;
  onViewRewards?: () => void;
  onCopied?: () => void;
};

export function DashboardReferralCard({
  unlockedAmount = 0,
  referralCode,
  onViewRewards,
  onCopied,
}: DashboardReferralCardProps) {
  async function copyCode() {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    onCopied?.();
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

            {referralCode ? (
              <View style={styles.codeRow}>
                <Pressable
                  style={styles.codeBox}
                  onPress={() => {
                    void copyCode();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Copy referral code">
                  <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
                    {referralCode}
                  </Typography>
                  <HwSymbol name="doc.on.doc" size={16} tintColor={palette.lime[600]} />
                </Pressable>
                <Pressable
                  style={styles.shareButton}
                  onPress={() => {
                    void shareCode();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Share referral code">
                  <HwSymbol name={SHARE_SYMBOL} size={20} tintColor={palette.lime[900]} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.lime[600],
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: palette.white,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: 112,
    height: 132,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
