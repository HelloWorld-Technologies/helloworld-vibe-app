import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { TenantScreenHeader } from '@/components/tenant/tenant-screen-header';
import { Button } from '@/components/ui/button';
import { HwSymbol } from '@/components/ui/hw-symbol';
import { Typography } from '@/components/ui/typography';
import palette from '@/constants/palette';

type PaymentErrorViewProps = {
  message?: string;
  onRetry?: () => void;
};

export function PaymentErrorView({ message, onRetry }: PaymentErrorViewProps) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <TenantScreenHeader title="Payment Failed" onBack={() => router.back()} />
      <View style={styles.container}>
        <View style={styles.iconWrap} accessibilityLabel="Payment failed">
          <HwSymbol name="xmark" size={48} weight="bold" tintColor={palette.red[600]} />
        </View>
        <Typography variant="text" size="xl" weight="medium" style={styles.title}>
          OOPS! Payment Failed
        </Typography>
        <Typography variant="text" size="sm" color={palette.gray[600]} style={styles.message}>
          {message || 'Payment could not be processed. Please try again.'}
        </Typography>
        {onRetry ? <Button label="Retry Payment" onPress={onRetry} style={styles.button} /> : null}
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
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'visible',
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
