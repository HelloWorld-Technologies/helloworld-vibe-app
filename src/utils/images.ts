import { Image } from "react-native";

import config from "@/config";
import { ImageAssets } from "@/constants/assets";

function encodeImageUrl(url: string) {
  return url.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");
}

/** Bundled "Image coming soon" placeholder (local asset). */
export const COMING_SOON_IMAGE = ImageAssets.comingSoon;

const FALLBACK_IMAGE =
  Image.resolveAssetSource(COMING_SOON_IMAGE)?.uri ??
  "https://hello-assets-items.s3.ap-south-1.amazonaws.com/images/coming-soon.jpg";

export const COMING_SOON_IMAGE_URI = FALLBACK_IMAGE;

const STAGING_MEDIA_BASE_URL =
  "https://hw-staging-media.s3.ap-south-1.amazonaws.com/";

function usesStagingMedia() {
  return (
    config.env === "staging" ||
    config.env === "dev" ||
    config.BASE_URL.includes("apistaging") ||
    config.BASE_URL.includes("staging")
  );
}

/**
 * Swap media folder `original` → `{page}/mobile` without touching hostnames
 * like `hw-production-original-image`.
 */
function toMobileVariantPath(path: string, page: "srp" | "hdp") {
  const replacement = `${page}/mobile`;
  if (path.includes("/original/")) {
    return path.replace("/original/", `/${replacement}/`);
  }
  if (path.startsWith("original/")) {
    return path.replace("original/", `${replacement}/`);
  }
  return path;
}

export function formatPropertyImageUrl(
  url?: string,
  page: "srp" | "hdp" = "srp",
) {
  if (!url) {
    return FALLBACK_IMAGE;
  }

  if (url.includes("http")) {
    // Keep absolute hosts (CDN or S3). Only swap path segment original → mobile.
    return encodeImageUrl(toMobileVariantPath(url, page));
  }

  // Production property media lives on the CDN with resized paths. Staging
  // media bucket often lacks these keys, so prefer CDN for `property/` paths.
  // App cards/gallery use the mobile variant (same as SRP/HDP cards).
  if (url.startsWith("property/") || !usesStagingMedia()) {
    return encodeImageUrl(
      `${config.S3_IMAGE_BUCKET_BASE_URL}${toMobileVariantPath(url, page)}`,
    );
  }

  return encodeImageUrl(
    `${STAGING_MEDIA_BASE_URL}${toMobileVariantPath(url, page)}`,
  );
}

/**
 * Format locality cover / photo from `hello/localities`.
 * Absolute API URLs (e.g. hw-production-original-image) are used as-is.
 * Relative keys use `images.thehelloworld.com` + `srp/mobile` like SRP cards.
 * Returns null when missing, coming-soon, or local asset paths so callers
 * can show the bundled coming-soon placeholder (never category / hero art).
 */
export function formatLocalityImageUrl(url?: string | null): string | null {
  const value = String(url ?? "").trim();
  if (!value || value === "null" || value === "undefined" || value === "none") {
    return null;
  }
  if (value.includes("coming-soon")) return null;
  if (value.startsWith("/assets/") || value.startsWith("assets/")) return null;
  if (value.startsWith("data:")) return value;

  // API often returns a full S3 URL that already works — do not rewrite the host.
  if (value.includes("http")) {
    return encodeImageUrl(value);
  }

  const formatted = encodeImageUrl(
    `${config.S3_IMAGE_BUCKET_BASE_URL}${toMobileVariantPath(value, "srp")}`,
  );
  if (
    !formatted ||
    formatted.includes("coming-soon") ||
    formatted === FALLBACK_IMAGE
  ) {
    return null;
  }
  return formatted;
}

export function getPropertyImageKeys(
  property?: Record<string, unknown> | null,
): string[] {
  if (!property) return [];

  const keys: string[] = [];
  const seen = new Set<string>();

  function push(value: unknown) {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    keys.push(trimmed);
  }

  // Prefer cover `image`, then gallery lists (some payloads have empty property_image).
  push(property.image);
  push(property.hdp_image);
  push(property.srp_image);

  for (const candidate of [property.property_image, property.images]) {
    if (!Array.isArray(candidate)) continue;
    for (const item of candidate) push(item);
  }

  return keys;
}
