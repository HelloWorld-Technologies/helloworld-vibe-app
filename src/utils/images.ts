import { Image } from 'react-native';

import config from '@/config';
import { ImageAssets } from '@/constants/assets';

function encodeImageUrl(url: string) {
  return url.replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/ /g, '%20');
}

/** Bundled "Image coming soon" placeholder (local asset). */
export const COMING_SOON_IMAGE = ImageAssets.comingSoon;

const FALLBACK_IMAGE =
  Image.resolveAssetSource(COMING_SOON_IMAGE)?.uri ??
  'https://hello-assets-items.s3.ap-south-1.amazonaws.com/images/coming-soon.jpg';

export const COMING_SOON_IMAGE_URI = FALLBACK_IMAGE;

const STAGING_MEDIA_BASE_URL = 'https://hw-staging-media.s3.ap-south-1.amazonaws.com/';

function usesStagingMedia() {
  return (
    config.env === 'staging' ||
    config.env === 'dev' ||
    config.BASE_URL.includes('apistaging') ||
    config.BASE_URL.includes('staging')
  );
}

export function formatPropertyImageUrl(
  url?: string,
  page: 'srp' | 'hdp' = 'srp',
) {
  if (!url) {
    return FALLBACK_IMAGE;
  }

  if (url.includes('http')) {
    return encodeImageUrl(url);
  }

  if (usesStagingMedia()) {
    return encodeImageUrl(`${STAGING_MEDIA_BASE_URL}${url}`);
  }

  const resizedPath = url.replace('original', `${page}/desktop`);
  return encodeImageUrl(`${config.S3_IMAGE_BUCKET_BASE_URL}${resizedPath}`);
}

export function getPropertyImageKeys(property?: Record<string, unknown> | null): string[] {
  if (!property) return [];

  const candidates = [
    property.property_image,
    property.images,
    property.image,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is string => typeof item === 'string' && item.length > 0);
    }
    if (typeof candidate === 'string' && candidate.length > 0) {
      return [candidate];
    }
  }

  return [];
}
