import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HelpDeskCard } from '@/components/support/help-desk-card';
import { TicketListSkeleton } from '@/components/skeleton';
import { RaiseRequestSheet } from '@/components/tenant/raise-request-sheet';
import { SupportTicketCard } from '@/components/tenant/support-ticket-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';
import { SwipeableTabPager } from '@/components/ui/swipeable-tab-pager';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { TAB_BAR_HEIGHT, TAB_SCREEN_EXTRA_PADDING } from '@/constants/tab-bar';
import { useRaiseSupportRequest } from '@/hooks/use-raise-support-request';
import { useSupportTicketsInfinite } from '@/queries/use-support-tickets';
import type { SupportTicket } from '@/types/ticket';

type SupportTab = 'active' | 'resolved';

const SUPPORT_TABS: SupportTab[] = ['active', 'resolved'];
const FAB_HEIGHT = 52;
const FAB_GAP = 12;
/** iOS NativeTabs content height (excludes home-indicator inset). */
const IOS_NATIVE_TAB_BAR_HEIGHT = 5;

function SupportTicketList({
  tabId,
  bottomPadding,
}: {
  tabId: SupportTab;
  bottomPadding: number;
}) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSupportTicketsInfinite(tabId);

  const tickets = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data ?? []),
    [data],
  );

  const refreshing = isRefetching && !isFetchingNextPage;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  function renderTicket({ item }: { item: SupportTicket }) {
    return <SupportTicketCard ticket={item} />;
  }

  function renderFooter() {
    if (tickets.length === 0) return null;
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

  function renderEmpty() {
    if (isError) {
      return (
        <View style={styles.centered}>
          <Typography variant="body" color={palette.textSecondary} style={styles.errorText}>
            Unable to load tickets right now.
          </Typography>
          <Button label="Try again" onPress={() => void refetch()} style={styles.retry} />
        </View>
      );
    }

    return (
      <EmptyState
        fill
        title={tabId === 'active' ? 'No active tickets yet' : 'No resolved tickets yet'}
        subtitle={
          tabId === 'active'
            ? 'Raise a request and our team will help you out.'
            : 'Resolved tickets will appear here once closed.'
        }
      />
    );
  }

  if (isLoading) {
    return <TicketListSkeleton style={styles.loader} />;
  }

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderTicket}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      onEndReached={() => {
        if (tickets.length === 0) return;
        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }}
      onEndReachedThreshold={0.35}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void refetch()} />
      }
    />
  );
}

export function TenantSupportScreen() {
  const insets = useSafeAreaInsets();
  const { sheetVisible, openRaiseRequest, closeRaiseRequest, submitRaiseRequest } =
    useRaiseSupportRequest();
  const [tab, setTab] = useState<SupportTab>('active');

  // iOS NativeTabs + Android floating tab bar both overlay the scene — lift FAB above them.
  const fabBottom =
    Platform.OS === 'ios'
      ? insets.bottom + IOS_NATIVE_TAB_BAR_HEIGHT + FAB_GAP
      : insets.bottom + TAB_BAR_HEIGHT + FAB_GAP;
  const scrollBottomPadding = fabBottom + FAB_HEIGHT + TAB_SCREEN_EXTRA_PADDING;

  return (
    <View style={styles.root}>
      <View style={[styles.controls, { paddingTop: insets.top + 16 }]}>
        <SegmentedTabToggle
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'active', label: 'Active Tickets' },
            { id: 'resolved', label: 'Resolved Tickets' },
          ]}
        />

        <HelpDeskCard />
      </View>

      <SwipeableTabPager tabs={SUPPORT_TABS} value={tab} onChange={setTab}>
        {(tabId) => <SupportTicketList tabId={tabId} bottomPadding={scrollBottomPadding} />}
      </SwipeableTabPager>

      <View style={[styles.fabWrap, { bottom: fabBottom }]}>
        <Button label="+ Raise New Request" onPress={openRaiseRequest} style={styles.fab} />
      </View>

      <RaiseRequestSheet
        visible={sheetVisible}
        onClose={closeRaiseRequest}
        onSubmit={submitRaiseRequest}
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
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 16,
    backgroundColor: palette.gray[50],
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 4,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  loader: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    textAlign: 'center',
  },
  retry: {
    minWidth: 140,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadMore: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 5,
  },
  fab: {
    minWidth: 192,
  },
});
