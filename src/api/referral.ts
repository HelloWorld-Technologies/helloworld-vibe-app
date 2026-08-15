import { http } from '@/api/http';
import { parseReferralRewardAmounts } from '@/constants/referral';
import type { ReferralDetails, ReferralLog, ReferralTerms } from '@/types/referral';

function parseReferralDetails(payload: unknown): ReferralDetails {
  const body = (payload as { data?: unknown })?.data ?? payload;
  const record = body as {
    referralDetail?: {
      id?: string;
      amount?: number;
      totalAmount?: number;
      referrals?: number;
      referralCount?: number;
    };
    logs?: ReferralLog[];
  };

  const referralDetail = record?.referralDetail;
  const logs = Array.isArray(record?.logs) ? record.logs : [];
  const creditReferrals = logs.filter((log) => log.actionType === 'credit').length;

  return {
    referralCode: referralDetail?.id,
    balanceCredits: referralDetail?.amount,
    totalCredits: referralDetail?.totalAmount ?? referralDetail?.amount,
    friendsJoined: referralDetail?.referrals ?? referralDetail?.referralCount ?? creditReferrals,
    logs,
  };
}

export async function getReferralDetails(withLogs = true): Promise<ReferralDetails> {
  try {
    const { data } = await http.get('referral/history', {
      params: withLogs ? { log: 'yes' } : undefined,
    });
    return parseReferralDetails(data);
  } catch {
    return { logs: [] };
  }
}

function toPositiveAmount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  return undefined;
}

export async function getReferralTerms(): Promise<ReferralTerms> {
  try {
    const { data } = await http.get<{ success?: boolean; data?: ReferralTerms } | ReferralTerms>(
      'hello/const',
      {
        params: { ctype: 'referral' },
      },
    );
    const body =
      data && typeof data === 'object' && 'data' in data && data.data
        ? data.data
        : (data as ReferralTerms);
    const record = (body ?? {}) as Record<string, unknown>;

    const terms = Array.isArray(body?.terms)
      ? body.terms.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];
    const fromCopy = parseReferralRewardAmounts(terms);

    return {
      amount:
        toPositiveAmount(body?.amount) ??
        toPositiveAmount(record.referrerAmount) ??
        toPositiveAmount(record.referrer_amount) ??
        toPositiveAmount(record.rewardAmount) ??
        toPositiveAmount(record.reward),
      referrerAmount:
        fromCopy.referrerAmount ??
        toPositiveAmount(record.referrerAmount) ??
        toPositiveAmount(record.referrer_amount),
      refereeAmount:
        fromCopy.refereeAmount ??
        toPositiveAmount(record.refereeAmount) ??
        toPositiveAmount(record.referee_amount),
      terms,
    };
  } catch {
    return { terms: [] };
  }
}
