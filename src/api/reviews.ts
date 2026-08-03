import { http } from '@/api/http';
import type {
  PendingReview,
  PendingReviewsResponse,
  SkipReviewPayload,
  SubmitReviewPayload,
  UpdateReviewResponse,
} from '@/types/review';

export async function getPendingReviews(params: {
  booking_id: string;
  event_type?: 'moved-out' | 'moved-in' | 'rent-payment';
}): Promise<{ success: boolean; data: PendingReview[]; message?: string }> {
  try {
    const { data } = await http.get<PendingReviewsResponse | PendingReview[]>('reviews/pending', {
      params,
    });

    if (Array.isArray(data)) {
      return { success: true, data };
    }

    if (data && typeof data === 'object') {
      const payload = data as PendingReviewsResponse;
      if (payload.success === false) {
        return {
          success: false,
          data: [],
          message: payload.message ?? 'Failed to load pending reviews',
        };
      }
      return {
        success: Boolean(payload.success ?? true),
        data: Array.isArray(payload.data) ? payload.data : [],
        message: payload.message,
      };
    }

    return { success: false, data: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load pending reviews';
    return { success: false, data: [], message };
  }
}

export async function submitReview(
  payload: SubmitReviewPayload,
): Promise<UpdateReviewResponse> {
  try {
    const { data } = await http.post<UpdateReviewResponse>('reviews/update', payload);
    if (data?.success === false) {
      return { success: false, message: data.message ?? 'Failed to submit review' };
    }
    return { success: true, message: data?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return { success: false, message };
  }
}

export async function skipReview(payload: SkipReviewPayload): Promise<UpdateReviewResponse> {
  try {
    const { data } = await http.post<UpdateReviewResponse>('reviews/update', payload);
    if (data?.success === false) {
      return { success: false, message: data.message ?? 'Failed to skip review' };
    }
    return { success: true, message: data?.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to skip review';
    return { success: false, message };
  }
}
