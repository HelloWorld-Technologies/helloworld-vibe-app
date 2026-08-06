import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { DashboardImages } from '@/constants/assets';
import { DASHBOARD_REFERRAL_GRADIENT } from '@/constants/dashboard';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { priceFormatter } from '@/utils/tenant-format';

type ReferralHeroCardProps = {
  unlockedAmount?: number;
  friendsJoined?: number;
  referralCode?: string;
  userName?: string;
  friendDiscount?: number;
  onCopied?: () => void;
};

export function ReferralHeroCard({
  unlockedAmount = 0,
  friendsJoined = 0,
  referralCode,
  userName,
  friendDiscount = 1000,
  onCopied,
}: ReferralHeroCardProps) {
  async function copyCode() {
    if (!referralCode) return;
    await Clipboard.setStringAsync(referralCode);
    onCopied?.();
  }

  async function shareCode() {
    if (!referralCode) return;
    await Share.share({
      message: `Hey! I have a referral code from HelloWorld. Sign up using ₹${friendDiscount} off on a month's rent and I get rewarded too. https://thehelloworld.com/refer?code=${referralCode}&name=${userName ?? ''}`,
    });
  }

  return (
    <LinearGradient
      colors={[...DASHBOARD_REFERRAL_GRADIENT.colors]}
      start={DASHBOARD_REFERRAL_GRADIENT.start}
      end={DASHBOARD_REFERRAL_GRADIENT.end}
      style={styles.card}>
      <View style={styles.content}>
        <View style={styles.headline}>
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            Refer friends.
          </Typography>
          <Typography variant="text" size="sm" weight="bold" color={palette.blue[800]}>
            {' '}
            Earn on your rent!
          </Typography>
        </View>

        <View style={styles.amountRow}>
          <Typography variant="display" size="sm" weight="bold" color={palette.gray[900]}>
            {priceFormatter(unlockedAmount)}
          </Typography>
          <Typography variant="text" size="md" color={palette.gray[500]}>
            {' '}
            Unlocked
          </Typography>
        </View>

        <View style={styles.friendsRow}>
          <HwSymbol name="person.2.fill" size={14} tintColor={palette.gray[500]} />
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            {friendsJoined} Friends Joined through You
          </Typography>
        </View>

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
              <HwSymbol name="square.and.arrow.up" size={20} tintColor={palette.lime[900]} />
            </Pressable>
          </View>
        ) : (
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Complete move-in to get your referral code
          </Typography>
        )}
      </View>

      <Image
        source={DashboardImages.referralIllustration}
        style={styles.illustration}
        contentFit="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: 16,
    minHeight: 188,
    overflow: 'hidden',
  },
  content: {
    gap: 8,
    paddingRight: 96,
    zIndex: 1,
  },
  headline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  friendsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  codeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.lime[600],
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    width: 120,
    height: 140,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});
