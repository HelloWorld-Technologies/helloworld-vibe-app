import { Share } from 'react-native';

import config from '@/config';

/** Matches helloworld-next `createSlug`: lowercase, spaces → hyphens. */
function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Matches helloworld-next `getLocalitySlug` / `srpSlug`. */
function localityToSlug(value: string) {
  return value
    .trim()
    .replace(/ /g, '-')
    .replace(/_/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function localityFromLine2(line2?: string | null) {
  if (!line2?.trim()) return '';
  const last = line2.split(',').pop()?.trim() ?? '';
  return last ? localityToSlug(last) : '';
}

function srpSlug(city: string) {
  const cityKey = city.trim().toLowerCase();
  if (cityKey === 'kota') return 'hostels-in-kota';
  return `coliving-in-${cityKey}`;
}

/**
 * Website HDP URL, same shape as helloworld-next `getPropertyHref`:
 * `/coliving-in-{city}/{locality}/{property-name}`
 * e.g. https://staging.thehelloworld.com/coliving-in-bangalore/hsr-layout/helloworld-arden
 */
export function getPropertyShareUrl(params: {
  id?: string | number;
  name?: string;
  displayName?: string;
  city?: string;
  locality?: string;
  addressLine2?: string;
}) {
  const city = params.city?.trim() ?? '';
  const hdp = createSlug(params.name || params.displayName || '');
  const locality =
    (params.locality ? localityToSlug(params.locality) : '') ||
    localityFromLine2(params.addressLine2);

  if (!city || !hdp) {
    return config.PUBLIC_URL;
  }

  const srp = srpSlug(city);
  const path = locality ? `/${srp}/${locality}/${hdp}` : `/${srp}/${hdp}`;
  const url = new URL(`${config.PUBLIC_URL}${path}`);
  if (params.id != null && String(params.id).trim()) {
    url.searchParams.set('id', String(params.id));
  }
  return url.toString();
}

export async function shareProperty(params: {
  name: string;
  id?: string;
  displayName?: string;
  city?: string;
  locality?: string;
  addressLine2?: string;
  url?: string;
}) {
  const url =
    params.url ??
    getPropertyShareUrl({
      id: params.id,
      name: params.name,
      displayName: params.displayName,
      city: params.city,
      locality: params.locality,
      addressLine2: params.addressLine2,
    });
  const message = `Check out ${params.displayName || params.name} on HelloWorld\n${url}`;
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
