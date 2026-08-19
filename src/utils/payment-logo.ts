import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import { ImageAssets } from '@/constants/assets';

const FALLBACK_PAYMENT_LOGO =
  'https://hello-assets-items.s3.ap-south-1.amazonaws.com/icons/logo-icon.png';

let cachedPaymentLogo: string | null = null;

function canReadAsFile(uri: string) {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('/')
  );
}

/** Razorpay checkout logo. Falls back to the hosted icon if the bundled asset can't be read. */
export async function getPaymentLogoImage() {
  if (cachedPaymentLogo) {
    return cachedPaymentLogo;
  }

  try {
    const asset = Asset.fromModule(ImageAssets.paymentLogo);
    await asset.downloadAsync();

    const uri = asset.localUri ?? asset.uri;
    if (!uri || !canReadAsFile(uri)) {
      cachedPaymentLogo = FALLBACK_PAYMENT_LOGO;
      return cachedPaymentLogo;
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    cachedPaymentLogo = `data:image/png;base64,${base64}`;
    return cachedPaymentLogo;
  } catch {
    cachedPaymentLogo = FALLBACK_PAYMENT_LOGO;
    return cachedPaymentLogo;
  }
}
