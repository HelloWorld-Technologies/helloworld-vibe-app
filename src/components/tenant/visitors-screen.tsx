import { useQueryClient } from '@tanstack/react-query';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { postVerifyVisitor } from '@/api/roommate';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { MateListSkeleton } from '@/components/skeleton';
import { AddMateSheet } from '@/components/tenant/mates/add-visitor-sheet';
import { ToastBanner } from '@/components/tenant/mates/toast-banner';
import { VisitorCard } from '@/components/tenant/mates/visitor-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { Radius } from '@/constants/theme';
import { useRoomMates } from '@/queries/use-roommates';
import { useTenantProfile } from '@/stores/tenant-store';
import type { RoomMate } from '@/types/roommate';

export function VisitorsScreen() {
  const insets = useSafeAreaInsets();
  const profile = useTenantProfile();
  const queryClient = useQueryClient();
  const { data: visitors, isLoading, isRefetching, refetch } = useRoomMates('VISITOR');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const propertyFallback = [profile?.propertyInfo?.address?.flatNo, profile?.propertyInfo?.name]
    .filter(Boolean)
    .join(' · ');

  async function handleVerify(mate: RoomMate) {
    if (!profile?.bookingId) return;
    const key = mate.id ?? mate.mobile;
    setVerifyingId(key);
    const result = await postVerifyVisitor({
      bookingId: profile.bookingId,
      mobile: mate.mobile,
      id: mate.id,
    });
    setVerifyingId(null);

    if (result.success) {
      setToastMessage(`We've sent a verification mail to ${mate.name}`);
      setToastVisible(true);
      await queryClient.invalidateQueries({ queryKey: ['room-mates', 'VISITOR'] });
    } else {
      setToastMessage(result.message ?? 'Unable to send verification mail');
      setToastVisible(true);
    }
  }

  function handleAdded() {
    void queryClient.invalidateQueries({ queryKey: ['room-mates', 'VISITOR'] });
  }

  const hasVisitors = Boolean(visitors?.length);

  return (
    <ProfileStackScreen title="My Visitors" centerTitle style={styles.screenBody}>
      <View style={styles.content}>
        {isLoading ? (
          <MateListSkeleton style={styles.loader} />
        ) : hasVisitors ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}>
            {visitors?.map((mate) => (
              <VisitorCard
                key={mate.id ?? mate.mobile}
                mate={mate}
                propertyFallback={propertyFallback}
                onVerify={() => handleVerify(mate)}
                verifying={verifyingId === (mate.id ?? mate.mobile)}
              />
            ))}
          </ScrollView>
        ) : (
          <EmptyState
            fill
            title="No visitors added yet"
            subtitle="Add and manage your visitor requests here."
            actionLabel="Add Visitor"
            onAction={() => setSheetVisible(true)}
          />
        )}

        {hasVisitors ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Pressable
              style={styles.addButton}
              onPress={() => setSheetVisible(true)}
              accessibilityRole="button">
              <HwSymbol name="plus" size={16} tintColor={palette.gray[800]} />
              <Typography variant="text" size="md" weight="bold" color={palette.gray[800]}>
                Add Visitor
              </Typography>
            </Pressable>
          </View>
        ) : null}

        <ToastBanner
          message={toastMessage}
          visible={toastVisible}
          onDismiss={() => setToastVisible(false)}
        />
      </View>

      <AddMateSheet
        visible={sheetVisible}
        inType="VISITOR"
        bookingId={profile?.bookingId}
        onClose={() => setSheetVisible(false)}
        onSuccess={handleAdded}
      />
    </ProfileStackScreen>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 0,
  },
  content: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 12,
  },
  loader: {
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
  },
  addButton: {
    minHeight: 48,
    borderRadius: Radius.full,
    backgroundColor: palette.lime[300],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
