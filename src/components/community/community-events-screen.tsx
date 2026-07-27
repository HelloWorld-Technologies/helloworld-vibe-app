import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { CommunityEventCard } from '@/components/community/community-event-card';
import { CommunityPromoCard } from '@/components/community/community-promo-card';
import { CommunityRequestSheet } from '@/components/community/community-request-sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';
import { SwipeableTabPager } from '@/components/ui/swipeable-tab-pager';
import { Typography } from '@/components/ui/typography';
import { type CommunityEvent } from '@/api/community';
import {
  COMMUNITY_EVENT_TABS,
  COMMUNITY_TAB_HEADINGS,
  type CommunityEventsTab,
} from '@/constants/community';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import {
  useCancelEventRegistration,
  useCommunityEvents,
} from '@/queries/use-events';

const COMMUNITY_TAB_IDS = COMMUNITY_EVENT_TABS.map((tab) => tab.id);

type CommunityEventsTabPageProps = {
  tab: CommunityEventsTab;
  onRequestPress: () => void;
  onEventPress: (id: number) => void;
};

function CommunityEventsTabPage({
  tab,
  onRequestPress,
  onEventPress,
}: CommunityEventsTabPageProps) {
  const { data: events, isLoading, refetch, isRefetching } = useCommunityEvents(tab);
  const cancelRegistration = useCancelEventRegistration();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const hasEvents = (events?.length ?? 0) > 0;
  const showEmpty = !isLoading && !hasEvents;
  const showPromo = tab === 'upcoming' && hasEvents;

  function handleCancel(event: CommunityEvent) {
    if (!event.registrationId) return;

    Alert.alert(
      'Cancel registration?',
      `Remove yourself from ${event.name}?`,
      [
        { text: 'Keep registration', style: 'cancel' },
        {
          text: 'Cancel registration',
          style: 'destructive',
          onPress: () => {
            setCancellingId(event.registrationId!);
            cancelRegistration.mutate(event.registrationId!, {
              onError: (error) => {
                Alert.alert(
                  'Cancellation failed',
                  error instanceof Error ? error.message : 'Please try again',
                );
              },
              onSettled: () => setCancellingId(null),
            });
          },
        },
      ],
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      showsVerticalScrollIndicator={false}>
      {!showEmpty ? (
        <Typography variant="text" size="lg" weight="medium" style={styles.heading}>
          {COMMUNITY_TAB_HEADINGS[tab]}
        </Typography>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
      ) : showEmpty ? (
        <EmptyState
          title={
            tab === 'registered'
              ? 'No registered events yet'
              : 'No events scheduled this week'
          }
          subtitle={
            tab === 'registered'
              ? 'Events you register for will show up here.'
              : 'Got an idea? Help us plan the next one.'
          }
          actionLabel={tab === 'registered' ? undefined : 'Request Event'}
          onAction={tab === 'registered' ? undefined : onRequestPress}
        />
      ) : (
        <>
          <View style={styles.grid}>
            {events?.map((event) => (
              <CommunityEventCard
                key={`${event.id}-${event.registrationId ?? 'event'}`}
                event={event}
                onPress={() => onEventPress(event.id)}
                onCancel={tab === 'registered' ? () => handleCancel(event) : undefined}
                cancelLoading={cancellingId === event.registrationId}
              />
            ))}
          </View>
          {showPromo ? <CommunityPromoCard onRequestPress={onRequestPress} /> : null}
        </>
      )}
    </ScrollView>
  );
}

export function CommunityEventsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<CommunityEventsTab>('upcoming');
  const [requestVisible, setRequestVisible] = useState(false);

  return (
    <View style={styles.root}>
      <TenantScreenHeader title="Community Events" onBack={() => router.back()} />

      <View style={styles.controls}>
        <SegmentedTabToggle value={tab} onChange={setTab} tabs={COMMUNITY_EVENT_TABS} />
      </View>

      <SwipeableTabPager tabs={COMMUNITY_TAB_IDS} value={tab} onChange={setTab}>
        {(tabId) => (
          <CommunityEventsTabPage
            tab={tabId}
            onRequestPress={() => setRequestVisible(true)}
            onEventPress={(id) =>
              router.push({
                pathname: '/community-event',
                params: { id: String(id) },
              })
            }
          />
        )}
      </SwipeableTabPager>

      {tab === 'upcoming' ? (
        <Pressable
          style={styles.fab}
          onPress={() => setRequestVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Request event">
          <SymbolView name="plus" size={18} weight="bold" tintColor={palette.white} />
        </Pressable>
      ) : null}

      <CommunityRequestSheet
        visible={requestVisible}
        onClose={() => setRequestVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  controls: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: palette.gray[50],
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 4,
    gap: 16,
    paddingBottom: 120,
    flexGrow: 1,
  },
  heading: {
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  loader: {
    marginVertical: 48,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: palette.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
