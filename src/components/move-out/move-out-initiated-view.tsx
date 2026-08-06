import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoveOutBankDetailsCard } from '@/components/move-out/move-out-bank-details-card';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import {
  MOVE_OUT_CARD_GAP,
  MOVE_OUT_FOOTER_CLEARANCE,
  moveOutContent,
  moveOutFooter,
} from '@/constants/move-out-layout';
import { Radius } from '@/constants/theme';
import type { BankDetails } from '@/types/bank-details';
import type { MoveOutInfo } from '@/types/move-out';
import { getMoveOutChecklistStatusLabel } from '@/utils/move-out';
import { formatDisplayDate } from '@/utils/tenant-format';

type MoveOutInitiatedViewProps = {
  moveOutInfo: MoveOutInfo;
  bankDetails: BankDetails | null;
  onGoToDashboard: () => void;
};

export function MoveOutInitiatedView({
  moveOutInfo,
  bankDetails,
  onGoToDashboard,
}: MoveOutInitiatedViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checklistStatus = getMoveOutChecklistStatusLabel(moveOutInfo.move_out_checklist_status);
  const canOpenChecklist = checklistStatus.label === 'Filled By PM';

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          moveOutContent.horizontal,
          { paddingBottom: insets.bottom + MOVE_OUT_FOOTER_CLEARANCE },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.successBlock}>
          <View style={styles.successHalo}>
            <View style={styles.successCircle}>
              <HwSymbol name="checkmark" size={28} weight="bold" tintColor={palette.white} />
            </View>
          </View>
          <Typography variant="text" size="xl" weight="bold" color={palette.black}>
            Move-out request submitted
          </Typography>
          <Typography variant="text" size="xs" weight="medium" color={palette.gray[700]} style={styles.successCopy}>
            Inspection will be carried out towards the end of your notice period.
          </Typography>
          {moveOutInfo.move_out_date ? (
            <View style={styles.dateRow}>
              <HwSymbol name="calendar" size={12} tintColor={palette.gray[700]} />
              <Typography variant="text" size="xs" weight="medium" color={palette.gray[700]}>
                Move-Out Date: {formatDisplayDate(moveOutInfo.move_out_date)}
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
            Move-Out Checklist
          </Typography>
          <Typography variant="text" size="xs" color={palette.gray[500]}>
            {checklistStatus.label === 'Pending'
              ? 'Complete a quick room review before move-out. We\'ll verify the details during the inspection process.'
              : checklistStatus.label === 'Filled By PM'
                ? 'Your submitted room inspection checklist is under review.'
                : 'Your move-out checklist has been completed.'}
          </Typography>
          {canOpenChecklist ? (
            <Pressable
              onPress={() => router.push('/move-out-checklist')}
              style={styles.linkRow}
              accessibilityRole="button">
              <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
                View Submitted Checklist
              </Typography>
              <HwSymbol name="chevron.right" size={10} tintColor={palette.lime[700]} />
            </Pressable>
          ) : checklistStatus.label === 'Pending' ? (
            <Pressable
              onPress={() => router.push('/move-out-checklist')}
              style={styles.linkRow}
              accessibilityRole="button">
              <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
                Complete Checklist
              </Typography>
              <HwSymbol name="chevron.right" size={10} tintColor={palette.lime[700]} />
            </Pressable>
          ) : (
            <Typography
              variant="text"
              size="sm"
              weight="medium"
              color={checklistStatus.color === 'success' ? palette.lime[700] : palette.red[500]}>
              Status: {checklistStatus.label}
            </Typography>
          )}
        </View>

        <MoveOutBankDetailsCard bankDetails={bankDetails} showRefundNotice={false} />

        {moveOutInfo.rent_stop_date ? (
          <View style={styles.metaCard}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Rent Stop Date
            </Typography>
            <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
              {formatDisplayDate(moveOutInfo.rent_stop_date)}
            </Typography>
          </View>
        ) : null}
      </ScrollView>

      <View style={[moveOutFooter.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Button label="Go to Dashboard" onPress={onGoToDashboard} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    gap: MOVE_OUT_CARD_GAP,
    paddingTop: 8,
  },
  successBlock: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  successHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.lime[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCopy: {
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 276,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.318 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  metaCard: {
    backgroundColor: palette.gray[100],
    borderRadius: Radius.sm,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});
