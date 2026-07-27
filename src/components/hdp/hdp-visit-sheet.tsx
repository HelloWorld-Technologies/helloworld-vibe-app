import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeOut, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createVisit } from '@/api/visit';
import { HdpBookOccupantForm, type OccupantFormErrors } from '@/components/hdp/hdp-book-occupant-form';
import { HdpBookRoomSelection } from '@/components/hdp/hdp-book-room-selection';
import {
    HdpVisitDetailsForm,
    type VisitContactDetails,
} from '@/components/hdp/hdp-visit-details-form';
import {
  VisitDateCardsRow,
  VisitTimeSlotsRow,
} from '@/components/my-visits/visit-date-time-picker';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { SegmentedTabToggle } from '@/components/ui/segmented-tab-toggle';
import { Typography } from '@/components/ui/typography';
import { ImageAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { queryKeys } from '@/queries/keys';
import { usePropertyVisitSlots } from '@/queries/use-property-visit-slots';
import { useAuthStore } from '@/stores/auth-store';
import { useBookingDraftStore } from '@/stores/booking-draft-store';
import { useTenantProfile } from '@/stores/tenant-store';
import type { BookingDraft } from '@/types/booking-payment';
import type { OccupancyType, OccupantDetails, PropertyCategory } from '@/types/booking';
import {
    buildBookRoomOptions,
    buildOccupancyOptions,
    getOccupancyLabel,
} from '@/utils/booking-rooms';
import {
  getDefaultMoveInDate,
  parseBookingDate,
  toBookingDateString,
} from '@/utils/booking-payment';
import {
    DEFAULT_VISIT_TIME_SLOTS,
    buildVisitDateOptions,
    formatVisitConfirmation,
    type VisitDateOption,
    type VisitTimeSlot,
} from '@/utils/visit-dates';
import {
  buildOccupantPrefill,
  buildVisitContactPrefill,
  normalizeMobile,
} from '@/utils/form-prefill';
import {
    buildPropertyMapUrl,
    findSlotDay,
    formatVisitApiDate,
    mapSlotDaysToDateOptions,
    mapTimeSlotsForDay,
} from '@/utils/visit-slots';

type VisitSheetTab = 'schedule' | 'book';
type ScheduleStep = 'datetime' | 'details' | 'confirmed';
type BookStep = 'rooms' | 'details';

const VISIT_SHEET_TABS = [
  { id: 'schedule' as const, label: 'Schedule a Visit' },
  { id: 'book' as const, label: 'Book Now' },
];

type HdpVisitSheetProps = {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  property?: Record<string, unknown> | null;
  propertyLocation?: string;
  imageUri?: string;
  rentLabel: string;
  depositLabel: string;
  startingRent?: number;
  minStayMonths?: number;
  roomTypes?: string[];
  categories?: PropertyCategory[];
  initialTab?: VisitSheetTab;
  /** When true, only the schedule-visit flow is shown (no Book Now tab). */
  visitOnly?: boolean;
  /** When true, only the Book Now flow is shown (no Schedule a Visit tab). */
  bookOnly?: boolean;
  /** Pre-fill room and occupant details when editing an existing booking draft. */
  editDraft?: BookingDraft | null;
  /** Called after the booking draft is saved instead of navigating to /booking. */
  onBookingUpdated?: () => void;
};

function validateVisitName(name: string) {
  return /^[a-zA-Z\s]{1,40}$/.test(name.trim());
}

function validateVisitEmail(email: string) {
  return /^([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,10})$/.test(email.trim());
}

function validatePhone(phone: string) {
  return phone.replace(/\D/g, '').length === 10;
}

function validateOccupantDetails(details: OccupantDetails): OccupantFormErrors {
  const errors: OccupantFormErrors = {};

  if (!details.firstName.trim()) {
    errors.firstName = 'Please enter your first name';
  } else if (!validateVisitName(details.firstName)) {
    errors.firstName = 'Please enter a valid first name';
  }

  if (!details.lastName.trim()) {
    errors.lastName = 'Please enter your last name';
  } else if (!validateVisitName(details.lastName)) {
    errors.lastName = 'Please enter a valid last name';
  }

  if (!details.email.trim()) {
    errors.email = 'Please enter your email';
  } else if (!validateVisitEmail(details.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!details.phone.trim()) {
    errors.phone = 'Please enter your phone number';
  } else if (!validatePhone(details.phone)) {
    errors.phone = 'Please enter a valid 10-digit phone number';
  }

  if (!details.gender) {
    errors.gender = 'Please select your gender';
  }

  return errors;
}

function PricingRow({ rentLabel, depositLabel }: { rentLabel: string; depositLabel: string }) {
  return (
    <View style={styles.pricingRow}>
      <View style={styles.pricingColumn}>
        <Typography variant="text" size="xs" color={palette.gray[500]}>
          Rent Starting From
        </Typography>
        <Typography variant="text" size="lg" weight="bold" color={palette.helloLime}>
          {rentLabel}
        </Typography>
      </View>
      <View style={styles.pricingDivider} />
      <View style={styles.pricingColumn}>
        <Typography variant="text" size="xs" color={palette.gray[500]}>
          Security Deposit
        </Typography>
        <Typography variant="text" size="lg" weight="bold">
          {depositLabel}
        </Typography>
      </View>
    </View>
  );
}

function VisitConfirmedContent({
  scheduleLabel,
  onViewTours,
  onDone,
}: {
  scheduleLabel: string;
  onViewTours: () => void;
  onDone: () => void;
}) {
  return (
    <LinearGradient
      colors={[palette.white, '#F4FCE8']}
      locations={[0.45, 1]}
      style={styles.confirmedGradient}>
      <View style={styles.confirmedContent}>
        <Image
          source={ImageAssets.tourConfirmed}
          style={styles.confirmedIllustration}
          contentFit="contain"
        />

        <Typography variant="text" size="xl" weight="bold" style={styles.confirmedTitle}>
          🎉 Your Property Tour is Confirmed!
        </Typography>

        <Typography variant="text" size="md" color={palette.gray[800]} style={styles.confirmedBody}>
          Your property tour is scheduled for {scheduleLabel}. Get ready to check out the space,
          explore the vibe, and see if it&apos;s the one. See you soon!
        </Typography>

        <View style={styles.confirmedActions}>
          <Button label="View My Tours" variant="outline" onPress={onViewTours} style={styles.confirmedButton} />
          <Button label="Got it!" onPress={onDone} style={styles.confirmedButton} />
        </View>
      </View>
    </LinearGradient>
  );
}

function occupancyFromDraft(draft: BookingDraft): OccupancyType {
  const label = draft.occupancyLabel.toLowerCase();
  if (label.includes('private')) return 'private';
  if (label.includes('double')) return 'double';
  if (label.includes('triple')) return 'triple';
  if (label.includes('quad')) return 'quadruple';
  return draft.sharingType === 'private' ? 'private' : 'double';
}

function occupantFromDraft(draft: BookingDraft): OccupantDetails {
  const moveInDate = parseBookingDate(draft.moveInDate) ?? getDefaultMoveInDate();
  moveInDate.setHours(0, 0, 0, 0);

  return {
    ...draft.occupant,
    moveInDate,
  };
}

export function HdpVisitSheet({
  visible,
  onClose,
  propertyId,
  propertyName,
  property,
  propertyLocation = '',
  imageUri,
  rentLabel,
  depositLabel,
  startingRent,
  minStayMonths = 3,
  roomTypes,
  categories,
  initialTab = 'schedule',
  visitOnly = false,
  bookOnly = false,
  editDraft = null,
  onBookingUpdated,
}: HdpVisitSheetProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setBookingDraft = useBookingDraftStore((state) => state.setDraft);
  const storedMobile = useAuthStore((state) => state.mobile);
  const profile = useTenantProfile();
  const insets = useSafeAreaInsets();
  const formPrefillSource = useMemo(
    () => ({ profile, mobile: storedMobile }),
    [profile, storedMobile],
  );
  const fallbackDates = useMemo(() => buildVisitDateOptions(), []);
  const occupancyOptions = useMemo(() => buildOccupancyOptions(roomTypes), [roomTypes]);

  const [activeTab, setActiveTab] = useState<VisitSheetTab>(initialTab);
  const { data: slotDays = [], isLoading: slotsLoading } = usePropertyVisitSlots(
    propertyId,
    visible && !bookOnly && (visitOnly || activeTab === 'schedule'),
  );

  const [scheduleStep, setScheduleStep] = useState<ScheduleStep>('datetime');
  const [bookStep, setBookStep] = useState<BookStep>('rooms');
  const [selectedDate, setSelectedDate] = useState<VisitDateOption>(fallbackDates[0]);
  const [selectedTime, setSelectedTime] = useState<VisitTimeSlot>(DEFAULT_VISIT_TIME_SLOTS[0]);
  const [visitContact, setVisitContact] = useState<VisitContactDetails>(() =>
    buildVisitContactPrefill({ mobile: storedMobile }),
  );
  const [visitErrors, setVisitErrors] = useState<Partial<Record<keyof VisitContactDetails, string>>>({});
  const [visitSubmitError, setVisitSubmitError] = useState('');
  const [occupantErrors, setOccupantErrors] = useState<OccupantFormErrors>({});
  const [occupantFormError, setOccupantFormError] = useState('');
  const [creatingVisit, setCreatingVisit] = useState(false);
  const [selectedOccupancy, setSelectedOccupancy] = useState<OccupancyType>(occupancyOptions[0]);
  const [selectedRoomId, setSelectedRoomId] = useState('1');
  const [occupantDetails, setOccupantDetails] = useState(() => buildOccupantPrefill({ mobile: storedMobile }));

  const hasApiSlots = slotDays.length > 0;
  const visitDates = useMemo(
    () => (hasApiSlots ? mapSlotDaysToDateOptions(slotDays) : fallbackDates),
    [fallbackDates, hasApiSlots, slotDays],
  );

  const selectedSlotDay = useMemo(
    () => findSlotDay(slotDays, selectedDate),
    [selectedDate, slotDays],
  );

  const visitTimeSlots = useMemo(() => {
    if (hasApiSlots) {
      return mapTimeSlotsForDay(selectedSlotDay, selectedDate.date);
    }

    return DEFAULT_VISIT_TIME_SLOTS;
  }, [hasApiSlots, selectedDate.date, selectedSlotDay]);

  const bookRooms = useMemo(
    () => buildBookRoomOptions(categories, selectedOccupancy, startingRent),
    [categories, selectedOccupancy, startingRent],
  );

  useEffect(() => {
    if (!bookRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(bookRooms[0]?.id ?? '1');
    }
  }, [bookRooms, selectedRoomId]);

  useEffect(() => {
    if (!occupancyOptions.includes(selectedOccupancy)) {
      setSelectedOccupancy(occupancyOptions[0]);
    }
  }, [occupancyOptions, selectedOccupancy]);

  useEffect(() => {
    if (!visitDates.length) return;

    if (!visitDates.some((date) => date.id === selectedDate.id)) {
      setSelectedDate(visitDates[0]);
    }
  }, [selectedDate.id, visitDates]);

  useEffect(() => {
    if (!visitTimeSlots.length) return;

    if (!visitTimeSlots.some((slot) => slot.id === selectedTime.id)) {
      setSelectedTime(visitTimeSlots[0]);
    }
  }, [selectedTime.id, visitTimeSlots]);

  useEffect(() => {
    if (!visible) return;

    setScheduleStep('datetime');
    setBookStep('rooms');
    setActiveTab(bookOnly ? 'book' : visitOnly ? 'schedule' : initialTab);

    const draftOccupancy = editDraft ? occupancyFromDraft(editDraft) : occupancyOptions[0];
    const resolvedOccupancy = occupancyOptions.includes(draftOccupancy)
      ? draftOccupancy
      : occupancyOptions[0];
    const defaultRoomId =
      buildBookRoomOptions(categories, resolvedOccupancy, startingRent)[0]?.id ?? '1';

    setSelectedDate(fallbackDates[0]);
    setSelectedTime(DEFAULT_VISIT_TIME_SLOTS[0]);
    setVisitContact(buildVisitContactPrefill(formPrefillSource));
    setVisitErrors({});
    setVisitSubmitError('');
    setOccupantErrors({});
    setOccupantFormError('');
    setCreatingVisit(false);
    setSelectedOccupancy(resolvedOccupancy);
    setSelectedRoomId(editDraft?.roomId ?? defaultRoomId);
    setOccupantDetails(
      editDraft ? occupantFromDraft(editDraft) : buildOccupantPrefill(formPrefillSource),
    );
  }, [
    bookOnly,
    categories,
    editDraft,
    fallbackDates,
    formPrefillSource,
    initialTab,
    occupancyOptions,
    startingRent,
    visible,
    visitOnly,
  ]);

  function handleClose() {
    onClose();
  }

  function handleViewTours() {
    handleClose();
    router.push('/(tabs)/my-visits');
  }

  function handleContinueToDetails() {
    if (hasApiSlots && !selectedDate.slotId) {
      Alert.alert('Slots unavailable', 'Please choose a valid visit date.');
      return;
    }

    if (!selectedTime?.value) {
      Alert.alert('Select a time', 'Please choose an available visit time slot.');
      return;
    }

    setVisitErrors({});
    setScheduleStep('details');
  }

  async function handleCreateVisit() {
    const nextErrors: Partial<Record<keyof VisitContactDetails, string>> = {};

    if (!validateVisitName(visitContact.name)) {
      nextErrors.name = 'Please enter a valid name';
    }

    if (!validateVisitEmail(visitContact.email)) {
      nextErrors.email = 'Please enter a valid email';
    }

    setVisitErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!propertyId || !selectedDate.slotId) {
      setVisitSubmitError('Visit slots are not available for this property right now.');
      return;
    }

    setVisitSubmitError('');
    setCreatingVisit(true);

    try {
      const response = await createVisit({
        date: formatVisitApiDate(selectedDate.date),
        savType: 'Physical',
        time: selectedTime.value,
        name: visitContact.name.trim(),
        email: visitContact.email.trim(),
        slotId: selectedDate.slotId,
        propertyId,
        source: 'app',
        url: buildPropertyMapUrl(property),
      });

      if (response.success) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.visits });
        setScheduleStep('confirmed');
      } else {
        setVisitSubmitError(response.error || response.message || 'Something went wrong.');
      }
    } catch {
      setVisitSubmitError('Something went wrong. Please try again.');
    } finally {
      setCreatingVisit(false);
    }
  }

  function handleBookNow() {
    setOccupantErrors({});
    setOccupantFormError('');
    setBookStep('details');
  }

  function handleOccupantChange(next: OccupantDetails) {
    setOccupantDetails(next);
    setOccupantFormError('');

    if (Object.keys(occupantErrors).length === 0) return;

    setOccupantErrors((current) => {
      const nextErrors = { ...current };
      (Object.keys(nextErrors) as (keyof OccupantDetails)[]).forEach((key) => {
        if (key === 'moveInDate') return;
        if (next[key] !== occupantDetails[key]) {
          delete nextErrors[key];
        }
      });
      return nextErrors;
    });
  }

  function handleVisitContactChange(next: VisitContactDetails) {
    setVisitContact(next);

    if (Object.keys(visitErrors).length === 0 && !visitSubmitError) return;

    setVisitErrors((current) => {
      const nextErrors = { ...current };
      (Object.keys(nextErrors) as (keyof VisitContactDetails)[]).forEach((key) => {
        if (next[key] !== visitContact[key]) {
          delete nextErrors[key];
        }
      });
      return nextErrors;
    });
    setVisitSubmitError('');
  }

  function handleVerifyPhone() {
    const selectedRoom = bookRooms.find((room) => room.id === selectedRoomId);

    if (!selectedRoom) {
      setOccupantFormError('Please choose a room type before continuing.');
      return;
    }

    setOccupantFormError('');
    const nextErrors = validateOccupantDetails(occupantDetails);
    setOccupantErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setBookingDraft({
      propertyId,
      propertyName,
      location: propertyLocation,
      imageUri,
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      roomPrice: selectedRoom.price,
      occupancyLabel: `${getOccupancyLabel(selectedOccupancy)} Room`,
      categoryId: selectedRoom.id,
      sharingType: selectedOccupancy === 'private' ? 'private' : 'sharing',
      moveInDate: toBookingDateString(occupantDetails.moveInDate),
      occupant: occupantDetails,
      securityDepositMonths: minStayMonths,
    });

    handleClose();
    if (onBookingUpdated) {
      onBookingUpdated();
    } else {
      router.push('/booking');
    }
  }

  const scheduleLabel = formatVisitConfirmation(selectedDate.date, selectedTime.label);
  const showScheduleConfirmed = activeTab === 'schedule' && scheduleStep === 'confirmed';
  const showSchedulePanel = !bookOnly && (visitOnly || activeTab === 'schedule');
  const showBookPanel = bookOnly || (!visitOnly && activeTab === 'book');
  const canContinueVisit =
    !slotsLoading &&
    hasApiSlots &&
    visitTimeSlots.length > 0 &&
    Boolean(selectedDate.slotId);

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <ScrollView
        style={styles.sheetScroll}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {showScheduleConfirmed ? (
          <VisitConfirmedContent
            scheduleLabel={scheduleLabel}
            onViewTours={handleViewTours}
            onDone={handleClose}
          />
        ) : (
          <>
            {!visitOnly && !bookOnly ? (
              <SegmentedTabToggle value={activeTab} onChange={setActiveTab} tabs={VISIT_SHEET_TABS} />
            ) : null}

            {showSchedulePanel ? (
              <Animated.View
                key="visit-schedule-panel"
                entering={SlideInLeft.duration(240)}
                exiting={FadeOut.duration(140)}
                style={styles.tabPanel}>
                {scheduleStep === 'details' ? (
                  <HdpVisitDetailsForm
                    value={visitContact}
                    errors={visitErrors}
                    submitError={visitSubmitError}
                    scheduleLabel={scheduleLabel}
                    loading={creatingVisit}
                    onChange={handleVisitContactChange}
                    onBack={() => setScheduleStep('datetime')}
                    onSubmit={handleCreateVisit}
                  />
                ) : (
                  <>
                    {!visitOnly ? (
                      <PricingRow rentLabel={rentLabel} depositLabel={depositLabel} />
                    ) : null}

                    <Typography variant="text" size="md" weight="bold" style={styles.sectionTitle}>
                      Pick your visit date & time
                    </Typography>

                    {slotsLoading ? (
                      <View style={styles.slotsLoader}>
                        <ActivityIndicator color={palette.helloLime} />
                      </View>
                    ) : visitDates.length === 0 ? (
                      <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.emptySlots}>
                        No visit slots are available right now. Please try again later.
                      </Typography>
                    ) : (
                      <>
                        <VisitDateCardsRow
                          dates={visitDates}
                          selectedId={selectedDate.id}
                          onSelect={setSelectedDate}
                          variant="compact"
                          contentContainerStyle={styles.dateTimeRow}
                        />

                        {visitTimeSlots.length > 0 ? (
                          <VisitTimeSlotsRow
                            slots={visitTimeSlots}
                            selectedId={selectedTime.id}
                            onSelect={setSelectedTime}
                            contentContainerStyle={styles.dateTimeRow}
                            animationKey={selectedDate.id}
                          />
                        ) : (
                          <Typography variant="text" size="sm" color={palette.gray[600]}>
                            No time slots available for this date.
                          </Typography>
                        )}
                      </>
                    )}

                    <Button
                      label="Visit for Free"
                      onPress={handleContinueToDetails}
                      disabled={!canContinueVisit}
                      style={styles.cta}
                    />

                    <View style={styles.footerNote}>
                      <Typography variant="text" size="xs" color={palette.gray[500]}>
                        Completely Free
                      </Typography>
                      <View style={styles.footerDivider} />
                      <Typography variant="text" size="xs" color={palette.gray[500]}>
                        Reschedule Anytime
                      </Typography>
                    </View>
                  </>
                )}
              </Animated.View>
            ) : null}

            {showBookPanel ? (
              <Animated.View
                key="visit-book-panel"
                entering={SlideInRight.duration(240)}
                exiting={FadeOut.duration(140)}
                style={styles.tabPanel}>
                {bookStep === 'rooms' ? (
                  <HdpBookRoomSelection
                    occupancyOptions={occupancyOptions}
                    selectedOccupancy={selectedOccupancy}
                    onOccupancyChange={setSelectedOccupancy}
                    rooms={bookRooms}
                    selectedRoomId={selectedRoomId}
                    onRoomSelect={setSelectedRoomId}
                    minStayMonths={minStayMonths}
                    onBookNow={handleBookNow}
                  />
                ) : (
                  <HdpBookOccupantForm
                    value={occupantDetails}
                    errors={occupantErrors}
                    formError={occupantFormError}
                    phoneEditable={!normalizeMobile(storedMobile)}
                    onChange={handleOccupantChange}
                    onBack={() => setBookStep('rooms')}
                    onVerifyPhone={handleVerifyPhone}
                  />
                )}
              </Animated.View>
            ) : null}
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetScroll: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: palette.white,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 20,
  },
  tabPanel: {
    gap: 20,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pricingColumn: {
    flex: 1,
    gap: 4,
  },
  pricingDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: palette.gray[300],
  },
  sectionTitle: {
    textAlign: 'center',
  },
  dateTimeRow: {
    gap: 10,
    paddingVertical: 2,
  },
  cta: {
    marginTop: 4,
  },
  slotsLoader: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptySlots: {
    textAlign: 'center',
    lineHeight: 22,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 4,
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: palette.gray[300],
  },
  confirmedGradient: {
    marginHorizontal: -24,
    marginTop: -12,
    marginBottom: -12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmedContent: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  confirmedIllustration: {
    width: 200,
    height: 180,
  },
  confirmedTitle: {
    textAlign: 'center',
  },
  confirmedBody: {
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmedActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  confirmedButton: {
    flex: 1,
  },
});
