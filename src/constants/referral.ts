export const REFERRAL_DISCLAIMER =
  'Referral rewards are subject to applicable taxes & program terms.';

export function parseRupeeFromText(text: string) {
  const match = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i);
  if (!match) return undefined;
  const parsed = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Pull referrer / referee rewards from the terms copy so How it works matches T&Cs. */
export function parseReferralRewardAmounts(terms: readonly string[]) {
  let referrerAmount: number | undefined;
  let refereeAmount: number | undefined;

  for (const term of terms) {
    const amount = parseRupeeFromText(term);
    if (amount == null) continue;
    const lower = term.toLowerCase();
    if (/\breferrer\b/.test(lower)) {
      referrerAmount = amount;
    } else if (/\breferee\b/.test(lower)) {
      refereeAmount = amount;
    }
  }

  return { referrerAmount, refereeAmount };
}

export function getReferralHowItWorksSteps(friendDiscount = 1000, referrerReward = 2000) {
  return [
    {
      step: 1,
      title: 'Share your code',
      description: 'Send your referral code to a friend looking for a PG',
    },
    {
      step: 2,
      title: 'Friend moves in',
      description: `They use your code and get ₹${friendDiscount.toLocaleString('en-IN')} off their first rent`,
    },
    {
      step: 3,
      title: `You earn ₹${referrerReward.toLocaleString('en-IN')}`,
      description:
        'Points credited to your wallet after their move-in and they complete 30 days at a HelloWorld property.',
    },
  ] as const;
}
