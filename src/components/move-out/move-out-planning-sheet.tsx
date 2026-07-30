import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type MoveOutPlanningSheetProps = {
  visible: boolean;
  transferAvailable?: boolean;
  onClose: () => void;
  onProceed: () => void;
  onHelpMeStay: () => void;
};

export function MoveOutPlanningSheet({
  visible,
  transferAvailable = true,
  onClose,
  onProceed,
  onHelpMeStay,
}: MoveOutPlanningSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Typography variant="text" size="md" weight="medium" style={styles.title}>
          Planning to move?
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.subtitle}>
          You can switch to another HelloWorld property or proceed with your move-out request.
        </Typography>

        {transferAvailable ? (
          <View style={styles.transferBadge}>
            <Typography variant="text" size="xs" weight="medium" color={palette.blue[700]} style={styles.transferText}>
              Internal transfers available — 100% off move-out charges with dedicated assistance
            </Typography>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button label="Proceed with Move-out" onPress={onProceed} />
          <Button label="Help me stay" variant="text" onPress={onHelpMeStay} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  transferBadge: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  transferText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
});
