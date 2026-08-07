import { Share } from 'react-native';

import config from '@/config';

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getPropertyShareUrl(params: {
  id?: string | number;
  name?: string;
  city?: string;
  locality?: string;
}) {
  const citySlug = params.city ? toSlug(params.city) : '';
  const localitySlug = params.locality ? toSlug(params.locality) : '';
  const propertySlug = params.name ? toSlug(params.name) : '';

  if (citySlug && localitySlug && propertySlug) {
    return `${config.PUBLIC_URL}/coliving-in-${citySlug}/${localitySlug}/${propertySlug}`;
  }

  if (params.id != null && params.id !== '') {
    return `${config.PUBLIC_URL}/coliving-pg/${params.id}`;
  }

  return config.PUBLIC_URL;
}

export async function shareProperty(params: {
  name: string;
  id?: string;
  city?: string;
  locality?: string;
  url?: string;
}) {
  const url =
    params.url ??
    getPropertyShareUrl({
      id: params.id,
      name: params.name,
      city: params.city,
      locality: params.locality,
    });
  const message = `Check out ${params.name} on HelloWorld\n${url}`;
  await Share.share({ message }).catch(() => undefined);
}

export function getImageUriFromSource(
  image: number | { uri?: string } | undefined,
): string | undefined {
  if (typeof image === 'object' && image !== null && 'uri' in image) {
    return image.uri;
  }
  return undefined;
}
