export type ReviewType = 'PROPERTY' | 'PROPERTY_MANAGER';

export type ReviewEventType = 'moved-out' | 'moved-in' | 'rent-payment' | string;

export type PendingReview = {
  id: number;
  rating: number | null;
  review: string | null;
  review_status: string;
  review_type: ReviewType;
  event_type: ReviewEventType;
  booking_id: string;
  property_id: number;
  user_id: number;
  property_manager_id: number | null;
  description: string;
  Property?: {
    id: number;
    name: string;
  };
};

export type PendingReviewsResponse = {
  success?: boolean;
  count?: number;
  data?: PendingReview[];
  message?: string;
};

export type SubmitReviewPayload = {
  eventType: ReviewEventType;
  review_status: 'COMPLETED';
  review_type: ReviewType;
  review: string;
  rating: number;
};

export type SkipReviewPayload = {
  eventType: ReviewEventType;
  review_status: 'SKIPPED';
  review_type: ReviewType;
};

export type UpdateReviewResponse = {
  success?: boolean;
  message?: string;
};
