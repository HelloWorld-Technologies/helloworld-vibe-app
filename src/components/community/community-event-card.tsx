import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import type { CommunityEvent } from '@/api/community';
import { EVENT_FALLBACK_IMAGE } from '@/constants/community';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { formatDisplayDate } from '@/utils/tenant-format';

type CommunityEventCardProps = {
  event: CommunityEvent;
  onPress: () => void;
  onCancel?: () => void;
  cancelLoading?: boolean;
};

export function CommunityEventCard({
  event,
  onPress,
  onCancel,
  cancelLoading = false,
}: CommunityEventCardProps) {
  const attendees =
    event.total_registration ?? event.people_attending ?? event.attendees_count ?? 0;
  const dateValue = event.event_start_date ?? event.start_date;
  const showCancel = Boolean(onCancel && event.registrationId);

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <Image
        source={{ uri: event.display_image || EVENT_FALLBACK_IMAGE }}
        style={styles.image}
        contentFit="cover"
      />
      <View style={styles.copy}>
        <Typography variant="text" size="sm" weight="medium" numberOfLines={2}>
          {event.name}
        </Typography>
        {dateValue ? (
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            {formatDisplayDate(dateValue)}
          </Typography>
        ) : null}
        {attendees > 0 ? (
          <Typography variant="label" size="xs" color={palette.gray[500]}>
            {attendees} attending
          </Typography>
        ) : null}
        {showCancel ? (
          <Pressable
            onPress={(eventPress) => {
              eventPress.stopPropagation();
              onCancel?.();
            }}
            disabled={cancelLoading}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel registration"
            style={styles.cancelButton}>
            <Typography
              variant="label"
              size="xs"
              weight="bold"
              color={cancelLoading ? palette.gray[400] : palette.red[600]}>
              {cancelLoading ? 'Cancelling…' : 'Cancel registration'}
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '50%',
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
  },
  copy: {
    padding: 12,
    gap: 4,
  },
  cancelButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
