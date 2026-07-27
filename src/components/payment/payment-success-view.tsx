import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';
import { useTenantStore } from '@/stores/tenant-store';

type PaymentSuccessViewProps = {
  isInvoicePayment?: boolean;
  isMoveInPayment?: boolean;
};

export function PaymentSuccessView({ isInvoicePayment, isMoveInPayment }: PaymentSuccessViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleDone() {
    if (isInvoicePayment) {
      await queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] });
      router.replace('/(tabs)/payments');
      return;
    }

    if (isMoveInPayment) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['booking-status'] }),
        queryClient.invalidateQueries({ queryKey: ['tenant-invoices'] }),
        useTenantStore.getState().fetchProfile(),
      ]);
      router.replace('/move-in-steps');
      return;
    }

    router.back();
  }

  return (
    <View style={styles.root}>
      <TenantScreenHeader title="Payment Successful" onBack={() => void handleDone()} />
      <View style={styles.container}>
        <Typography variant="display" size="sm" weight="bold" color={palette.lime[700]} style={styles.icon}>
          ✓
        </Typography>
        <Typography variant="text" size="xl" weight="medium" style={styles.title}>
          Congratulations
        </Typography>
        <Typography variant="text" size="md" color={palette.gray[600]} style={styles.message}>
          Payment has been completed successfully.
        </Typography>
        <Button label="Go Back" onPress={() => void handleDone()} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.white,
  },
  container: {
    flex: 1,
    backgroundColor: palette.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
});
