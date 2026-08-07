import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMoveOutChecklist, updateMoveOutChecklist } from '@/api/moveout';
import { MoveInChecklistSection } from '@/components/move-in/move-in-checklist-section';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { ChecklistSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import {
  MOVE_OUT_CHECKLIST_SECTION_GAP,
  MOVE_OUT_FOOTER_CLEARANCE,
  moveOutContent,
  moveOutFooter,
} from '@/constants/move-out-layout';
import type { MoveOutChecklistItems } from '@/types/move-out';
import {
  extractFeedbackComments,
  getChecklistSectionKeys,
  mergeFeedbackComments,
} from '@/utils/move-in-checklist';
import { useTenantProfile } from '@/stores/tenant-store';

type ScreenStatus = 'loading' | 'form' | 'submitting' | 'submitted' | 'approved' | 'readonly';

export function MoveOutChecklistScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId ?? '';

  const [screenStatus, setScreenStatus] = useState<ScreenStatus>('loading');
  const [checklist, setChecklist] = useState<MoveOutChecklistItems | null>(null);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchChecklist = useCallback(async () => {
    if (!bookingId) {
      setScreenStatus('form');
      return;
    }

    setScreenStatus('loading');

    const { success, data, message } = await getMoveOutChecklist(bookingId);

    if (success && data?.items) {
      setChecklist(data.items);
      setFeedbackComments(extractFeedbackComments(data.items));

      if (data.status) {
        setScreenStatus('approved');
      } else if (data.submitted) {
        setScreenStatus('readonly');
      } else {
        setScreenStatus('form');
      }
      return;
    }

    setErrorMessage(message ?? 'Failed to fetch checklist');
    setScreenStatus('form');
  }, [bookingId]);

  useEffect(() => {
    void fetchChecklist();
  }, [fetchChecklist]);

  function updateChecklistItem(sectionKey: string, itemKey: string, value: boolean) {
    setChecklist((current) => {
      if (!current) return current;
      return {
        ...current,
        [sectionKey]: {
          ...current[sectionKey],
          [itemKey]: value,
        },
      };
    });
  }

  async function handleSubmit() {
    if (!bookingId || !checklist) {
      Alert.alert('Missing booking', 'We could not find your booking details.');
      return;
    }

    setScreenStatus('submitting');

    const payloadItems = mergeFeedbackComments(checklist, feedbackComments);
    const { success, message } = await updateMoveOutChecklist({
      booking_id: bookingId,
      data: { items: payloadItems },
    });

    if (success) {
      setScreenStatus('submitted');
      return;
    }

    Alert.alert('Unable to submit', message ?? 'Please try again.');
    setScreenStatus('form');
  }

  async function handleApprove() {
    if (!bookingId) {
      return;
    }

    setScreenStatus('submitting');
    const { success, message } = await updateMoveOutChecklist({
      booking_id: bookingId,
      status: true,
    });

    if (success) {
      setScreenStatus('approved');
      return;
    }

    Alert.alert('Unable to approve', message ?? 'Please try again.');
    setScreenStatus('readonly');
  }

  if (screenStatus === 'loading') {
    return (
      <ProfileStackScreen title="Move-out Checklist" centerTitle style={styles.screen}>
        <ChecklistSkeleton />
      </ProfileStackScreen>
    );
  }

  if (screenStatus === 'submitting') {
    return (
      <ProfileStackScreen title="Move-out Checklist" centerTitle style={styles.screen}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={palette.lime[700]} size="large" />
        </View>
      </ProfileStackScreen>
    );
  }

  if (screenStatus === 'approved') {
    return (
      <ProfileStackScreen title="Move-out Checklist" centerTitle style={styles.screen}>
        <View style={[styles.centered, moveOutContent.horizontal, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.iconCircle}>
            <Typography variant="display" size="xs" weight="bold" color={palette.lime[600]}>
              ✓
            </Typography>
          </View>
          <Typography variant="text" size="xl" weight="bold" style={styles.heading}>
            Checklist approved
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.subheading}>
            We can process your refund after checklist approval.
          </Typography>
        </View>
      </ProfileStackScreen>
    );
  }

  if (screenStatus === 'submitted') {
    return (
      <ProfileStackScreen title="Move-out Checklist" centerTitle style={styles.screen}>
        <View style={[styles.centered, moveOutContent.horizontal, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.iconCircle}>
            <Typography variant="display" size="xs" weight="bold" color={palette.lime[600]}>
              ✓
            </Typography>
          </View>
          <Typography variant="text" size="xl" weight="bold" style={styles.heading}>
            Checklist submitted
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[500]} style={styles.subheading}>
            Your room inspection checklist is under review.
          </Typography>
        </View>
      </ProfileStackScreen>
    );
  }

  const readonly = screenStatus === 'readonly';
  const sectionKeys = checklist ? getChecklistSectionKeys(checklist) : [];

  return (
    <ProfileStackScreen title="Move-out Checklist" centerTitle style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            moveOutContent.horizontal,
            { paddingBottom: insets.bottom + MOVE_OUT_FOOTER_CLEARANCE },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Typography variant="text" size="xs" weight="medium" color={palette.blue[600]}>
              {readonly
                ? 'Review the checklist filled by your property manager and approve to proceed.'
                : 'Review your room items before submitting for inspection.'}
            </Typography>
          </View>

          {errorMessage && !checklist ? (
            <Typography variant="text" size="sm" color={palette.red[500]}>
              {errorMessage}
            </Typography>
          ) : null}

          {checklist
            ? sectionKeys.map((sectionKey) => (
                <MoveInChecklistSection
                  key={sectionKey}
                  sectionKey={sectionKey}
                  section={checklist[sectionKey]}
                  readonly={readonly}
                  onToggleItem={updateChecklistItem}
                />
              ))
            : null}

          <View style={styles.damageSection}>
            <Typography variant="text" size="xl" weight="bold" color={palette.black}>
              Any damages or missing items?
            </Typography>
            <TextField
              value={feedbackComments}
              onChangeText={setFeedbackComments}
              placeholder="Mention any damages, missing items, or concerns..."
              multiline
              numberOfLines={5}
              editable={!readonly}
              style={styles.damageInput}
            />
          </View>
        </ScrollView>

        <View style={[moveOutFooter.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {readonly ? (
            <>
              <Button label="Approve Checklist" onPress={handleApprove} />
              <Typography variant="text" size="xs" color={palette.gray[500]} style={styles.approveNote}>
                We can process the refund after approval from your side.
              </Typography>
            </>
          ) : (
            <Button label="Submit Move-Out Checklist" onPress={handleSubmit} disabled={!checklist} />
          )}
        </View>
      </KeyboardAvoidingView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
    paddingHorizontal: 0,
  },
  flex: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    gap: MOVE_OUT_CHECKLIST_SECTION_GAP,
    paddingTop: 8,
  },
  infoBanner: {
    backgroundColor: palette.blue[50],
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  damageSection: {
    gap: 8,
    marginTop: 8,
  },
  damageInput: {
    minHeight: 124,
    textAlignVertical: 'top',
  },
  approveNote: {
    textAlign: 'center',
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
});
