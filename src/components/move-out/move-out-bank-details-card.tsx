import { Pressable, StyleSheet, View } from 'react-native';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useRouter } from 'expo-router';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { BankDetails } from '@/types/bank-details';

type MoveOutBankDetailsCardProps = {
  bankDetails: BankDetails | null;
  showRefundNotice?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Typography variant="text" size="xs" color={palette.gray[500]}>
        {label}
      </Typography>
      <Typography variant="text" size="xs" weight="bold" color={palette.gray[800]}>
        {value}
      </Typography>
    </View>
  );
}

export function MoveOutBankDetailsCard({
  bankDetails,
  showRefundNotice = true,
}: MoveOutBankDetailsCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
          Refund Bank Details
        </Typography>
        <Pressable
          onPress={() => router.push('/profile/bank-details')}
          style={styles.editButton}
          accessibilityRole="button">
          <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
            Edit
          </Typography>
          <HwSymbol name="pencil" size={10} tintColor={palette.lime[700]} />
        </Pressable>
      </View>

      <DetailRow label="Account Holder Name" value={bankDetails?.name || 'Not filled'} />
      <DetailRow label="Account Number" value={bankDetails?.accountNumber || 'Not filled'} />
      <DetailRow label="IFSC Code" value={bankDetails?.ifscCode || 'Not filled'} />

      {showRefundNotice ? (
        <View style={styles.notice}>
          <Typography variant="text" size="xs" weight="medium" color={palette.red[900]} style={styles.noticeText}>
            Refund will be processed within 30 days from the date of move-out
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.318 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  notice: {
    backgroundColor: palette.yellow[50],
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  noticeText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
