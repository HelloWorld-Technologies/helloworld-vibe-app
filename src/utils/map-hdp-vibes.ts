import { emojiForVibeCode } from '@/constants/vibes';

export type HdpVibeBadgeApi = {
  vibeId?: number | string;
  matchPercent?: number | string;
};

export type HdpPropertyVibeApi = {
  vibe_id?: number | string;
  code?: string;
  display_name?: string;
  count?: number;
  percentage?: number;
};

export type HdpSelectedVibeMatch = {
  id: string;
  emoji: string;
  label: string;
  score: number;
};

export type HdpResidentInterest = {
  id: string;
  emoji: string;
  label: string;
};

export function parseVibeMatchScore(raw: unknown): number | undefined {
  const score = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(score) || score <= 0) return undefined;
  return Math.round(score);
}

export function mapVibeBadgesToSelectedMatches(
  badges: readonly HdpVibeBadgeApi[] | null | undefined,
  labelById?: ReadonlyMap<number, { label: string; emoji: string }>,
): HdpSelectedVibeMatch[] {
  if (!Array.isArray(badges) || badges.length === 0) return [];

  const matches: HdpSelectedVibeMatch[] = [];
  for (const badge of badges) {
    const vibeId = Number(badge.vibeId);
    if (!Number.isFinite(vibeId) || vibeId <= 0) continue;

    const score = parseVibeMatchScore(badge.matchPercent) ?? 0;
    const meta = labelById?.get(vibeId);

    matches.push({
      id: String(vibeId),
      emoji: meta?.emoji ?? '✨',
      label: meta?.label ?? `Vibe ${vibeId}`,
      score,
    });
  }

  return matches;
}

export function mapPropertyVibesToInterests(
  propertyVibes: readonly HdpPropertyVibeApi[] | null | undefined,
): HdpResidentInterest[] {
  if (!Array.isArray(propertyVibes) || propertyVibes.length === 0) return [];

  const interests: HdpResidentInterest[] = [];
  const seen = new Set<string>();

  for (const item of propertyVibes) {
    const code = String(item.code || '')
      .trim()
      .toLowerCase()
      .replace(/_/g, '-');
    const label = String(item.display_name || code || '').trim();
    if (!label) continue;

    const key = code || label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    interests.push({
      id: key,
      emoji: code ? emojiForVibeCode(code) : '✨',
      label,
    });
  }

  return interests;
}
