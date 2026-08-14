import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMoveInChecklist, updateMoveInChecklist } from '@/api/booking';
import { MoveInChecklistApprovedView } from '@/components/move-in/move-in-checklist-approved-view';
import { MoveInChecklistSection } from '@/components/move-in/move-in-checklist-section';
import { MoveInChecklistSubmittedView } from '@/components/move-in/move-in-checklist-submitted-view';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { ChecklistSkeleton } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { fontStyleForWeight } from '@/constants/fonts';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useKeyboardBottomInset } from '@/hooks/use-keyboard-bottom-inset';
import type { MoveInChecklistItems } from '@/types/move-in-checklist';
import {
  extractFeedbackComments,
  getChecklistSectionKeys,
  mergeFeedbackComments,
} from '@/utils/move-in-checklist';
import { useTenantProfile } from '@/stores/tenant-store';

type ScreenStatus = 'loading' | 'form' | 'submitting' | 'submitted' | 'approved';

export function MoveInChecklistScreen() {
  const insets = useSafeAreaInsets();
  const footerInset = useKeyboardBottomInset(Math.max(insets.bottom, 16));
  const queryClient = useQueryClient();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId ?? '';
  const scrollRef = useRef<ScrollView>(null);

  const [screenStatus, setScreenStatus] = useState<ScreenStatus>('loading');
  const [checklist, setChecklist] = useState<MoveInChecklistItems | null>(null);
  const [feedbackComments, setFeedbackComments] = useState('');

  const fetchChecklist = useCallback(async () => {
    if (!bookingId) {
      setScreenStatus('form');
      return;
    }

    setScreenStatus('loading');

    const { success, data, message } = await getMoveInChecklist(bookingId);

    if (success && data?.items) {
      setChecklist(data.items);
      setFeedbackComments(extractFeedbackComments(data.items));

      if (data.status) {
        setScreenStatus('approved');
      } else if (data.submitted) {
        setScreenStatus('submitted');
      } else {
        setScreenStatus('form');
      }
      return;
    }

    Alert.alert('Unable to load checklist', message || 'Please try again.');
    setScreenStatus('form');
  }, [bookingId]);

  useEffect(() => {
    void fetchChecklist();
  }, [fetchChecklist]);

  useEffect(() => {
    if (footerInset <= Math.max(insets.bottom, 16)) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [footerInset, insets.bottom]);

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
    const { success, message } = await updateMoveInChecklist({
      booking_id: bookingId,
      data: { items: payloadItems },
    });

    if (success) {
      setChecklist(payloadItems);
      await queryClient.invalidateQueries({ queryKey: ['booking-status'] });
      setScreenStatus('submitted');
      return;
    }

    Alert.alert('Submission failed', message || 'Please try again.');
    setScreenStatus('form');
  }

  if (screenStatus === 'loading') {
    return (
      <ProfileStackScreen title="Move-in Checklist" centerTitle style={styles.screen}>
        <ChecklistSkeleton />
      </ProfileStackScreen>
    );
  }

  if (screenStatus === 'submitted') {
    return <MoveInChecklistSubmittedView onEdit={() => setScreenStatus('form')} />;
  }

  if (screenStatus === 'approved') {
    return <MoveInChecklistApprovedView />;
  }

  const sectionKeys = getChecklistSectionKeys(checklist);

  if (!checklist || sectionKeys.length === 0) {
    return (
      <ProfileStackScreen title="Move-in Checklist" centerTitle style={styles.screen}>
        <View style={styles.emptyState}>
          <Typography variant="text" size="md" color={palette.gray[600]} style={styles.emptyText}>
            We couldn&apos;t load your room checklist right now.
          </Typography>
          <Button label="Try Again" onPress={() => void fetchChecklist()} />
        </View>
      </ProfileStackScreen>
    );
  }

  return (
    <ProfileStackScreen title="Move-in Checklist" centerTitle style={styles.screen}>
      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.banner}>
            <Typography variant="text" size="sm" color={palette.blue[800]} style={styles.bannerText}>
              Review the items provided in your room before submitting.
            </Typography>
          </View>

          {sectionKeys.map((sectionKey) => (
            <MoveInChecklistSection
              key={sectionKey}
              sectionKey={sectionKey}
              section={checklist?.[sectionKey] ?? {}}
              onToggleItem={updateChecklistItem}
            />
          ))}

          <View style={styles.feedbackSection}>
            <Typography variant="text" size="md" weight="bold" style={styles.feedbackTitle}>
              Found anything that needs attention?
            </Typography>
            <View style={styles.feedbackInputShell}>
              <TextInput
                value={feedbackComments}
                onChangeText={setFeedbackComments}
                placeholder="Tell us about anything not on the list above..."
                placeholderTextColor={palette.textPlaceholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={styles.feedbackInput}
                onFocus={() => {
                  setTimeout(() => {
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }, 80);
                }}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footerWrap}>
          <LinearGradient
            colors={['rgba(255,255,255,0)', palette.white]}
            style={styles.footerFade}
            pointerEvents="none"
          />
          <View style={[styles.footer, { paddingBottom: footerInset }]}>
            <Typography variant="text" size="xs" color={palette.gray[500]} style={styles.footerNote}>
              You can update your checklist until your Property Manager approves it.
            </Typography>
            <Button
              label="Submit Checklist"
              onPress={() => void handleSubmit()}
              loading={screenStatus === 'submitting'}
            />
          </View>
        </View>
      </View>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.white,
  },
  flex: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  scroll: {
    paddingTop: 4,
    paddingBottom: 24,
    gap: 24,
  },
  banner: {
    backgroundColor: palette.blue[50],
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    lineHeight: 22,
  },
  feedbackSection: {
    gap: 8,
  },
  feedbackTitle: {
    color: palette.gray[900],
  },
  feedbackInputShell: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: palette.borderDefault,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: palette.white,
  },
  feedbackInput: {
    flex: 1,
    minHeight: 88,
    fontSize: 16,
    lineHeight: 24,
    color: palette.textPrimary,
    ...fontStyleForWeight('regular'),
    padding: 0,
    margin: 0,
  },
  footerWrap: {
    backgroundColor: palette.white,
  },
  footerFade: {
    height: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: palette.white,
    gap: 10,
  },
  footerNote: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
