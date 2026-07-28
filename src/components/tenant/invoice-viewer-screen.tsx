import { SymbolView } from 'expo-symbols';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { useInvoiceDetails } from '@/queries/use-invoice-details';
import type { InvoiceDetails, InvoiceLineItem, InvoiceLineItemTax, TenantInvoice } from '@/types/invoice';
import {
  formatDisplayDate,
  getInvoiceDueLabel,
  priceFormatter,
} from '@/utils/tenant-format';

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function lineItemTitle(item: InvoiceLineItem) {
  return item.name?.trim() || item.description?.trim() || 'Line item';
}

function lineItemAmount(item: InvoiceLineItem) {
  if (typeof item.item_total === 'number') return item.item_total;
  if (typeof item.rate === 'number' && typeof item.quantity === 'number') {
    return item.rate * item.quantity;
  }
  if (typeof item.rate === 'number') return item.rate;
  return 0;
}

function taxLabel(tax: InvoiceLineItemTax) {
  let name = tax.tax_name?.trim() || 'Tax';
  let percentage =
    typeof tax.tax_percentage === 'number' && !Number.isNaN(tax.tax_percentage)
      ? tax.tax_percentage
      : null;

  // Strip trailing " (2.5%)" / "(2.5%)" already baked into tax_name.
  const parenMatch = name.match(/^(.*?)\s*\((\d+(?:\.\d+)?)%\)$/i);
  if (parenMatch) {
    name = parenMatch[1].trim();
    if (percentage == null) {
      percentage = Number(parenMatch[2]);
    }
  }

  // Strip trailing rate glued to the name: "SGST2.5" / "CGST 9" → "SGST" / "CGST".
  const gluedMatch = name.match(/^(.*?)[\s_-]*(\d+(?:\.\d+)?)$/);
  if (gluedMatch && /[a-zA-Z]/.test(gluedMatch[1])) {
    name = gluedMatch[1].trim();
    if (percentage == null) {
      percentage = Number(gluedMatch[2]);
    }
  }

  if (percentage != null) {
    return `${name} (${percentage}%)`;
  }
  return name;
}

function getLineItemTaxes(item: InvoiceLineItem): InvoiceLineItemTax[] {
  if (Array.isArray(item.line_item_taxes) && item.line_item_taxes.length > 0) {
    return item.line_item_taxes;
  }

  if (item.tax_name && typeof item.tax_amount === 'number' && item.tax_amount !== 0) {
    return [
      {
        tax_name: item.tax_name,
        tax_amount: item.tax_amount,
        tax_percentage: item.tax_percentage,
      },
    ];
  }

  return [];
}

function getSummaryTaxes(data: InvoiceDetails): InvoiceLineItemTax[] {
  if (Array.isArray(data.taxes) && data.taxes.length > 0) {
    return data.taxes;
  }

  if (Array.isArray(data.line_item_taxes) && data.line_item_taxes.length > 0) {
    return data.line_item_taxes;
  }

  const totals = new Map<string, InvoiceLineItemTax>();
  for (const item of data.line_items) {
    for (const tax of getLineItemTaxes(item)) {
      const key = `${tax.tax_name ?? 'Tax'}|${tax.tax_percentage ?? ''}`;
      const current = totals.get(key);
      const amount = typeof tax.tax_amount === 'number' ? tax.tax_amount : 0;
      if (current) {
        totals.set(key, {
          ...current,
          tax_amount: (current.tax_amount ?? 0) + amount,
        });
      } else {
        totals.set(key, {
          tax_name: tax.tax_name,
          tax_percentage: tax.tax_percentage,
          tax_amount: amount,
        });
      }
    }
  }

  return Array.from(totals.values()).filter(
    (tax) => typeof tax.tax_amount === 'number' && tax.tax_amount !== 0,
  );
}

function statusTone(status?: string | null) {
  const normalized = (status ?? '').toLowerCase();
  if (normalized === 'paid') {
    return { bg: palette.lime[50], text: palette.lime[700], label: 'Paid' };
  }
  if (normalized === 'overdue') {
    return { bg: palette.red[100], text: palette.red[800], label: 'Overdue' };
  }
  if (['sent', 'unpaid', 'partially_paid'].includes(normalized)) {
    return { bg: palette.yellow[50], text: palette.red[800], label: 'Pending' };
  }
  if (!normalized) {
    return { bg: palette.gray[100], text: palette.gray[700], label: 'Invoice' };
  }
  return {
    bg: palette.gray[100],
    text: palette.gray[700],
    label: normalized.replace(/_/g, ' '),
  };
}

function SummaryRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <View style={styles.summaryRow}>
      <Typography
        variant="text"
        size={bold ? 'md' : 'sm'}
        weight={bold ? 'bold' : 'medium'}
        color={palette.gray[700]}>
        {label}
      </Typography>
      <Typography
        variant="text"
        size={bold ? 'md' : 'sm'}
        weight={bold ? 'bold' : 'medium'}
        color={accent ?? palette.gray[900]}>
        {value}
      </Typography>
    </View>
  );
}

export function InvoiceViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { payInvoice } = useInvoicePayment();
  const params = useLocalSearchParams<{
    invoiceId?: string;
    title?: string;
  }>();

  const invoiceId = firstParam(params.invoiceId)?.trim() ?? '';
  const fallbackTitle = firstParam(params.title)?.trim() || 'Invoice';
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useInvoiceDetails(invoiceId);

  const title = data?.invoice_number || fallbackTitle;
  const tone = statusTone(data?.status);
  const isPaid = (data?.status ?? '').toLowerCase() === 'paid';
  const balance = data?.balance ?? 0;
  const canPay = !isPaid && balance > 0;
  const summaryTaxes = data ? getSummaryTaxes(data) : [];
  const showSubtotal =
    data != null &&
    data.sub_total != null &&
    data.total != null &&
    data.sub_total !== data.total;

  const dueMeta = useMemo(() => {
    if (!data || isPaid) return null;
    return getInvoiceDueLabel({
      invoice_id: data.invoice_id,
      due_date: data.due_date ?? undefined,
      status: data.status ?? undefined,
    });
  }, [data, isPaid]);

  function handlePay() {
    if (!data) return;
    const invoice: TenantInvoice = {
      invoice_id: data.invoice_id,
      invoice_number: data.invoice_number ?? undefined,
      total: data.total ?? undefined,
      balance: data.balance ?? undefined,
      status: data.status ?? undefined,
      due_date: data.due_date ?? undefined,
      customer_id: data.customer_id ?? undefined,
      invoice_url: data.invoice_url ?? undefined,
    };
    payInvoice(invoice);
  }

  async function handleDownload() {
    if (!data?.invoice_url) return;
    await WebBrowser.openBrowserAsync(data.invoice_url, {
      toolbarColor: palette.white,
      controlsColor: palette.gray[800],
      showTitle: true,
      enableBarCollapsing: false,
    });
  }

  return (
    <View style={styles.root}>
      <TenantScreenHeader title={title} onBack={() => router.back()} />

      {!invoiceId ? (
        <View style={styles.centered}>
          <Typography variant="text" size="md" color={palette.textSecondary}>
            Invoice ID is missing.
          </Typography>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.lime[700]} />
        </View>
      ) : isError || !data ? (
        <View style={styles.centered}>
          <Typography variant="text" size="md" color={palette.textSecondary} style={styles.errorText}>
            {error instanceof Error ? error.message : 'Unable to load this invoice right now.'}
          </Typography>
          <Button label="Try again" onPress={() => void refetch()} style={styles.retry} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 16) + 24 },
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View style={styles.headerCopy}>
                <Typography variant="text" size="lg" weight="bold" color={palette.gray[900]}>
                  {data.invoice_number || data.invoice_id}
                </Typography>
                {data.customer_name ? (
                  <Typography variant="text" size="sm" color={palette.gray[600]}>
                    {data.customer_name}
                  </Typography>
                ) : null}
              </View>
              <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                <Typography variant="label" size="xs" weight="medium" color={tone.text}>
                  {tone.label}
                </Typography>
              </View>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  Invoice date
                </Typography>
                <Typography variant="text" size="sm" weight="medium">
                  {formatDisplayDate(data.date ?? undefined)}
                </Typography>
              </View>
              <View style={styles.metaItem}>
                <Typography variant="label" size="xs" color={palette.gray[500]}>
                  {isPaid ? 'Paid on' : 'Due date'}
                </Typography>
                <Typography variant="text" size="sm" weight="medium">
                  {formatDisplayDate(data.due_date ?? undefined)}
                </Typography>
              </View>
            </View>

            {dueMeta ? (
              <View
                style={[
                  styles.dueChip,
                  dueMeta.tone === 'error' ? styles.dueChipError : styles.dueChipWarning,
                ]}>
                <Typography variant="label" size="xs" weight="medium" color={palette.red[800]}>
                  {dueMeta.label}
                </Typography>
              </View>
            ) : null}
          </View>

          <View style={styles.section}>
            <Typography variant="text" size="md" weight="bold" style={styles.sectionTitle}>
              Item details
            </Typography>

            {data.line_items.length === 0 ? (
              <View style={styles.emptyLines}>
                <Typography variant="text" size="sm" color={palette.gray[600]}>
                  No item details found for this invoice.
                </Typography>
              </View>
            ) : (
              <View style={styles.linesCard}>
                {data.line_items.map((item, index) => {
                  const qty = item.quantity;
                  const rate = item.rate;
                  const key = String(item.line_item_id ?? item.item_id ?? `${index}`);
                  const itemTaxes = getLineItemTaxes(item);

                  return (
                    <View
                      key={key}
                      style={[
                        styles.lineRow,
                        index < data.line_items.length - 1 && styles.lineRowBorder,
                      ]}>
                      <View style={styles.lineCopy}>
                        <Typography variant="text" size="sm" weight="medium" color={palette.gray[900]}>
                          {lineItemTitle(item)}
                        </Typography>
                        {item.description && item.description !== item.name ? (
                          <Typography variant="text" size="xs" color={palette.gray[500]}>
                            {item.description}
                          </Typography>
                        ) : null}
                        {qty != null || rate != null ? (
                          <Typography variant="label" size="xs" color={palette.gray[500]}>
                            {[
                              qty != null ? `Qty ${qty}` : null,
                              rate != null ? `@ ${priceFormatter(rate)}` : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </Typography>
                        ) : null}
                        {itemTaxes.length > 0 ? (
                          <View style={styles.lineTaxes}>
                            {itemTaxes.map((tax, taxIndex) => (
                              <View
                                key={`${key}-tax-${tax.tax_id ?? tax.tax_name ?? taxIndex}`}
                                style={styles.lineTaxRow}>
                                <Typography variant="label" size="xs" color={palette.gray[500]}>
                                  {taxLabel(tax)}
                                </Typography>
                                <Typography variant="label" size="xs" color={palette.gray[700]}>
                                  {priceFormatter(tax.tax_amount ?? 0)}
                                </Typography>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                      <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
                        {priceFormatter(lineItemAmount(item))}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            {showSubtotal ? (
              <SummaryRow label="Subtotal" value={priceFormatter(data.sub_total ?? 0)} />
            ) : null}
            {summaryTaxes.length > 0
              ? summaryTaxes.map((tax, index) => (
                  <SummaryRow
                    key={`summary-tax-${tax.tax_id ?? tax.tax_name ?? index}`}
                    label={taxLabel(tax)}
                    value={priceFormatter(tax.tax_amount ?? 0)}
                  />
                ))
              : data.tax_total != null && data.tax_total > 0
                ? <SummaryRow label="Tax" value={priceFormatter(data.tax_total)} />
                : null}
            {data.total != null ? (
              <SummaryRow label="Total" value={priceFormatter(data.total)} bold />
            ) : null}
            {data.payment_made != null && data.payment_made > 0 ? (
              <SummaryRow label="Payment made" value={priceFormatter(data.payment_made)} />
            ) : null}
            {data.credits_applied != null && data.credits_applied > 0 ? (
              <SummaryRow label="Credits applied" value={priceFormatter(data.credits_applied)} />
            ) : null}
            {data.balance != null ? (
              <SummaryRow
                label="Balance"
                value={priceFormatter(data.balance)}
                bold
                accent={data.balance > 0 ? palette.red[800] : palette.lime[700]}
              />
            ) : null}
          </View>

          <View style={styles.actions}>
            {canPay ? <Button label="Pay Now" onPress={handlePay} /> : null}
            {data.invoice_url ? (
              <Pressable
                onPress={() => void handleDownload()}
                style={styles.downloadButton}
                accessibilityRole="button"
                accessibilityLabel="Download invoice">
                <SymbolView name="square.and.arrow.down" size={16} tintColor={palette.lime[700]} />
                <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
                  Download invoice
                </Typography>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  retry: {
    alignSelf: 'center',
    minWidth: 140,
  },
  headerCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
    gap: 14,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  dueChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dueChipError: {
    backgroundColor: palette.red[100],
  },
  dueChipWarning: {
    backgroundColor: palette.yellow[50],
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: palette.gray[900],
  },
  emptyLines: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
  },
  linesCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  lineRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray[200],
  },
  lineCopy: {
    flex: 1,
    gap: 4,
  },
  lineTaxes: {
    gap: 2,
    marginTop: 2,
  },
  lineTaxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryCard: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    padding: 16,
    gap: 12,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actions: {
    gap: 12,
    marginTop: 4,
  },
  downloadButton: {
    minHeight: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.lime[300],
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
