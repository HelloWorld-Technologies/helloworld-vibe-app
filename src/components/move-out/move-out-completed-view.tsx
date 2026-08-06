import { HwSymbol } from '@/components/ui/hw-symbol';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import type { MoveOutInfo } from '@/types/move-out';
import { formatDisplayDate } from '@/utils/tenant-format';

type MoveOutCompletedViewProps = {
  moveOutInfo: MoveOutInfo;
  onGoToDashboard: () => void;
};

export function MoveOutCompletedView({ moveOutInfo, onGoToDashboard }: MoveOutCompletedViewProps) {
  const insets = useSafeAreaInsets();

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
          <Typography variant="text" size="xl" weight="bold" color={palette.gray[800]} style={styles.heading}>
            You have moved out from the property
          </Typography>
        </View>

        <View style={styles.metaCard}>
          {moveOutInfo.move_out_date ? (
            <View style={styles.metaRow}>
              <Typography variant="text" size="sm" color={palette.gray[600]}>
                Move Out Date
              </Typography>
              <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
                {formatDisplayDate(moveOutInfo.move_out_date)}
              </Typography>
            </View>
          ) : null}
          {moveOutInfo.rent_stop_date ? (
            <View style={styles.metaRow}>
              <Typography variant="text" size="sm" color={palette.gray[600]}>
                Rent Stop Date
              </Typography>
              <Typography variant="text" size="sm" weight="bold" color={palette.gray[800]}>
                {formatDisplayDate(moveOutInfo.rent_stop_date)}
              </Typography>
            </View>
          ) : null}
        </View>
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
    gap: 16,
    paddingVertical: 16,
  },
  successHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.lime[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    maxWidth: 300,
  },
  metaCard: {
    backgroundColor: palette.gray[100],
    borderRadius: Radius.sm,
    padding: 16,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.gray[200],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});
