import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

const AVATAR_PRESETS = [
  { initials: 'HK', backgroundColor: palette.purpleScale[500] },
  { initials: 'KL', backgroundColor: palette.lightBlue },
  { initials: 'OP', backgroundColor: '#F79009' },
] as const;

const MAX_VISIBLE_AVATARS = 3;

type WhosAttendingCardProps = {
  totalRegistration: number;
  femaleCount?: number;
  propertyCount?: number;
  showFemaleCount?: boolean;
};

export function WhosAttendingCard({
  totalRegistration,
  femaleCount = 0,
  propertyCount,
  showFemaleCount = false,
}: WhosAttendingCardProps) {
  if (totalRegistration <= 0) return null;

  const visibleAvatars = AVATAR_PRESETS.slice(
    0,
    Math.min(MAX_VISIBLE_AVATARS, totalRegistration),
  );
  const overflow = Math.max(totalRegistration - visibleAvatars.length, 0);
  const showWomenBadge = showFemaleCount && femaleCount > 0;

  return (
    <View style={styles.card}>
      <Typography variant="text" size="md" weight="medium" color={palette.gray[800]}>
        Who&apos;s Attending
      </Typography>

      <View style={styles.summaryRow}>
        <View style={styles.avatarStack}>
          {visibleAvatars.map((avatar, index) => (
            <View
              key={avatar.initials}
              style={[
                styles.avatar,
                { backgroundColor: avatar.backgroundColor, marginLeft: index === 0 ? 0 : -10, zIndex: index + 1 },
              ]}>
              <Typography variant="text" size="xs" weight="bold" color={palette.white}>
                {avatar.initials}
              </Typography>
            </View>
          ))}
          {overflow > 0 ? (
            <View
              style={[
                styles.avatar,
                styles.overflowAvatar,
                { marginLeft: visibleAvatars.length === 0 ? 0 : -10, zIndex: visibleAvatars.length + 1 },
              ]}>
              <Typography variant="text" size="xs" weight="bold" color={palette.gray[700]}>
                +{overflow}
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={styles.summaryCopy}>
          <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
            {totalRegistration} attending
          </Typography>
          {propertyCount && propertyCount > 0 ? (
            <Typography variant="text" size="xs" color={palette.gray[500]}>
              Across {propertyCount} HW {propertyCount === 1 ? 'Property' : 'Properties'}
            </Typography>
          ) : null}
        </View>
      </View>

      {showWomenBadge ? (
        <View style={styles.womenBadge}>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[900]}>
            👩 {femaleCount} {femaleCount === 1 ? 'Woman' : 'Women'} attending
          </Typography>
        </View>
      ) : null}

      {showWomenBadge ? (
        <Typography variant="text" size="xs" color={palette.gray[400]} style={styles.disclaimer}>
          Women attendee info is visible only to women residents.
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflowAvatar: {
    backgroundColor: palette.gray[200],
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  womenBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FCE7F3',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disclaimer: {
    lineHeight: 16,
  },
});
