export type BookingStatus = {
  bank_details: boolean;
  'booking date': string;
  checklist_status: boolean;
  'emergency details': boolean;
  is_kyc_cleared: boolean;
  move_in_date: string;
  moved_in: boolean;
  payment: boolean;
  signed_document: boolean;
};

export type MoveInStepId =
  | 'booking-token'
  | 'advance-charges'
  | 'personal-profile'
  | 'emergency-contact'
  | 'document-verification'
  | 'bank-details'
  | 'move-in-checklist'
  | 'agreement-signing';

export type MoveInStep = {
  id: MoveInStepId;
  title: string;
  description: string;
  actionLabel?: string;
  route?: string;
  completed: boolean;
  /** When false, the step is visible but not actionable yet. */
  enabled?: boolean;
  lockedMessage?: string;
};

export type RentalAgreementItem = {
  id: string;
  label: string;
  dateRange: string;
  downloadUrl?: string;
};

export type ResidenceStatus = {
  label: string;
};
