import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { lookupPropertyIdByName } from '@/api/property';
import { RateVisitSheet } from '@/components/my-visits/rate-visit-sheet';
import { RescheduleVisitSheet } from '@/components/my-visits/reschedule-visit-sheet';
import { VisitCard } from '@/components/my-visits/visit-card';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';
import { SwipeableTabPager } from '@/components/ui/swipeable-tab-pager';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { TAB_SCREEN_EXTRA_PADDING } from '@/constants/tab-bar';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useVisits } from '@/queries/use-visits';
import { useIsTenant } from '@/stores/tenant-store';
import type { PropertyVisit, VisitTab } from '@/types/visit';
import {
  getVisitDirectionsUrl,
  getVisitId,
  getVisitPropertyId,
  getVisitPropertyName,
} from '@/utils/visit-format';
import { getExploreHomeRoute } from '@/utils/tenant-routing';

const VISIT_TABS: VisitTab[] = ['upcoming', 'past'];

function VisitsEmptyState({ tab, onExplore }: { tab: VisitTab; onExplore: () => void }) {
  if (tab === 'upcoming') {
    return (
      <EmptyState
        title="No upcoming visits"
        subtitle="Scheduled property visits will appear here."
        actionLabel="Explore Properties"
        onAction={onExplore}
      />
    );
  }

  return (
    <EmptyState
      title="No past visits yet"
      subtitle="Completed and cancelled visits will show up here after your tours."
    />
  );
}

function VisitsTabList({
  tabId,
  bottomPadding,
  onReschedule,
  onRateVisit,
  onBookNow,
  onViewProperty,
}: {
  tabId: VisitTab;
  bottomPadding: number;
  onReschedule: (visit: PropertyVisit) => void;
  onRateVisit: (visit: PropertyVisit) => void;
  onBookNow: (visit: PropertyVisit) => void;
  onViewProperty: (visit: PropertyVisit) => void;
}) {
  const router = useRouter();
  const isTenant = useIsTenant();
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVisits(tabId);

  const visits = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data],
  );

  const refreshing = isRefetching && !isFetchingNextPage;
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => void refetch()}
      tintColor={palette.lime[700]}
      colors={[palette.lime[700]]}
    />
  );

  function renderFooter() {
    if (!hasNextPage && !isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        {isFetchingNextPage ? (
          <ActivityIndicator color={palette.lime[700]} />
        ) : (
          <Pressable onPress={() => void fetchNextPage()} style={styles.loadMore}>
            <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
              Load more
            </Typography>
          </Pressable>
        )}
      </View>
    );
  }

  if (isLoading) {
    return <ActivityIndicator color={palette.lime[700]} style={styles.loader} />;
  }

  if (isError) {
    return (
      <ScrollView
        contentContainerStyle={[styles.centeredScroll, { paddingBottom: bottomPadding }]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}>
        <Typography variant="text" size="sm" color={palette.textSecondary} style={styles.errorText}>
          Unable to load visits right now.
        </Typography>
        <Pressable onPress={() => void refetch()} style={styles.retry}>
          <Typography variant="text" size="sm" weight="medium" color={palette.blue[600]}>
            Try again
          </Typography>
        </Pressable>
      </ScrollView>
    );
  }

  if (visits.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[styles.centeredScroll, { paddingBottom: bottomPadding }]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}>
        <VisitsEmptyState tab={tabId} onExplore={() => router.push(getExploreHomeRoute(isTenant))} />
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={visits}
      keyExtractor={(item) => getVisitId(item)}
      renderItem={({ item: visit }) => (
        <VisitCard
          visit={visit}
          onReschedule={() => onReschedule(visit)}
          onRateVisit={() => onRateVisit(visit)}
          onBookNow={() => onBookNow(visit)}
          onViewProperty={() => onViewProperty(visit)}
          onGetDirections={() => {
            const url = getVisitDirectionsUrl(visit);
            if (url) void Linking.openURL(url);
          }}
        />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={
        <Typography variant="text" size="xl" weight="bold" style={styles.listTitle}>
          {tabId === 'upcoming' ? 'Your upcoming visits' : 'Your past visits'}
        </Typography>
      }
      ListFooterComponent={renderFooter}
      contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.35}
      refreshControl={refreshControl}
    />
  );
}

type MyVisitsScreenProps = {
  variant?: 'tab' | 'stack';
};

export function MyVisitsScreen({ variant = 'tab' }: MyVisitsScreenProps) {
  const router = useRouter();
  const tabBarInset = useTabBarInset();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<VisitTab>('upcoming');
  const [rescheduleVisit, setRescheduleVisit] = useState<PropertyVisit | null>(null);
  const [ratingVisit, setRatingVisit] = useState<PropertyVisit | null>(null);

  async function openProperty(visit: PropertyVisit, openBook = false) {
    let propertyId = getVisitPropertyId(visit);
    if (propertyId == null) {
      propertyId = await lookupPropertyIdByName(getVisitPropertyName(visit));
    }
    if (propertyId == null) return;

    router.push({
      pathname: '/hdp',
      params: {
        id: String(propertyId),
        name: getVisitPropertyName(visit),
        ...(openBook ? { openBook: '1' } : {}),
      },
    });
  }

  const bottomPadding =
    variant === 'tab'
      ? tabBarInset + TAB_SCREEN_EXTRA_PADDING
      : Math.max(insets.bottom, 16);

  const content = (
    <>
      <View style={styles.controls}>
        <SegmentedTabToggle
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'upcoming', label: 'Upcoming Visits' },
            { id: 'past', label: 'Past Visits' },
          ]}
        />
      </View>

      <SwipeableTabPager tabs={VISIT_TABS} value={tab} onChange={setTab}>
        {(tabId) => (
          <VisitsTabList
            tabId={tabId}
            bottomPadding={bottomPadding}
            onReschedule={setRescheduleVisit}
            onRateVisit={setRatingVisit}
            onBookNow={(visit) => openProperty(visit, true)}
            onViewProperty={(visit) => openProperty(visit)}
          />
        )}
      </SwipeableTabPager>

      <RescheduleVisitSheet
        visible={rescheduleVisit != null}
        visit={rescheduleVisit}
        onClose={() => setRescheduleVisit(null)}
      />

      <RateVisitSheet
        visible={ratingVisit != null}
        visit={ratingVisit}
        onClose={() => setRatingVisit(null)}
      />
    </>
  );

  if (variant === 'stack') {
    return (
      <ProfileStackScreen title="My Visits" centerTitle style={styles.stackBody}>
        {content}
      </ProfileStackScreen>
    );
  }

  return (
    <View style={styles.root}>
      <TenantScreenHeader title="My Visits" />
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  stackBody: {
    paddingHorizontal: 0,
    flex: 1,
  },
  controls: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: palette.white,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 4,
    flexGrow: 1,
  },
  listTitle: {
    marginBottom: 16,
  },
  separator: {
    height: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMore: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  centeredScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  retry: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loader: {
    marginTop: 32,
  },
});
