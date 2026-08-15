export type ReferralLog = {
  refId: string;
  actionType: 'credit' | 'debit';
  amount: number;
  date: string;
  description?: string;
  title?: string;
  remark?: string;
  refereeName?: string;
  status?: string;
};

export type ReferralDetails = {
  referralCode?: string;
  balanceCredits?: number;
  totalCredits?: number;
  friendsJoined?: number;
  logs: ReferralLog[];
};

export type ReferralTerms = {
  amount?: number;
  referrerAmount?: number;
  refereeAmount?: number;
  terms?: string[];
};
