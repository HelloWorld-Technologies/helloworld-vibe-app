import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { SosContactRow } from '@/components/tenant/sos-contact-row';
import { Typography } from '@/components/ui/typography';
import { SOS_CONFIG } from '@/constants/sos';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { getPropertyManagerByBookingId } from '@/api/user';
import { useTenantProfile } from '@/stores/tenant-store';
import { isBookingCancelled, isMovedOut } from '@/utils/booking-details-format';

export function SosScreen() {
  const profile = useTenantProfile();
  const hidePropertyManager = isBookingCancelled(profile) || isMovedOut(profile);
  const [pmName, setPmName] = useState(profile?.propertyInfo?.propertyManager?.name ?? '');
  const [pmPhone, setPmPhone] = useState(
    profile?.propertyInfo?.propertyManager?.mobile ?? '',
  );

  useEffect(() => {
    if (!profile?.bookingId || hidePropertyManager) return;
    getPropertyManagerByBookingId(profile.bookingId).then((res) => {
      if (res?.success && res?.data) {
        setPmName(res.data.name ?? '');
        setPmPhone(res.data.phone ?? res.data.mobile ?? '');
      }
    });
  }, [hidePropertyManager, profile?.bookingId]);

  const contacts = [
    {
      id: 'emergency',
      title: 'Emergency Helpline',
      subtitle: SOS_CONFIG.emergencySubtitle,
      phone: SOS_CONFIG.emergencyHelpline,
    },
    ...(!hidePropertyManager && pmName && pmPhone
      ? [
          {
            id: 'pm',
            title: pmName,
            subtitle: 'Property Manager',
            phone: pmPhone,
          },
        ]
      : []),
    {
      id: 'helpdesk',
      title: 'HW Help Desk',
      subtitle: SOS_CONFIG.helpDeskHours,
      phone: SOS_CONFIG.helpDeskPhone,
    },
  ];

  return (
    <ProfileStackScreen title="SOS" style={styles.screenBody}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        <Typography variant="text" size="xl" weight="bold" style={styles.heading}>
          Need help right now?
        </Typography>

        <View style={styles.card}>
          {contacts.map((contact, index) => (
            <SosContactRow
              key={contact.id}
              title={contact.title}
              subtitle={contact.subtitle}
              phone={contact.phone}
              isLast={index === contacts.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 0,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heading: {
    marginTop: 8,
  },
  card: {
    backgroundColor: palette.white,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
