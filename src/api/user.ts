import axios from 'axios';

import { http } from '@/api/http';
import type { TenantProfile } from '@/types/tenant';

type TenantProfileResponse = TenantProfile & {
  success?: boolean;
  message?: string;
  status?: number;
};

export async function getTenantProfile(): Promise<TenantProfileResponse> {
  const { data } = await http.get<TenantProfileResponse>('hello/tenant/details');
  return data;
}

export async function getPropertyManagerByBookingId(bookingId: string) {
  const { data } = await http.get('api/hello/booking/property-manager', {
    params: { booking_id: bookingId },
  });
  return data;
}

type BookingStatusResponse = {
  success?: boolean;
  data?: import('@/types/booking-status').BookingStatus;
  message?: string;
};

export async function getBookingStatus(bookingId: string) {
  const { data } = await http.get<BookingStatusResponse>('hello/tenant/booking_status', {
    params: { booking_id: bookingId },
  });
  return data;
}

export async function getKycLink(bookingId: string) {
  const { data } = await http.get<{ success?: boolean; data?: { url?: string }; url?: string }>(
    'hello/tenant/kyc_link',
    { params: { booking_id: bookingId } },
  );
  return data;
}

type BankDetailsResponse = {
  success?: boolean;
  data?: {
    name?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  message?: string;
};

export async function getBankDetails(bookingId?: string) {
  const { data } = await http.get<BankDetailsResponse>('hello/tenant/bankdetails', {
    params: { booking_id: bookingId },
  });
  return data;
}

type BankDetailsPayload = {
  name: string;
  accountNumber: string;
  ifscCode: string;
  booking_id?: string;
};

export async function postBankDetails(payload: BankDetailsPayload) {
  const { data } = await http.put<{ success?: boolean; data?: string; message?: string }>(
    'hello/tenant/update/bank_details',
    payload,
  );
  return data;
}

type EmergencyContactResponse = {
  success?: boolean;
  data?: {
    name?: string;
    mobile?: string;
    relation?: string;
  };
  message?: string;
};

export async function getEmergencyContactDetails(bookingId?: string) {
  const { data } = await http.get<EmergencyContactResponse>('hello/tenant/fetch/emgdetails', {
    params: { booking_id: bookingId },
  });
  return data;
}

type EmergencyContactPayload = {
  relation_to_customer: string;
  contact_name: string;
  mobile: string;
  bookingId?: string;
};

export async function postEmergencyContactDetails(payload: EmergencyContactPayload) {
  const { data } = await http.post<{
    success?: boolean;
    data?: string;
    message?: string;
    error?: string;
  }>('hello/tenant/update/emgdetails', { data: payload });
  return data;
}

type UserDetailsPayload = {
  college: string;
  company: string;
};

type UserDetailsResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

export async function postUserDetails(payload: UserDetailsPayload): Promise<UserDetailsResponse> {
  try {
    const { data } = await http.post<UserDetailsResponse>('user/details', {
      college: payload.college.trim(),
      company: payload.company.trim(),
    });

    if (data?.success === false) {
      return {
        success: false,
        message: data.message ?? data.error ?? 'Failed to save user details',
      };
    }

    return { success: true, ...data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as UserDetailsResponse | undefined;
      return {
        success: false,
        message:
          responseData?.message ??
          responseData?.error ??
          error.message ??
          'Failed to save user details',
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save user details',
    };
  }
}
