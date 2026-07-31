import { http } from '@/api/http';
import type {
  PaymentDetailsPayload,
  PaymentDetailsResponse,
  ReferralValidatePayload,
  ReferralValidateResponse,
} from '@/types/booking-payment';
import type {
  MoveInChecklistResponse,
  UpdateMoveInChecklistPayload,
  UpdateMoveInChecklistResponse,
} from '@/types/move-in-checklist';
import type { MoveInPaymentDetailsResponse } from '@/types/move-in-payment';

export async function getPaymentDetails(
  payload: PaymentDetailsPayload,
): Promise<PaymentDetailsResponse> {
  try {
    const { data } = await http.post<PaymentDetailsResponse>(
      'api/v3/booking/payment_details',
      payload,
    );
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load payment details';
    return { success: false, message };
  }
}

export async function getMoveInPaymentDetails(
  bookingId: string,
): Promise<MoveInPaymentDetailsResponse> {
  try {
    const { data } = await http.get<MoveInPaymentDetailsResponse>(
      'api/hello/moveins/get_payments',
      { params: { booking_id: bookingId } },
    );
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load move-in payment details';
    return { success: false, message };
  }
}

export async function verifyReferralCode(
  payload: ReferralValidatePayload,
): Promise<ReferralValidateResponse> {
  try {
    const { data } = await http.post<ReferralValidateResponse>(
      'api/hello/referral/validate',
      payload,
    );
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to validate referral code';
    return { isValid: false, message };
  }
}

export async function getMoveInChecklist(bookingId: string): Promise<MoveInChecklistResponse> {
  try {
    const { data } = await http.get<MoveInChecklistResponse>('hello/bookings/checklist', {
      params: { booking_id: bookingId, checklist_type: 'move_in' },
    });
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch checklist';
    return { success: false, message };
  }
}

export async function updateMoveInChecklist(
  payload: UpdateMoveInChecklistPayload,
): Promise<UpdateMoveInChecklistResponse> {
  try {
    const { data } = await http.put<UpdateMoveInChecklistResponse>(
      'hello/bookings/checklist/updatechecklistmi',
      payload,
    );
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update checklist';
    return { success: false, message };
  }
}
