import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { TenantInvoice } from '@/types/invoice';
import {
  formatDisplayDate,
  getInvoiceDueLabel,
  getInvoiceTitle,
  priceFormatter,
} from '@/utils/tenant-format';

type PaymentCardProps = {
  invoice: TenantInvoice;
  variant: 'pending' | 'paid';
  selected?: boolean;
  selectionMode?: boolean;
  onPay?: () => void;
  onInvoice?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onToggleSelect?: () => void;
};

export function PaymentCard({
  invoice,
  variant,
  selected = false,
  selectionMode = false,
  onPay,
  onInvoice,
  onPress,
  onLongPress,
  onToggleSelect,
}: PaymentCardProps) {
  const dueMeta = variant === 'pending' ? getInvoiceDueLabel(invoice) : null;
  const amount =
    variant === 'pending' ? invoice.balance ?? invoice.total ?? 0 : invoice.total ?? invoice.balance ?? 0;
  const accent = variant === 'pending' ? palette.red[800] : palette.lime[700];
  const isPending = variant === 'pending';

  function handleCardPress() {
    if (isPending && selectionMode) {
      onToggleSelect?.();
      return;
    }
    (onPress ?? onInvoice)?.();
  }

  return (
    <Pressable
      onPress={handleCardPress}
      onLongPress={isPending ? onLongPress : undefined}
      delayLongPress={280}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={isPending ? { selected } : undefined}
      accessibilityLabel={`View invoice ${invoice.invoice_number ?? invoice.invoice_id}`}>
      <View style={styles.topRow}>
        {selectionMode && isPending ? (
          <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
            {selected ? (
              <SymbolView name="checkmark" size={12} weight="bold" tintColor={palette.white} />
            ) : null}
          </View>
        ) : null}

        <Typography variant="text" size="sm" weight="medium" style={styles.title} numberOfLines={1}>
          {getInvoiceTitle(invoice)}
        </Typography>
        {variant === 'pending' && dueMeta ? (
          <View
            style={[
              styles.badge,
              dueMeta.tone === 'error' ? styles.badgeError : styles.badgeWarning,
            ]}>
            <Typography variant="label" size="xs" weight="medium" color={palette.red[800]}>
              {dueMeta.label}
            </Typography>
          </View>
        ) : (
          <View style={styles.badgePaid}>
            <Typography variant="label" size="xs" weight="medium" color={palette.lime[700]}>
              Paid
            </Typography>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Typography variant="label" size="xs" color={palette.gray[500]}>
          Invoice ID: {invoice.invoice_number ?? invoice.invoice_id}
        </Typography>
        <Typography variant="label" size="xs" weight="medium" color={palette.gray[900]}>
          {variant === 'pending'
            ? `Due: ${formatDisplayDate(invoice.due_date)}`
            : `Paid on: ${formatDisplayDate(invoice.paid_date ?? invoice.due_date)}`}
        </Typography>
      </View>

      <View style={styles.bottomRow}>
        <Typography variant="display" size="xs" weight="bold" color={accent}>
          {priceFormatter(amount)}
        </Typography>

        {variant === 'pending' ? (
          selectionMode ? (
            <Typography variant="text" size="sm" weight="medium" color={palette.gray[500]}>
              {selected ? 'Selected' : 'Tap to select'}
            </Typography>
          ) : (
            <Pressable
              onPress={(event) => {
                event.stopPropagation?.();
                onPay?.();
              }}
              style={styles.actionRow}
              accessibilityRole="button">
              <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
                Pay Now
              </Typography>
              <SymbolView name="chevron.right" size={10} tintColor={palette.lime[700]} />
            </Pressable>
          )
        ) : (
          <Pressable
            onPress={(event) => {
              event.stopPropagation?.();
              onInvoice?.();
            }}
            style={styles.invoiceAction}
            accessibilityRole="button"
            accessibilityLabel="View invoice">
            <SymbolView name="square.and.arrow.down" size={14} tintColor={palette.lime[700]} />
            <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
              Invoice
            </Typography>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 3,
  },
  cardSelected: {
    backgroundColor: palette.lime[50],
    borderColor: palette.lime[300],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxSelected: {
    borderColor: palette.lime[600],
    backgroundColor: palette.lime[600],
  },
  title: {
    flex: 1,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeError: {
    backgroundColor: palette.red[100],
  },
  badgeWarning: {
    backgroundColor: palette.yellow[50],
  },
  badgePaid: {
    backgroundColor: palette.lime[50],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

/** Opens the native invoice details screen (line items). */
export function openInvoice(invoice: TenantInvoice) {
  if (!invoice.invoice_id) return;
  router.push({
    pathname: '/invoice',
    params: {
      invoiceId: invoice.invoice_id,
      title: invoice.invoice_number ?? getInvoiceTitle(invoice),
    },
  });
}
