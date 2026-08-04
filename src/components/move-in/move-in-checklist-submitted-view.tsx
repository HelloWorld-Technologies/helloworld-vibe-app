import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';

type MoveInChecklistSubmittedViewProps = {
  onEdit: () => void;
};

export function MoveInChecklistSubmittedView({ onEdit }: MoveInChecklistSubmittedViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <ProfileStackScreen title="Move-in Checklist" centerTitle style={styles.screen}>
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={styles.iconCircle}>
          <Typography variant="display" size="xs" weight="bold" color={palette.lime[600]}>
            ✓
          </Typography>
        </View>
        <Typography variant="text" size="xl" weight="bold" style={styles.heading}>
          Your Checklist is Submitted Successfully
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.subheading}>
          Awaiting approval from your Property Manager. You can still edit until it&apos;s approved.
        </Typography>
        <Pressable onPress={onEdit} accessibilityRole="button">
          <Typography variant="text" size="sm" weight="bold" color={palette.blue[800]} style={styles.editLink}>
            Edit Checklist
          </Typography>
        </Pressable>

        <View style={styles.statusCard}>
          <Typography variant="text" size="md" weight="medium">
            Approval Status
          </Typography>
          <Typography variant="text" size="sm" weight="bold" color={palette.red[500]} style={styles.statusValue}>
            Awaiting approval from Property Manager
          </Typography>
        </View>
      </View>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.lime[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heading: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  subheading: {
    textAlign: 'center',
    lineHeight: 22,
  },
  editLink: {
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  statusCard: {
    width: '100%',
    marginTop: 24,
    padding: 20,
    borderRadius: Radius.sm,
    backgroundColor: palette.gray[100],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
