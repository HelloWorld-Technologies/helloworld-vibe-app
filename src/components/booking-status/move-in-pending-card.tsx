import { HwSymbol } from '@/components/ui/hw-symbol';
import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { MoveInStep } from '@/types/booking-status';

type MoveInPendingCardProps = {
  step: MoveInStep;
  onPress?: () => void;
};

export function MoveInPendingCard({ step, onPress }: MoveInPendingCardProps) {
  const isEnabled = step.enabled !== false;
  const showAction = Boolean(step.actionLabel && onPress && isEnabled);

  return (
    <View style={[styles.card, !isEnabled && styles.cardLocked]}>
      <View style={styles.topRow}>
        <Typography
          variant="text"
          size="sm"
          weight="medium"
          color={isEnabled ? palette.gray[800] : palette.gray[500]}
          style={styles.title}>
          {step.title}
        </Typography>
        <View style={[styles.pendingBadge, !isEnabled && styles.lockedBadge]}>
          <Typography
            variant="text"
            size="xs"
            weight="medium"
            color={isEnabled ? '#7A271A' : palette.gray[600]}>
            {isEnabled ? 'Pending' : 'Locked'}
          </Typography>
        </View>
      </View>

      <Typography variant="text" size="xs" color={palette.gray[500]}>
        {!isEnabled && step.lockedMessage ? step.lockedMessage : step.description}
      </Typography>

      {showAction ? (
        <Pressable onPress={onPress} style={styles.actionRow} accessibilityRole="button">
          <Typography variant="text" size="sm" weight="medium" color={palette.lime[700]}>
            {step.actionLabel}
          </Typography>
          <HwSymbol name="chevron.right" size={12} weight="semibold" tintColor={palette.lime[700]} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    padding: 16,
    gap: 8,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLocked: {
    backgroundColor: palette.gray[50],
    shadowOpacity: 0.08,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
  },
  pendingBadge: {
    backgroundColor: '#FFF0D1',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lockedBadge: {
    backgroundColor: palette.gray[200],
  },
  actionRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
});
