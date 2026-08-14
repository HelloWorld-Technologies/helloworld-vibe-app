import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { DashboardIcon } from '@/components/dashboard/dashboard-icon';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

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
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <DashboardIcon name="profile" size={22} color={palette.blue[700]} />
          </View>
        )}
        <View style={styles.copy}>
          <Typography variant="text" size="md" weight="medium">
            {name}
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            Property Manager
          </Typography>
        </View>
      </View>
      {phone ? (
        <Pressable style={styles.callButton} onPress={onCallPress} accessibilityRole="button">
          <DashboardIcon name="call" size={22} color={palette.white} />
        </Pressable>
      ) : null}
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
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: palette.blue[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: palette.blue[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
