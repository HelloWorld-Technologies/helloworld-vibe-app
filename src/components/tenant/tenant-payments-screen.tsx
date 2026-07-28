import { useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openInvoice, PaymentCard } from '@/components/tenant/payment-card';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';
import { SwipeableTabPager } from '@/components/ui/swipeable-tab-pager';
import palette from '@/constants/palette';
import { TAB_SCREEN_EXTRA_PADDING } from '@/constants/tab-bar';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { useTenantInvoices } from '@/queries/use-tenant-invoices';

type PaymentsTab = 'pending' | 'past';

const PAYMENTS_TABS: PaymentsTab[] = ['pending', 'past'];

function PaymentsEmptyState() {
  return (
    <EmptyState
      title="No payment due"
      subtitle="Your payments are sorted. Sit back and enjoy your stay."
    />
  );
}

export function TenantPaymentsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { payInvoice } = useInvoicePayment();
  const { data, isLoading, refetch, isRefetching } = useTenantInvoices();
  const [tab, setTab] = useState<PaymentsTab>('pending');

  function renderTabContent(tabId: PaymentsTab) {
    const list = tabId === 'pending' ? data?.pending ?? [] : data?.paid ?? [];

    return (
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + TAB_SCREEN_EXTRA_PADDING }]}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
        ) : list.length > 0 ? (
          <View style={styles.list}>
            {list.map((invoice) => (
              <PaymentCard
                key={invoice.invoice_id}
                invoice={invoice}
                variant={tabId === 'pending' ? 'pending' : 'paid'}
                onPay={() => payInvoice(invoice)}
                onInvoice={() => openInvoice(invoice)}
                onPress={() => openInvoice(invoice)}
              />
            ))}
          </View>
        ) : tabId === 'pending' ? (
          <PaymentsEmptyState />
        ) : (
          <EmptyState compact title="No past payments found" />
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.controls, { paddingTop: insets.top + 16 }]}>
        <SegmentedTabToggle
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'pending', label: 'Pending Payment' },
            { id: 'past', label: 'Past Payments' },
          ]}
        />
      </View>

      <SwipeableTabPager tabs={PAYMENTS_TABS} value={tab} onChange={setTab}>
        {renderTabContent}
      </SwipeableTabPager>
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
    paddingBottom: 12,
    backgroundColor: palette.gray[50],
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 4,
    flexGrow: 1,
    gap: 16,
  },
  list: {
    gap: 16,
  },
  loader: {
    marginTop: 32,
  },
});
