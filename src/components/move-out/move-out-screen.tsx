import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { getMoveOutInformation, postMoveOutInit } from '@/api/moveout';
import { getBankDetails } from '@/api/user';
import { MoveOutCantInitiateView } from '@/components/move-out/move-out-cant-initiate-view';
import { MoveOutCompletedView } from '@/components/move-out/move-out-completed-view';
import { MoveOutFormView } from '@/components/move-out/move-out-form-view';
import { MoveOutInitiatedView } from '@/components/move-out/move-out-initiated-view';
import { MoveOutPlanningSheet } from '@/components/move-out/move-out-planning-sheet';
import { ProfileStackScreen } from '@/components/profile/profile-stack-screen';
import { FormSkeleton } from '@/components/skeleton';
import palette from '@/constants/palette';
import type { BankDetails } from '@/types/bank-details';
import type { MoveOutInfo, MoveOutStatus } from '@/types/move-out';
import { useTenantProfile } from '@/stores/tenant-store';

function resolveScreenStatus(info: MoveOutInfo | null | undefined): MoveOutStatus {
  if (!info) {
    return 'blocked';
  }

  if (info.can_initiate_move_out) {
    return 'form';
  }

  if (info.move_out_status === 'initiated') {
    return 'initiated';
  }

  if (info.move_out_status === 'completed') {
    return 'completed';
  }

  return 'blocked';
}

export function MoveOutScreen() {
  const router = useRouter();
  const profile = useTenantProfile();
  const bookingId = profile?.bookingId ?? '';

  const [screenStatus, setScreenStatus] = useState<MoveOutStatus>('loading');
  const [moveOutInfo, setMoveOutInfo] = useState<MoveOutInfo | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [planningSheetVisible, setPlanningSheetVisible] = useState(false);

  const loadMoveOut = useCallback(async () => {
    if (!bookingId) {
      setScreenStatus('blocked');
      setErrorMessage('We could not find your booking details.');
      return;
    }

    setScreenStatus('loading');

    const [moveOutResult, bankResult] = await Promise.all([
      getMoveOutInformation(bookingId),
      getBankDetails(bookingId),
    ]);

    if (bankResult?.success && bankResult.data) {
      setBankDetails({
        name: bankResult.data.name ?? '',
        accountNumber: bankResult.data.accountNumber ?? '',
        ifscCode: bankResult.data.ifscCode ?? '',
      });
    } else {
      setBankDetails(null);
    }

    if (moveOutResult.success && moveOutResult.data) {
      setMoveOutInfo(moveOutResult.data);
      const nextStatus = resolveScreenStatus(moveOutResult.data);
      setScreenStatus(nextStatus);
      setErrorMessage(moveOutResult.data.reason ?? '');
      if (nextStatus === 'form') {
        setPlanningSheetVisible(true);
      }
      return;
    }

    setMoveOutInfo(null);
    setScreenStatus('blocked');
    setErrorMessage(moveOutResult.message ?? 'Failed to fetch move-out information');
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      void loadMoveOut();
    }, [loadMoveOut]),
  );

  async function handleSubmit(payload: { moveOutDate: Date; reason: string }) {
    if (!profile?.bookingId) {
      Alert.alert('Missing booking', 'We could not find your booking details.');
      return;
    }

    setSubmitting(true);
    const result = await postMoveOutInit({
      bookingId: profile.bookingId,
      tenantMobile: profile.userInfo?.mobile,
      moveOutDate: payload.moveOutDate.toISOString(),
      create: true,
      propertyName: profile.propertyInfo?.name,
      bankInfo: {
        accountNumber: bankDetails?.accountNumber,
        ifscCode: bankDetails?.ifscCode,
        accountName: bankDetails?.name,
      },
      moveOutReason: payload.reason,
    });
    setSubmitting(false);

    if (result.success) {
      await loadMoveOut();
      return;
    }

    Alert.alert('Unable to submit', result.message ?? 'Please try again.');
  }

  function goToDashboard() {
    router.replace('/(tabs)');
  }

  const screenTitle =
    screenStatus === 'initiated'
      ? 'Move-out Initiated'
      : 'Move-Out';

  let content = <FormSkeleton style={styles.loaderWrap} />;

  if (screenStatus === 'form') {
    content = (
      <MoveOutFormView
        moveOutInfo={moveOutInfo}
        bankDetails={bankDetails}
        loading={submitting}
        onSubmit={handleSubmit}
      />
    );
  } else if (screenStatus === 'initiated' && moveOutInfo) {
    content = (
      <MoveOutInitiatedView
        moveOutInfo={moveOutInfo}
        bankDetails={bankDetails}
        onGoToDashboard={goToDashboard}
      />
    );
  } else if (screenStatus === 'completed' && moveOutInfo) {
    content = (
      <MoveOutCompletedView moveOutInfo={moveOutInfo} onGoToDashboard={goToDashboard} />
    );
  } else if (screenStatus === 'blocked') {
    content = (
      <MoveOutCantInitiateView reason={errorMessage} onGoToDashboard={goToDashboard} />
    );
  }

  return (
    <>
      <ProfileStackScreen title={screenTitle} centerTitle style={styles.screen}>
        {content}
      </ProfileStackScreen>

      <MoveOutPlanningSheet
        visible={planningSheetVisible}
        transferAvailable={moveOutInfo?.internal_transfer_available !== false}
        onClose={() => setPlanningSheetVisible(false)}
        onProceed={() => setPlanningSheetVisible(false)}
        onHelpMeStay={() => {
          setPlanningSheetVisible(false);
          router.push('/(tabs)/support');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: palette.gray[50],
    paddingHorizontal: 0,
  },
  loaderWrap: {
    marginTop: 24,
  },
});
