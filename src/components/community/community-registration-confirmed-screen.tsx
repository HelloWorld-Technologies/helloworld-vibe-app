import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { getHwEventDetail } from '@/api/community';
import { CommunityAssets } from '@/constants/assets';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import type { CommunityEventDetail } from '@/types/community';
import { useTenantProfile } from '@/stores/tenant-store';

function getInitials(name?: string) {
  if (!name?.trim()) return 'HW';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function formatDateParts(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    weekdayLabel: date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    }),
    timeLabel: date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
}

function formatTimeRange(start?: string, end?: string) {
  const startParts = formatDateParts(start);
  if (!startParts) return null;
  if (!end) return startParts.timeLabel;

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return startParts.timeLabel;

  const endLabel = endDate.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${startParts.timeLabel} - ${endLabel}`;
}

function toCalendarStamp(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function DashedDivider() {
  return (
    <View style={styles.dashedRow}>
      {Array.from({ length: 28 }, (_, index) => (
        <View key={index} style={styles.dash} />
      ))}
    </View>
  );
}

function ConfirmedStamp() {
  return (
    <View style={styles.stamp}>
      <View style={styles.stampInner}>
        <SymbolView name="checkmark" size={14} weight="bold" tintColor={palette.lime[700]} />
        <Typography variant="label" size="xs" weight="bold" color={palette.lime[800]} style={styles.stampText}>
          CONFIRMED
        </Typography>
      </View>
    </View>
  );
}

export function CommunityRegistrationConfirmedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const { id, name: nameParam } = useLocalSearchParams<{ id?: string; name?: string }>();
  const [event, setEvent] = useState<CommunityEventDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getHwEventDetail(Number(id));
    setEvent(result.data?.details ?? null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  const eventName = event?.name ?? nameParam ?? 'Event';
  const startValue = event?.event_start_date ?? event?.start_date;
  const dateParts = useMemo(() => formatDateParts(startValue), [startValue]);
  const timeRange = useMemo(
    () => formatTimeRange(startValue, event?.event_end_date),
    [event?.event_end_date, startValue],
  );
  const venue = useMemo(() => {
    const parts = [event?.location?.propertyName, event?.location?.street].filter(Boolean);
    return parts.join(', ') || event?.location?.propertyName || 'HelloWorld venue';
  }, [event?.location]);
  const attendeeName = profile?.userInfo?.name?.trim() || 'Guest';
  const attendeeMeta = [
    profile?.propertyInfo?.address?.flatNo,
    profile?.propertyInfo?.name,
  ]
    .filter(Boolean)
    .join(' • ');

  function handleShare() {
    void Share.share({
      message: `I'm going to ${eventName} with HelloWorld Community!${venue ? `\n📍 ${venue}` : ''}`,
    }).catch(() => undefined);
  }

  function handleAddToCalendar() {
    if (!startValue) {
      Alert.alert('Calendar', 'Event date is not available yet.');
      return;
    }

    const start = toCalendarStamp(startValue);
    const end = toCalendarStamp(event?.event_end_date) || start;
    const details = encodeURIComponent(`HelloWorld Community · ${eventName}`);
    const location = encodeURIComponent(venue);
    const title = encodeURIComponent(eventName);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    void Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open calendar');
    });
  }

  function handleDirections() {
    const lat = event?.location?.lat;
    const long = event?.location?.long;
    if (lat == null || long == null || String(lat).trim() === '' || String(long).trim() === '') {
      Alert.alert('Directions', 'Location is not available for this event.');
      return;
    }

    const coords = `${lat},${long}`;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${coords}`
        : `geo:${coords}?q=${coords}`;
    void Linking.openURL(url).catch(() => {
      Alert.alert('Unable to open maps');
    });
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.replace('/community-events')}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <SymbolView name="chevron.left" size={16} weight="semibold" tintColor={palette.gray[900]} />
        </Pressable>
        <Typography variant="text" size="lg" weight="bold" style={styles.headerTitle}>
          Registration Confirmed!
        </Typography>
        <Pressable
          onPress={handleShare}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Share registration">
          <SymbolView name="square.and.arrow.up" size={16} tintColor={palette.lime[700]} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={palette.lime[700]} />
        </View>
      ) : (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}>
          <Image
            source={CommunityAssets.registrationConfirmed}
            style={styles.illustration}
            contentFit="contain"
            accessibilityLabel="Registration confirmed illustration"
          />

          <Typography variant="text" size="xl" weight="bold" style={styles.title}>
            You&apos;re on the guest list!
          </Typography>
          <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.subtitle}>
            Show this to HelloWorld staff at the Venue
          </Typography>

          <View style={styles.ticket}>
            <View style={styles.ticketTop}>
              <Typography variant="text" size="lg" weight="bold" style={styles.eventName}>
                {eventName}
              </Typography>

              {dateParts ? (
                <View style={styles.dateRow}>
                  <View style={styles.dateBadge}>
                    <Typography variant="text" size="lg" weight="bold" color={palette.blue[800]}>
                      {dateParts.day}
                    </Typography>
                    <Typography variant="label" size="xs" weight="bold" color={palette.blue[700]}>
                      {dateParts.month}
                    </Typography>
                  </View>
                  <View style={styles.dateCopy}>
                    <Typography variant="text" size="sm" weight="medium">
                      {dateParts.weekdayLabel}
                    </Typography>
                    {timeRange ? (
                      <Typography variant="text" size="sm" color={palette.gray[600]}>
                        {timeRange}
                      </Typography>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={styles.venueRow}>
                <SymbolView name="mappin.and.ellipse" size={14} tintColor={palette.gray[800]} />
                <Typography
                  variant="text"
                  size="sm"
                  weight="medium"
                  color={palette.gray[800]}
                  style={styles.venueText}
                  numberOfLines={2}>
                  {venue}
                </Typography>
              </View>

              <View style={styles.stampWrap} pointerEvents="none">
                <ConfirmedStamp />
              </View>
            </View>

            <DashedDivider />

            <View style={styles.attendeeRow}>
              <View style={styles.avatar}>
                <Typography variant="text" size="sm" weight="bold" color={palette.lime[800]}>
                  {getInitials(attendeeName)}
                </Typography>
              </View>
              <View style={styles.attendeeCopy}>
                <Typography variant="text" size="sm" weight="bold" numberOfLines={1}>
                  {attendeeName}
                </Typography>
                {attendeeMeta ? (
                  <Typography variant="label" size="xs" color={palette.gray[500]} numberOfLines={1}>
                    {attendeeMeta}
                  </Typography>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <Pressable
          onPress={handleAddToCalendar}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add to calendar">
          <SymbolView name="calendar" size={16} tintColor={palette.gray[900]} />
          <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
            Add to calendar
          </Typography>
        </Pressable>
        <Pressable
          onPress={handleDirections}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
          accessibilityRole="button"
          accessibilityLabel="Get directions">
          <Typography variant="text" size="sm" weight="bold" color={palette.gray[900]}>
            Get Directions
          </Typography>
          <SymbolView name="location.north.fill" size={14} tintColor={palette.gray[900]} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: palette.gray[50],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  illustration: {
    width: 220,
    height: 220,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    textAlign: 'center',
    color: palette.gray[900],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  ticket: {
    width: '100%',
    marginTop: 8,
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  ticketTop: {
    gap: 14,
    position: 'relative',
    paddingRight: 8,
  },
  eventName: {
    color: palette.gray[900],
    paddingRight: 72,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBadge: {
    width: 56,
    borderRadius: Radius.md,
    backgroundColor: palette.blue[50],
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dateCopy: {
    flex: 1,
    gap: 2,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueText: {
    flex: 1,
  },
  stampWrap: {
    position: 'absolute',
    right: -4,
    top: 36,
  },
  stamp: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: palette.lime[500],
    backgroundColor: 'rgba(190, 242, 100, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  stampInner: {
    alignItems: 'center',
    gap: 2,
  },
  stampText: {
    letterSpacing: 0.4,
  },
  dashedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  dash: {
    width: 6,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: palette.gray[300],
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.lime[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeCopy: {
    flex: 1,
    gap: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: palette.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.gray[200],
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: palette.gray[300],
    backgroundColor: palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  secondaryPressed: {
    backgroundColor: palette.gray[50],
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.sm,
    backgroundColor: palette.lime[300],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  primaryPressed: {
    backgroundColor: palette.lime[400],
  },
});
