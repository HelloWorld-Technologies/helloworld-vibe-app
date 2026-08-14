import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MoveOutAssets } from '@/constants/assets';
import { MOVE_OUT_REASONS, type MoveOutReason } from '@/constants/move-out';
import { MoveOutBankDetailsCard } from '@/components/move-out/move-out-bank-details-card';
import { MoveOutNoticeBanner } from '@/components/move-out/move-out-notice-banner';
import { Button } from '@/components/ui/button';
import { CalendarPickerModal } from '@/components/ui/calendar-picker-modal';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';
import { TextField } from '@/components/ui/text-field';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import {
  MOVE_OUT_CARD_GAP,
  MOVE_OUT_FORM_FOOTER_CLEARANCE,
  MOVE_OUT_FORM_GROUP_GAP,
  MOVE_OUT_SECTION_GAP,
  moveOutContent,
  moveOutFooter,
} from '@/constants/move-out-layout';
import { Radius } from '@/constants/theme';
import type { BankDetails } from '@/types/bank-details';
import type { MoveOutInfo } from '@/types/move-out';
import { formatMoveOutNotice, getEarliestMoveOutDate, getLatestMoveOutDate } from '@/utils/move-out';
import { formatDisplayDate } from '@/utils/tenant-format';

type MoveOutFormViewProps = {
  moveOutInfo?: MoveOutInfo | null;
  bankDetails: BankDetails | null;
  loading: boolean;
  onSubmit: (payload: {
    moveOutDate: Date;
    reason: string;
  }) => Promise<void>;
};

export function MoveOutFormView({
  moveOutInfo,
  bankDetails,
  loading,
  onSubmit,
}: MoveOutFormViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const minimumDate = useMemo(() => getEarliestMoveOutDate(), []);
  const maximumDate = useMemo(() => getLatestMoveOutDate(), []);
  const [moveOutDate, setMoveOutDate] = useState(minimumDate);
  const [reason, setReason] = useState<MoveOutReason | ''>('');
  const [otherReason, setOtherReason] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    setMoveOutDate(minimumDate);
  }, [minimumDate]);

  function handleSubmitPress() {
    if (!reason) {
      Alert.alert('Select a reason', 'Please tell us why you are moving out.');
      return;
    }
    if (reason === 'Other' && !otherReason.trim()) {
      Alert.alert('Enter a reason', 'Please describe why you are moving out.');
      return;
    }

    Alert.alert(
      'Confirm move-out',
      moveOutInfo?.message || 'Are you sure you want to proceed with your move-out request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Agree',
          onPress: () => {
            void onSubmit({
              moveOutDate,
              reason: reason === 'Other' ? otherReason.trim() : reason,
            });
          },
        },
      ],
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          moveOutContent.horizontal,
          { paddingBottom: insets.bottom + MOVE_OUT_FORM_FOOTER_CLEARANCE + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.retentionCard}>
          <View style={styles.retentionCopy}>
            <Typography variant="text" size="xl" weight="bold" color={palette.gray[800]}>
              We&apos;re Sad to See You Go
            </Typography>
            <Typography variant="text" size="xs" weight="medium" color={palette.gray[500]} style={styles.retentionSubtitle}>
              Thinking about leaving? If something isn&apos;t working for you, let&apos;s see if we can help.
            </Typography>
            <Button
              label="Help me stay"
              onPress={() => router.navigate('/(tabs)/support')}
              style={styles.stayButton}
            />
          </View>
          <Image source={MoveOutAssets.helpMeStay} style={styles.retentionImage} contentFit="contain" />
        </View>

        <View style={styles.formGroup}>
          <Typography variant="text" size="lg" weight="medium" style={styles.sectionTitle}>
            Moving Out? We&apos;ve Got You.
          </Typography>

          <View style={styles.card}>
            <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
              When Are You Moving Out?
            </Typography>
            <Pressable
              style={styles.dateField}
              onPress={() => setCalendarOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Select move-out date">
              <Typography variant="text" size="md" weight="medium" color={palette.gray[800]}>
                {formatDisplayDate(moveOutDate.toISOString())}
              </Typography>
              <HwSymbol name="calendar" size={16} tintColor={palette.gray[500]} />
            </Pressable>
            <MoveOutNoticeBanner>
              {formatMoveOutNotice(minimumDate, maximumDate)}
            </MoveOutNoticeBanner>
          </View>

          <View style={[styles.card, styles.reasonCard]}>
            <Typography variant="text" size="sm" weight="medium" color={palette.gray[800]}>
              Reason for Move-Out
            </Typography>
            <View style={styles.reasonList}>
              {MOVE_OUT_REASONS.map((item) => (
                <FilterCheckbox
                  key={item}
                  label={item}
                  checked={reason === item}
                  onChange={() => setReason(item)}
                  labelSize="xs"
                />
              ))}
            </View>
            {reason === 'Other' ? (
              <TextField
                value={otherReason}
                onChangeText={setOtherReason}
                placeholder="Please enter the reason"
                multiline
                numberOfLines={3}
                style={styles.otherReason}
              />
            ) : null}
          </View>

          <MoveOutBankDetailsCard bankDetails={bankDetails} />
        </View>
      </ScrollView>

      <View style={[moveOutFooter.bar, styles.formFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Typography variant="text" size="xs" weight="medium" style={styles.footerNote}>
          You won&apos;t be able to change your move-out date later.
        </Typography>
        <Pressable
          onPress={handleSubmitPress}
          disabled={loading}
          style={[styles.destructiveButton, loading && styles.destructiveButtonDisabled]}
          accessibilityRole="button">
          {loading ? (
            <Typography variant="text" size="md" weight="bold" color={palette.white}>
              Submitting...
            </Typography>
          ) : (
            <Typography variant="text" size="md" weight="bold" color={palette.white}>
              Submit Move-Out Request
            </Typography>
          )}
        </Pressable>
      </View>

      <CalendarPickerModal
        visible={calendarOpen}
        value={moveOutDate}
        minDate={minimumDate}
        maxDate={maximumDate}
        onClose={() => setCalendarOpen(false)}
        onApply={setMoveOutDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    gap: MOVE_OUT_SECTION_GAP,
    paddingTop: 8,
  },
  retentionCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.318 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 2,
  },
  retentionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  retentionSubtitle: {
    lineHeight: 18,
  },
  stayButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  retentionImage: {
    width: 108,
    height: 104,
    flexShrink: 0,
  },
  formGroup: {
    gap: MOVE_OUT_FORM_GROUP_GAP,
  },
  sectionTitle: {
    color: palette.black,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 16,
    gap: MOVE_OUT_CARD_GAP,
    shadowColor: '#8690A3',
    shadowOffset: { width: 0, height: 1.318 },
    shadowOpacity: 0.2,
    shadowRadius: 10.2,
    elevation: 2,
  },
  dateField: {
    minHeight: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reasonCard: {
    gap: 8,
  },
  reasonList: {
    gap: 0,
  },
  otherReason: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  footerNote: {
    textAlign: 'center',
    color: palette.black,
  },
  destructiveButton: {
    minHeight: 48,
    borderRadius: Radius.sm,
    backgroundColor: palette.red[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  destructiveButtonDisabled: {
    opacity: 0.7,
  },
  formFooter: {
    paddingTop: 12,
    gap: 12,
  },
});
