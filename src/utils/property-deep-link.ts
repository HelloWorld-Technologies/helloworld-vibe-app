import type { Href } from 'expo-router';

/** Website hosts that open the app (Android App Links / iOS Universal Links). */
export const PROPERTY_DEEP_LINK_URLS = {
  production: 'https://thehelloworld.com',
  staging: 'https://staging.thehelloworld.com',
} as const;

const PROPERTY_HOSTS = new Set([
  'thehelloworld.com',
  'www.thehelloworld.com',
  'staging.thehelloworld.com',
  'app.thehelloworld.com',
]);

export function getHdpDeepLinkUrl(
  id: string | number,
  env: keyof typeof PROPERTY_DEEP_LINK_URLS = 'production',
) {
  return `${PROPERTY_DEEP_LINK_URLS[env]}/hdp?id=${encodeURIComponent(String(id))}`;
}

const SRP_PREFIX = /^(coliving-in-|hostels-in-)/;

export function firstSearchParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? '';
}

function parseIncomingUrl(path: string): URL | null {
  try {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) {
      return new URL(path);
    }
    return new URL(path, 'thehelloworld://');
  } catch {
    return null;
  }
}

function pathnameOf(url: URL) {
  if (url.protocol.replace(/:$/, '') === 'thehelloworld' && url.hostname && (!url.pathname || url.pathname === '/')) {
    return `/${url.hostname}`;
  }
  return url.pathname || '/';
}

function numericId(value: string | null) {
  if (!value) return '';
  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? trimmed : '';
}

function hdpPath(params: { id?: string; slug?: string }) {
  const search = new URLSearchParams();
  if (params.id) search.set('id', params.id);
  if (params.slug) search.set('slug', params.slug);
  const query = search.toString();
  return query ? `/hdp?${query}` : '/hdp';
}

/** Rewrite website / custom-scheme URLs to an in-app HDP href, or null if not a property link. */
export function rewritePropertyDeepLink(path: string): string | null {
  const url = parseIncomingUrl(path);
  if (!url) return null;

  const host = url.hostname.replace(/^www\./, '');
  const isAppScheme = url.protocol.replace(/:$/, '') === 'thehelloworld';
  if (!isAppScheme && host && !PROPERTY_HOSTS.has(url.hostname) && !PROPERTY_HOSTS.has(host)) {
    return null;
  }

  const pathname = pathnameOf(url);
  const id = numericId(url.searchParams.get('id'));
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'hdp') {
    const slug = url.searchParams.get('slug')?.trim() ?? '';
    if (id || slug) return hdpPath({ id: id || undefined, slug: slug || undefined });
    return null;
  }

  if (id && segments[0] && SRP_PREFIX.test(segments[0])) {
    return hdpPath({ id });
  }

  if (segments.length >= 3 && SRP_PREFIX.test(segments[0])) {
    const slug = decodeURIComponent(segments[segments.length - 1] ?? '').trim();
    if (!slug) return null;
    return hdpPath({ id: id || undefined, slug });
  }

  if (segments[0] && SRP_PREFIX.test(segments[0])) {
    return '/';
  }

  return null;
}

export function isHdpHref(path: string) {
  return path.startsWith('/hdp');
}

export function hrefFromHdpPath(path: string): Href {
  const url = parseIncomingUrl(path) ?? new URL(path, 'thehelloworld://');
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (value) params[key] = value;
  });
  return { pathname: '/hdp', params } as Href;
}
