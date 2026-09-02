import { StyleSheet, View } from 'react-native';

import { CallButton } from '@/components/ui/call-button';
import { CachedRemoteImage } from '@/components/ui/cached-remote-image';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { formatDisplayName } from '@/utils/tenant-format';

type DashboardPmCardProps = {
  name: string;
  phone?: string;
  photoUrl?: string | null;
  onCallPress: () => void;
};

export function DashboardPmCard({ name, phone, photoUrl, onCallPress }: DashboardPmCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <CachedRemoteImage
          uri={photoUrl}
          style={styles.avatar}
          contentFit="cover"
          fallbackSource={ImageAssets.appIcon}
        />
        <View style={styles.copy}>
          <Typography variant="text" size="md" weight="medium">
            {formatDisplayName(name)}
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Property Manager
          </Typography>
        </View>
      </View>
      {phone ? <CallButton onPress={onCallPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
