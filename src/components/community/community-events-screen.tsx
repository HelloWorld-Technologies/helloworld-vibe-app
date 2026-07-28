import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

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
  useCommunityEventsInfinite,
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
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCommunityEventsInfinite(tab);
  const cancelRegistration = useCancelEventRegistration();
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const events = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data],
  );

  const hasEvents = events.length > 0;
  const showEmpty = !isLoading && !hasEvents;
  const showPromo = tab === 'upcoming' && hasEvents;

  function handleCancel(event: CommunityEvent) {
    if (!event.registrationId) return;

    Alert.alert('Cancel registration?', `Remove yourself from ${event.name}?`, [
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
    ]);
  }

  function renderFooter() {
    return (
      <View style={styles.footer}>
        {showPromo ? <CommunityPromoCard onRequestPress={onRequestPress} /> : null}
        {hasNextPage || isFetchingNextPage ? (
          isFetchingNextPage ? (
            <ActivityIndicator color={palette.lime[700]} style={styles.footerLoader} />
          ) : (
            <Pressable onPress={() => void fetchNextPage()} style={styles.loadMore}>
              <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
                Load more
              </Typography>
            </Pressable>
          )
        ) : null}
      </View>
    );
  }

  if (isLoading) {
    return <ActivityIndicator color={palette.lime[700]} style={styles.loader} />;
  }

  if (showEmpty) {
    return (
      <EmptyState
        title={tab === 'registered' ? 'No registered events yet' : 'No events scheduled this week'}
        subtitle={
          tab === 'registered'
            ? 'Events you register for will show up here.'
            : 'Got an idea? Help us plan the next one.'
        }
        actionLabel={tab === 'registered' ? undefined : 'Request Event'}
        onAction={tab === 'registered' ? undefined : onRequestPress}
      />
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => `${item.id}-${item.registrationId ?? 'event'}`}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      ListHeaderComponent={
        <Typography variant="text" size="lg" weight="medium" style={styles.heading}>
          {COMMUNITY_TAB_HEADINGS[tab]}
        </Typography>
      }
      renderItem={({ item }) => (
        <CommunityEventCard
          event={item}
          onPress={() => onEventPress(item.id)}
          onCancel={tab === 'registered' ? () => handleCancel(item) : undefined}
          cancelLoading={cancellingId === item.registrationId}
        />
      )}
      ListFooterComponent={renderFooter}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.35}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetchingNextPage}
          onRefresh={() => void refetch()}
        />
      }
    />
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
  list: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 120,
    gap: 8,
    flexGrow: 1,
  },
  heading: {
    marginTop: 4,
    marginBottom: 8,
  },
  gridRow: {
    gap: 8,
  },
  loader: {
    marginVertical: 48,
  },
  footer: {
    gap: 16,
    paddingTop: 8,
  },
  footerLoader: {
    marginVertical: 12,
  },
  loadMore: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
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
