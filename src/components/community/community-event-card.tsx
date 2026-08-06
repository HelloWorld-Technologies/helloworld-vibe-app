import { Image } from 'expo-image';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { CommunityEvent } from '@/types/community';
import { EVENT_FALLBACK_IMAGE } from '@/constants/community';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { formatDisplayDate } from '@/utils/tenant-format';

type CommunityEventCardProps = {
  event: CommunityEvent;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  imageHeight?: number;
};

export function CommunityEventCard({
  event,
  onPress,
  style,
  imageHeight = 160,
}: CommunityEventCardProps) {
  const attendees =
    event.total_registration ?? event.people_attending ?? event.attendees_count ?? 0;
  const dateValue = event.event_start_date ?? event.start_date;

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.name}>
      <Image
        source={{ uri: event.display_image || EVENT_FALLBACK_IMAGE }}
        style={[styles.image, { height: imageHeight }]}
        contentFit="cover"
      />
      <View style={styles.copy}>
        <Typography variant="text" size="md" weight="bold" numberOfLines={2} color={palette.gray[900]}>
          {event.name}
        </Typography>
        {dateValue ? (
          <Typography variant="text" size="sm" color={palette.gray[500]}>
            {formatDisplayDate(dateValue)}
          </Typography>
        ) : null}
        {attendees > 0 ? (
          <View style={styles.attendeesRow}>
            <HwSymbol name="person.2.fill" size={14} tintColor={palette.gray[500]} />
            <Typography variant="text" size="sm" color={palette.gray[500]}>
              {attendees} People attending
            </Typography>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  image: {
    width: '100%',
    borderRadius: Radius.md,
    backgroundColor: palette.gray[100],
  },
  copy: {
    gap: 4,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
});
