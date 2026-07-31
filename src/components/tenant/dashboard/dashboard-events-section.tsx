import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View, useWindowDimensions } from 'react-native';

import { CommunityEventCard } from '@/components/community/community-event-card';
import { DashboardSectionHeader } from '@/components/tenant/dashboard/dashboard-section-header';
import { HwCarousel } from '@/components/ui/carousel';
import { EmptyState } from '@/components/ui/empty-state';
import type { CommunityEvent } from '@/types/community';
import palette from '@/constants/palette';

const EVENT_CARD_GAP = 12;
const EVENT_IMAGE_HEIGHT = 168;
const EVENT_COPY_HEIGHT = 92;

type DashboardEventsSectionProps = {
  events: CommunityEvent[];
  isLoading?: boolean;
};

export function DashboardEventsSection({ events, isLoading }: DashboardEventsSectionProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 72, 300);
  const slideWidth = cardWidth + EVENT_CARD_GAP;
  const carouselHeight = EVENT_IMAGE_HEIGHT + EVENT_COPY_HEIGHT;

  return (
    <View style={styles.section}>
      <DashboardSectionHeader
        title="What's Happening"
        subtitle="Meet people, learn something new, or just have fun."
        actionLabel="View All"
        onActionPress={() => router.push('/community-events')}
      />

      {isLoading ? (
        <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
      ) : events.length > 0 ? (
        <HwCarousel
          data={events}
          width={slideWidth}
          height={carouselHeight}
          renderItem={({ item }) => (
            <CommunityEventCard
              event={item}
              style={{ width: cardWidth }}
              imageHeight={EVENT_IMAGE_HEIGHT}
              onPress={() =>
                router.push({
                  pathname: '/community-event',
                  params: { id: String(item.id) },
                })
              }
            />
          )}
        />
      ) : (
        <EmptyState
          compact
          title="No upcoming events right now"
          actionLabel="View Events"
          onAction={() => router.push('/community-events')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  loader: {
    marginVertical: 24,
  },
});
