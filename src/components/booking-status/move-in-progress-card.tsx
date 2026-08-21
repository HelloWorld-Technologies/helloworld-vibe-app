import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Typography } from '@/components/ui/typography';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { buildProgressMessage } from '@/utils/move-in-steps';

type MoveInProgressCardProps = {
  doneCount: number;
  total: number;
  moveInDate: string;
  movedIn?: boolean;
};

export function MoveInProgressCard({
  doneCount,
  total,
  moveInDate,
  movedIn = false,
}: MoveInProgressCardProps) {
  const progress = total > 0 ? doneCount / total : 0;
  const message = buildProgressMessage(doneCount, total, moveInDate, movedIn);
  const deadlineMatch = message.match(/on (.+?)(?: to avoid|\.|$)/);
  const deadline = deadlineMatch?.[1] ?? moveInDate;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Typography variant="text" size="sm" weight="medium" color={palette.gray[700]}>
          Your progress
        </Typography>
        <Typography variant="text" size="xs" weight="bold" color={palette.lime[700]}>
          {doneCount} of {total} done
        </Typography>
      </View>

      <View style={styles.track}>
        <LinearGradient
          colors={['#7FC723', '#3E6111']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${Math.max(progress * 100, 4)}%` }]}
        />
      </View>

      <Text style={styles.message}>
        {message.includes(deadline) ? (
          <>
            {message.split(deadline)[0]}
            <Text style={styles.messageBold}>{deadline}</Text>
            {message.split(deadline)[1]}
          </>
        ) : (
          message
        )}
      </Text>
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 8,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
    ...fontStyleForWeight('regular'),
    color: palette.gray[500],
  },
  messageBold: {
    ...fontStyleForWeight('bold'),
    color: palette.gray[500],
  },
});
