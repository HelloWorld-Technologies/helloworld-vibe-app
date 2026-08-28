import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { ProfileMenuAssets } from '@/constants/assets';
import palette from '@/constants/palette';

type ProfileSummaryProps = {
  mobile?: string;
  name?: string;
  propertyLabel?: string;
};

const ProfileAvatarIcon = ProfileMenuAssets.avatar;

export function ProfileSummary({ mobile, name, propertyLabel }: ProfileSummaryProps) {
  const formattedMobile = mobile ? `+91-${mobile}` : '+91-';

  return (
    <View style={styles.container}>
      <ProfileAvatarIcon width={64} height={64} accessibilityLabel="Profile" />
      {name ? (
        <View style={styles.copy}>
          <Typography variant="text" size="lg" weight="bold" style={styles.name}>
            {name}
          </Typography>
          {propertyLabel ? (
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              {propertyLabel}
            </Typography>
          ) : null}
        </View>
      ) : (
        <Typography variant="text" size="lg" weight="regular" style={styles.name}>
          {formattedMobile}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: palette.black,
  },
});
