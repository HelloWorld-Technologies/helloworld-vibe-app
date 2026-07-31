import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { cancelVisit, rescheduleVisit } from '@/api/visit';
import { VisitDateTimePicker } from '@/components/my-visits/visit-date-time-picker';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { queryKeys } from '@/queries/keys';
import { usePropertyVisitSlots } from '@/queries/use-property-visit-slots';
import { useVisitPropertyId } from '@/queries/use-visit-property-id';
import type { PropertyVisit, VisitDateOption, VisitTimeSlot } from '@/types/visit';
import { getCrmVisitId } from '@/utils/visit-format';
import {
  findSlotDay,
  formatVisitApiDate,
  mapSlotDaysToDateOptions,
  mapTimeSlotsForDay,
} from '@/utils/visit-slots';

type RescheduleVisitSheetProps = {
  visible: boolean;
  visit: PropertyVisit | null;
  onClose: () => void;
  onRescheduled?: () => void;
};

export function RescheduleVisitSheet({
  visible,
  visit,
  onClose,
  onRescheduled,
}: RescheduleVisitSheetProps) {
  const queryClient = useQueryClient();
  const crmVisitId = visit ? getCrmVisitId(visit) : null;

  const {
    propertyId,
    isLoading: propertyIdLoading,
    isError: propertyIdError,
    refetch: refetchPropertyId,
  } = useVisitPropertyId(visit, visible);

  const {
    data: slotDays = [],
    isLoading: slotsLoading,
    isError: slotsError,
    refetch: refetchSlots,
  } = usePropertyVisitSlots(propertyId ? String(propertyId) : '', visible && propertyId != null);

  const visitDates = useMemo(() => mapSlotDaysToDateOptions(slotDays), [slotDays]);

  const [selectedDate, setSelectedDate] = useState<VisitDateOption | null>(null);
  const [selectedTime, setSelectedTime] = useState<VisitTimeSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const selectedSlotDay = useMemo(
    () => (selectedDate ? findSlotDay(slotDays, selectedDate) : undefined),
    [selectedDate, slotDays],
  );

  const visitTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return mapTimeSlotsForDay(selectedSlotDay, selectedDate.date);
  }, [selectedDate, selectedSlotDay]);

  useEffect(() => {
    if (!visible) return;
    setSubmitting(false);
    setCancelling(false);
    setSelectedDate(visitDates[0] ?? null);
    setSelectedTime(null);
  }, [visible, visit, visitDates]);

  useEffect(() => {
    if (!visitDates.length) {
      setSelectedDate(null);
      return;
    }
    if (!selectedDate || !visitDates.some((date) => date.id === selectedDate.id)) {
      setSelectedDate(visitDates[0]);
    }
  }, [selectedDate, visitDates]);

  useEffect(() => {
    if (!visitTimeSlots.length) {
      setSelectedTime(null);
      return;
    }
    if (!selectedTime || !visitTimeSlots.some((slot) => slot.id === selectedTime.id)) {
      setSelectedTime(visitTimeSlots[0]);
    }
  }, [selectedTime, visitTimeSlots]);

  const canReschedule =
    !propertyIdLoading &&
    !slotsLoading &&
    Boolean(selectedDate?.slotId) &&
    Boolean(selectedTime?.value) &&
    visitTimeSlots.length > 0;

  function handleRetrySlots() {
    if (propertyId == null) {
      void refetchPropertyId();
      return;
    }
    void refetchSlots();
  }

  async function invalidateVisits() {
    await queryClient.invalidateQueries({ queryKey: queryKeys.visits() });
  }

  function handleCancelVisit() {
    if (!crmVisitId || cancelling || submitting) return;

    // Defer so the system alert presents above the bottom-sheet Modal.
    setTimeout(() => {
      Alert.alert(
        'Are you sure?',
        'Do you want to cancel this property visit? This cannot be undone.',
        [
          { text: 'Keep visit', style: 'cancel' },
          {
            text: 'Yes, cancel visit',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                setCancelling(true);
                try {
                  const response = await cancelVisit(crmVisitId);
                  if (!response.success) {
                    Alert.alert(
                      'Unable to cancel',
                      response.error || response.message || 'Please try again.',
                    );
                    return;
                  }

                  await invalidateVisits();
                  onClose();
                  onRescheduled?.();
                  Alert.alert('Visit cancelled', 'Your visit has been cancelled.');
                } catch {
                  Alert.alert('Unable to cancel', 'Please try again.');
                } finally {
                  setCancelling(false);
                }
              })();
            },
          },
        ],
      );
    }, 0);
  }

  async function handleReschedule() {
    if (!crmVisitId || submitting || cancelling) return;

    if (!selectedDate?.slotId) {
      Alert.alert('Slots unavailable', 'Please choose a valid visit date.');
      return;
    }

    if (!selectedTime?.value) {
      Alert.alert('Select a time', 'Please choose an available visit time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await rescheduleVisit(crmVisitId, {
        date: formatVisitApiDate(selectedDate.date),
        time: selectedTime.value,
        slotId: selectedDate.slotId,
      });

      if (!response.success) {
        Alert.alert(
          'Unable to reschedule',
          response.error || response.message || 'Please try again.',
        );
        return;
      }

      await invalidateVisits();
      onClose();
      onRescheduled?.();
      Alert.alert('Visit rescheduled', 'Your visit has been updated with the new date and time.');
    } catch {
      Alert.alert('Unable to reschedule', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.content}>
        <Typography variant="text" size="xl" weight="bold" style={styles.title}>
          Pick your visit date & time
        </Typography>

        {propertyIdLoading ? (
          <View style={styles.slotsLoader}>
            <ActivityIndicator color={palette.lime[700]} />
          </View>
        ) : propertyId == null || propertyIdError ? (
          <View style={styles.emptyBlock}>
            <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.emptyCopy}>
              Visit slots are not available for this property right now.
            </Typography>
            <Button label="Retry" variant="outline" onPress={handleRetrySlots} />
          </View>
        ) : slotsLoading ? (
          <View style={styles.slotsLoader}>
            <ActivityIndicator color={palette.lime[700]} />
          </View>
        ) : slotsError || visitDates.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.emptyCopy}>
              No visit slots are available right now. Please try again later.
            </Typography>
            <Button label="Retry" variant="outline" onPress={handleRetrySlots} />
          </View>
        ) : selectedDate && selectedTime ? (
          <VisitDateTimePicker
            dates={visitDates}
            selectedDateId={selectedDate.id}
            onSelectDate={setSelectedDate}
            timeSlots={visitTimeSlots}
            selectedTimeId={selectedTime.id}
            onSelectTime={setSelectedTime}
          />
        ) : (
          <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.emptyCopy}>
            No time slots available for this date.
          </Typography>
        )}

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleCancelVisit}
            disabled={cancelling || submitting}
            style={[styles.sheetButton, styles.cancelButton]}
            accessibilityRole="button">
            <Typography variant="text" size="md" weight="medium" color={palette.red[700]}>
              {cancelling ? 'Cancelling…' : 'Cancel Visit'}
            </Typography>
          </Pressable>
          <Button
            label="Reschedule Visit"
            onPress={handleReschedule}
            loading={submitting}
            disabled={cancelling || !canReschedule}
            style={styles.sheetButton}
          />
        </View>

        <View style={styles.footerNote}>
          <Typography variant="text" size="xs" color={palette.gray[500]}>
            Completely Free
          </Typography>
          <View style={styles.footerDivider} />
          <Typography variant="text" size="xs" color={palette.gray[500]}>
            Reschedule Anytime
          </Typography>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    textAlign: 'center',
    color: '#0A0E14',
  },
  slotsLoader: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBlock: {
    gap: 12,
    alignItems: 'center',
  },
  emptyCopy: {
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetButton: {
    flex: 1,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: palette.red[50],
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: palette.gray[300],
  },
});
