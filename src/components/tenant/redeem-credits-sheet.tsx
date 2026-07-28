import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getCreditsDetails,
  postAvailCredits,
  type InvoiceCreditsInfo,
} from '@/api/invoice';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useTenantProfile } from '@/stores/tenant-store';
import { priceFormatter } from '@/utils/tenant-format';

type CreditType = 'referral' | 'rewards';

type RedeemCreditsSheetProps = {
  visible: boolean;
  invoiceId: string;
  onClose: () => void;
  onRedeemed: () => void;
};

export function RedeemCreditsSheet({
  visible,
  invoiceId,
  onClose,
  onRedeemed,
}: RedeemCreditsSheetProps) {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId ?? '';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [credits, setCredits] = useState<InvoiceCreditsInfo | null>(null);
  const [selectedType, setSelectedType] = useState<CreditType | ''>('');

  useEffect(() => {
    if (!visible) return;

    setSuccess(false);
    setSelectedType('');
    setCredits(null);
    setError('');

    if (!bookingId || !invoiceId) {
      setError('Unable to load credit details for this invoice.');
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      const response = await getCreditsDetails(invoiceId, bookingId);
      if (cancelled) return;

      if (response.success && response.data) {
        setCredits(response.data);
      } else {
        setError(response.message || 'Failed to fetch credit details');
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, invoiceId, bookingId]);

  function handleSelect(type: CreditType) {
    setSelectedType((current) => (current === type ? '' : type));
  }

  async function handleRedeem() {
    if (!bookingId || !credits || !selectedType || submitting) return;

    const amount = credits[selectedType];
    if (!amount || amount <= 0) return;

    setSubmitting(true);
    try {
      const response = await postAvailCredits({
        invoiceId,
        bookingId,
        type: selectedType,
        amount,
      });

      if (!response.success) {
        Alert.alert(
          'Unable to redeem',
          response.message || response.error || response.info || 'Please try again.',
        );
        return;
      }

      setSuccess(true);
      onRedeemed();
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch {
      Alert.alert('Unable to redeem', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const hasReferral = Boolean(credits?.referral && credits.referral > 0);
  const hasRewards = Boolean(credits?.rewards && credits.rewards > 0);
  const hasCredits = hasReferral || hasRewards;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        {success ? (
          <View style={styles.successBlock}>
            <Typography variant="text" size="lg" weight="bold" style={styles.centerText}>
              Points redeemed for this invoice
            </Typography>
            <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.centerText}>
              Your invoice balance has been updated.
            </Typography>
          </View>
        ) : loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={palette.lime[700]} />
          </View>
        ) : (
          <>
            <Typography variant="text" size="xl" weight="bold">
              Redeem Points
            </Typography>

            <View style={styles.infoBanner}>
              <Typography variant="text" size="sm" color={palette.gray[800]}>
                You can use unused credit points to reduce this invoice from referral or rewards
                balance.
              </Typography>
            </View>

            {hasCredits ? (
              <View style={styles.options}>
                {hasReferral ? (
                  <FilterCheckbox
                    label={`Use ${priceFormatter(credits?.referral ?? 0)} from referral balance`}
                    checked={selectedType === 'referral'}
                    onChange={() => handleSelect('referral')}
                  />
                ) : null}
                {hasRewards ? (
                  <FilterCheckbox
                    label={`Use ${priceFormatter(credits?.rewards ?? 0)} from rewards balance`}
                    checked={selectedType === 'rewards'}
                    onChange={() => handleSelect('rewards')}
                  />
                ) : null}
              </View>
            ) : (
              <Typography variant="text" size="sm" color={palette.red[700]}>
                {error || "You don't have available points"}
              </Typography>
            )}

            {hasCredits ? (
              <Button
                label="Redeem Points"
                onPress={() => void handleRedeem()}
                loading={submitting}
                disabled={!selectedType || submitting}
              />
            ) : null}
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  loader: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBlock: {
    gap: 8,
    paddingVertical: 24,
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  infoBanner: {
    backgroundColor: palette.yellow[50],
    borderRadius: Radius.sm,
    padding: 12,
  },
  options: {
    gap: 12,
  },
});
