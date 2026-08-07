import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getHwEventDetail, getRegisteredEvents, postBookEvent } from '@/api/community';
import { WhosAttendingCard } from '@/components/community/whos-attending-card';
import { EventDetailSkeleton } from '@/components/skeleton';
import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { EVENT_FALLBACK_IMAGE } from '@/constants/community';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useCancelEventRegistration } from '@/queries/use-events';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantProfile } from '@/stores/tenant-store';
import type { CommunityEventDetailResponse } from '@/types/community';
import {
  buildEventPaymentParams,
  getEventPayableAmount,
} from '@/utils/event-payment';
import { normalizeGender } from '@/utils/form-prefill';
import { priceFormatter } from '@/utils/tenant-format';

function formatEventDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: '2-digit' });
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { day, time };
}

function isEventEnded(endDate?: string) {
  if (!endDate) return false;
  const end = new Date(endDate);
  return !Number.isNaN(end.getTime()) && end < new Date();
}

function parseRegistrationId(value?: string | number | null) {
  if (value == null || value === '') return null;
  const id = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function CommunityEventDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const profile = useTenantProfile();
  const authMobile = useAuthStore((state) => state.mobile);
  const { id, registrationId: registrationIdParam } = useLocalSearchParams<{
    id?: string;
    registrationId?: string;
  }>();
  const [event, setEvent] = useState<CommunityEventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(() =>
    parseRegistrationId(registrationIdParam),
  );
  const cancelRegistration = useCancelEventRegistration();

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const result = await getHwEventDetail(Number(id));
    setEvent(result.data);
    const detailRegistrationId = parseRegistrationId(result.data?.details?.registrationId);
    if (detailRegistrationId) {
      setRegistrationId(detailRegistrationId);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    const fromParam = parseRegistrationId(registrationIdParam);
    if (fromParam) {
      setRegistrationId(fromParam);
    }
  }, [registrationIdParam]);

  useEffect(() => {
    const details = event?.details;
    if (!details) return;

    const isRegistered = Boolean(details.is_registered || details.registered);
    if (!isRegistered || registrationId || !authMobile) return;

    let cancelled = false;
    void getRegisteredEvents(authMobile).then((result) => {
      if (cancelled) return;
      const match = result.data.find((item) => item.id === details.id);
      const matchedId = parseRegistrationId(match?.registrationId);
      if (matchedId) {
        setRegistrationId(matchedId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authMobile, event?.details, registrationId]);

  function openMaps() {
    const location = event?.details.location;
    if (!location?.lat || !location?.long) return;
    const coords = `${location.lat},${location.long}`;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${coords}`
        : `geo:${coords}?q=${coords}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open maps');
    });
  }

  async function handleRegister() {
    if (!event?.details || !profile?.userInfo) return;
    const { email, mobile: profileMobile, name } = profile.userInfo;
    const mobile = profileMobile || authMobile;
    if (!email || !mobile || !name) {
      Alert.alert('Complete your profile before registering');
      return;
    }

    const payload = {
      id: event.details.id,
      email,
      name,
      mobile,
      seatsBooked: 1,
    };
    const amount = getEventPayableAmount(event.paymentData?.total, event.details.amount);

    if (amount > 0) {
      router.push({
        pathname: '/complete-payment',
        params: buildEventPaymentParams({
          eventId: event.details.id,
          eventName: event.details.name,
          amount,
          email,
          mobile,
          name,
          payload,
        }),
      });
      return;
    }

    setRegistering(true);
    const { success, message } = await postBookEvent(payload);
    setRegistering(false);

    if (success) {
      void queryClient.invalidateQueries({ queryKey: ['community-events'] });
      router.push({
        pathname: '/community-registration-confirmed',
        params: {
          id: String(event.details.id),
          name: event.details.name,
        },
      });
      return;
    }

    Alert.alert('Registration failed', message ?? 'Please try again');
  }

  function handleCancel() {
    if (!event?.details) return;
    if (!registrationId) {
      Alert.alert('Unable to cancel', 'Registration details are still loading. Please try again.');
      return;
    }

    Alert.alert('Cancel registration?', `Remove yourself from ${event.details.name}?`, [
      { text: 'Keep registration', style: 'cancel' },
      {
        text: 'Cancel registration',
        style: 'destructive',
        onPress: () => {
          cancelRegistration.mutate(registrationId, {
            onSuccess: () => {
              setEvent((current) =>
                current
                  ? {
                      ...current,
                      details: {
                        ...current.details,
                        is_registered: false,
                        registered: false,
                        registrationId: undefined,
                      },
                    }
                  : current,
              );
              setRegistrationId(null);
              router.back();
            },
            onError: (error) => {
              Alert.alert(
                'Cancellation failed',
                error instanceof Error ? error.message : 'Please try again',
              );
            },
          });
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.root}>
        <EventDetailSkeleton />
      </View>
    );
  }

  if (!event?.details) {
    return (
      <View style={styles.root}>
        <TenantScreenHeader title="Event" onBack={() => router.back()} />
        <View style={styles.centered}>
          <Typography variant="text" size="sm" color={palette.gray[600]}>
            Event not found
          </Typography>
        </View>
      </View>
    );
  }

  const details = event.details;
  const start = formatEventDateTime(details.event_start_date ?? details.start_date);
  const ended = isEventEnded(details.event_end_date);
  const amount = getEventPayableAmount(event.paymentData?.total, details.amount);
  const totalRegistration =
    details.total_registration ?? details.people_attending ?? details.attendees_count ?? 0;
  const femaleCount = details.female_count ?? 0;
  const propertyCount = details.property_count ?? details.hw_properties_count;
  const showFemaleCount = normalizeGender(profile?.userInfo?.gender) === 'Female';
  const venue = [details.location?.propertyName, details.location?.street].filter(Boolean).join(', ');
  const isRegistered = Boolean(details.is_registered || details.registered || registrationId);
  const footerHeight = ended ? 0 : 132 + insets.bottom;
  const heroImageUri = details.display_image?.trim() || EVENT_FALLBACK_IMAGE;

  return (
    <View style={styles.root}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: footerHeight + 24 }}>
        {/* One compositing parent so rounded sheet corners reveal the hero, not the root bg. */}
        <View style={styles.heroCluster} collapsable={false}>
          <View style={styles.hero}>
            <Image
              source={{ uri: heroImageUri }}
              style={styles.heroImage}
              contentFit="cover"
            />
            <View style={[styles.heroHeader, { paddingTop: insets.top + 8 }]}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <HwSymbol name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[900]} />
              </Pressable>
            </View>
          </View>

          <View style={styles.bodySheet}>
            <Typography variant="text" size="xl" weight="bold" style={styles.title}>
              {details.name}
            </Typography>

            <View style={styles.card}>
              <Typography variant="label" size="xs" color={palette.gray[500]} style={styles.cardLabel}>
                Event Details
              </Typography>
              <View style={styles.dateRow}>
                {typeof start !== 'string' ? (
                  <>
                    <View style={styles.dateBadge}>
                      <Typography variant="text" size="lg" weight="medium">
                        {new Date(details.event_start_date ?? details.start_date ?? '').getDate()
                          .toString()
                          .padStart(2, '0')}
                      </Typography>
                      <Typography variant="label" size="xs" color={palette.gray[500]}>
                        {new Date(details.event_start_date ?? details.start_date ?? '')
                          .toLocaleDateString('en-IN', { month: 'short' })
                          .toUpperCase()}
                      </Typography>
                    </View>
                    <View style={styles.dateCopy}>
                      <Typography variant="text" size="sm" weight="medium">
                        {start.day}
                      </Typography>
                      <Typography variant="text" size="sm" color={palette.gray[600]}>
                        {start.time}
                      </Typography>
                    </View>
                  </>
                ) : null}
              </View>
              {venue ? (
                <View style={styles.venueBlock}>
                  <Typography variant="label" size="xs" color={palette.gray[500]}>
                    Venue
                  </Typography>
                  <Typography variant="text" size="sm" weight="medium">
                    {venue}
                  </Typography>
                  {details.location?.lat ? (
                    <Pressable
                      onPress={openMaps}
                      accessibilityRole="link"
                      style={styles.mapsLink}>
                      <HwSymbol name="mappin" size={14} tintColor={palette.lime[700]} />
                      <Typography variant="text" size="sm" color={palette.lime[700]}>
                        Show on Google Maps
                      </Typography>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>

            {details.description ? (
              <View style={styles.card}>
                <Typography variant="label" size="xs" color={palette.gray[500]} style={styles.cardLabel}>
                  About the Event
                </Typography>
                <Typography variant="text" size="sm" color={palette.gray[700]} style={styles.description}>
                  {details.description}
                </Typography>
              </View>
            ) : null}

            <WhosAttendingCard
              totalRegistration={totalRegistration}
              femaleCount={femaleCount}
              propertyCount={propertyCount}
              showFemaleCount={showFemaleCount}
            />

            {details.what_to_bring ? (
              <View style={styles.card}>
                <Typography variant="label" size="xs" color={palette.gray[500]} style={styles.cardLabel}>
                  What to bring
                </Typography>
                <Typography variant="text" size="sm" color={palette.gray[700]}>
                  {details.what_to_bring}
                </Typography>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {!ended ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
          <View style={styles.feeRow}>
            <Typography variant="text" size="sm" color={palette.gray[600]}>
              Event Registration Fee
            </Typography>
            <Typography variant="text" size="sm" weight="medium">
              {amount > 0 ? `${priceFormatter(amount)} +GST` : 'FREE'}
            </Typography>
          </View>
          {isRegistered ? (
            <Button
              label="Cancel registration"
              variant="outline"
              loading={cancelRegistration.isPending}
              onPress={handleCancel}
            />
          ) : (
            <Button label="Register" loading={registering} onPress={handleRegister} />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Match hero so any corner bleed blends with the image area, not a white strip.
    backgroundColor: palette.gray[100],
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[50],
  },
  heroCluster: {
    backgroundColor: 'transparent',
  },
  hero: {
    height: 260,
    backgroundColor: palette.gray[100],
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bodySheet: {
    marginTop: -28,
    backgroundColor: palette.gray[50],
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: { borderCurve: 'continuous' },
      default: {},
    }),
  },
  title: {
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: palette.gray[200],
    padding: 16,
    gap: 12,
  },
  cardLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBadge: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gray[100],
    borderRadius: Radius.md,
    paddingVertical: 8,
  },
  dateCopy: {
    flex: 1,
    gap: 2,
  },
  venueBlock: {
    gap: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  mapsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  description: {
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
    paddingHorizontal: 24,
    paddingTop: 14,
    gap: 12,
  },
  feeRow: {
    gap: 4,
  },
});
