import { SymbolView } from 'expo-symbols';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { TAB_SCREEN_EXTRA_PADDING } from '@/constants/tab-bar';
import { Radius } from '@/constants/theme';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { useTenantInvoices } from '@/queries/use-tenant-invoices';
import type { TenantInvoice } from '@/types/invoice';
import { getSelectedInvoicesTotal } from '@/utils/invoice-payment';
import { priceFormatter } from '@/utils/tenant-format';

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
  const { payInvoice, payInvoices } = useInvoicePayment();
  const { data, isLoading, refetch, isRefetching } = useTenantInvoices();
  const [tab, setTab] = useState<PaymentsTab>('pending');
  const [selectedIds, setSelectedIds] = useState<Record<string, true>>({});

  const pendingInvoices = data?.pending ?? [];
  const selectedInvoices = useMemo(
    () => pendingInvoices.filter((invoice) => selectedIds[invoice.invoice_id]),
    [pendingInvoices, selectedIds],
  );
  const selectedCount = selectedInvoices.length;
  const selectionMode = selectedCount > 0;
  const selectedTotal = getSelectedInvoicesTotal(selectedInvoices);
  const allPendingSelected =
    pendingInvoices.length > 0 && selectedCount === pendingInvoices.length;

  function clearSelection() {
    setSelectedIds({});
  }

  function toggleInvoice(invoiceId: string) {
    setSelectedIds((current) => {
      const next = { ...current };
      if (next[invoiceId]) {
        delete next[invoiceId];
      } else {
        next[invoiceId] = true;
      }
      return next;
    });
  }

  function selectAllPending() {
    const next: Record<string, true> = {};
    pendingInvoices.forEach((invoice) => {
      if (invoice.invoice_id) next[invoice.invoice_id] = true;
    });
    setSelectedIds(next);
  }

  function handleTabChange(nextTab: PaymentsTab) {
    if (nextTab !== 'pending') clearSelection();
    setTab(nextTab);
  }

  function handlePaySelected() {
    if (selectedInvoices.length === 0) return;
    payInvoices(selectedInvoices);
    clearSelection();
  }

  function handlePayAll() {
    if (pendingInvoices.length === 0) return;
    payInvoices(pendingInvoices);
    clearSelection();
  }

  function renderPendingList(list: TenantInvoice[]) {
    return (
      <View style={styles.list}>
        {list.length > 1 && !selectionMode ? (
          <Pressable
            onPress={handlePayAll}
            style={styles.payAllButton}
            accessibilityRole="button"
            accessibilityLabel="Pay all pending invoices">
            <Typography variant="text" size="sm" weight="medium" color={palette.lime[800]}>
              Pay all ({list.length})
            </Typography>
            <Typography variant="text" size="sm" weight="bold" color={palette.lime[800]}>
              {priceFormatter(getSelectedInvoicesTotal(list))}
            </Typography>
          </Pressable>
        ) : null}

        {list.map((invoice) => (
          <PaymentCard
            key={invoice.invoice_id}
            invoice={invoice}
            variant="pending"
            selected={Boolean(selectedIds[invoice.invoice_id])}
            selectionMode={selectionMode}
            onPay={() => payInvoice(invoice)}
            onInvoice={() => openInvoice(invoice)}
            onPress={() => openInvoice(invoice)}
            onLongPress={() => toggleInvoice(invoice.invoice_id)}
            onToggleSelect={() => toggleInvoice(invoice.invoice_id)}
          />
        ))}
      </View>
    );
  }

  function renderTabContent(tabId: PaymentsTab) {
    const list = tabId === 'pending' ? pendingInvoices : data?.paid ?? [];

    return (
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom:
              tabBarInset +
              TAB_SCREEN_EXTRA_PADDING +
              (tabId === 'pending' && selectionMode ? 88 : 0),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              clearSelection();
              void refetch();
            }}
          />
        }
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator color={palette.lime[700]} style={styles.loader} />
        ) : list.length > 0 ? (
          tabId === 'pending' ? (
            renderPendingList(list)
          ) : (
            <View style={styles.list}>
              {list.map((invoice) => (
                <PaymentCard
                  key={invoice.invoice_id}
                  invoice={invoice}
                  variant="paid"
                  onInvoice={() => openInvoice(invoice)}
                  onPress={() => openInvoice(invoice)}
                />
              ))}
            </View>
          )
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
          onChange={handleTabChange}
          tabs={[
            { id: 'pending', label: 'Pending Payment' },
            { id: 'past', label: 'Past Payments' },
          ]}
        />
      </View>

      {selectionMode ? (
        <View style={styles.selectionBar}>
          <Pressable
            onPress={clearSelection}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear selection">
            <SymbolView name="xmark.circle.fill" size={24} tintColor={palette.lime[700]} />
          </Pressable>

          <Pressable
            onPress={handlePaySelected}
            style={styles.selectionPay}
            accessibilityRole="button">
            <View style={styles.selectionRow}>
              <Typography variant="text" size="sm" color={palette.gray[700]}>
                {selectedCount} selected · Total
              </Typography>
              <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
                {priceFormatter(selectedTotal)}
              </Typography>
            </View>
            <View style={styles.selectionRow}>
              <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
                {allPendingSelected ? 'Pay all invoices' : 'Pay selected invoices'}
              </Typography>
              <Typography variant="text" size="sm" weight="bold" color={palette.lime[700]}>
                Tap to Pay
              </Typography>
            </View>
          </Pressable>

          {!allPendingSelected ? (
            <Pressable
              onPress={selectAllPending}
              style={styles.selectAllButton}
              accessibilityRole="button">
              <Typography variant="label" size="xs" weight="medium" color={palette.lime[800]}>
                All
              </Typography>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <SwipeableTabPager tabs={PAYMENTS_TABS} value={tab} onChange={handleTabChange}>
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
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[50],
    borderWidth: 1,
    borderColor: palette.lime[200],
  },
  clearButton: {
    padding: 2,
  },
  selectionPay: {
    flex: 1,
    gap: 2,
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: palette.white,
  },
  payAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 44,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[50],
    borderWidth: 1,
    borderColor: palette.lime[200],
    paddingHorizontal: 14,
    paddingVertical: 10,
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
