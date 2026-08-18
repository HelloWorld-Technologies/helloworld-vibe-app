import { HwSymbol } from '@/components/ui/hw-symbol';
import { StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { MoveInStep } from '@/types/booking-status';

type MoveInCompletedSectionProps = {
  steps: MoveInStep[];
};

function CompletedRow({ step, showDivider }: { step: MoveInStep; showDivider: boolean }) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.checkIcon}>
            <HwSymbol name="checkmark.circle.fill" size={16} tintColor={palette.lime[700]} />
          </View>
          <Typography variant="text" size="sm" weight="medium" color={palette.gray[700]} style={styles.title}>
            {step.title}
          </Typography>
        </View>
        <View style={styles.completedBadge}>
          <Typography variant="text" size="xs" weight="medium" color={palette.lime[800]}>
            {step.completedLabel ?? 'Completed'}
          </Typography>
        </View>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export function MoveInCompletedSection({ steps }: MoveInCompletedSectionProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Typography variant="text" size="xl" weight="bold">
        Completed Actions
      </Typography>

      <View style={styles.card}>
        {steps.map((step, index) => (
          <CompletedRow key={step.id} step={step} showDivider={index < steps.length - 1} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 16,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    marginTop: 2,
  },
  title: {
    flex: 1,
  },
  completedBadge: {
    backgroundColor: palette.lime[50],
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.gray[200],
  },
});
