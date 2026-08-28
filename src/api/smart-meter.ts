import { http } from "@/api/http";
import type {
  SmartMeterConsumptionDeduction,
  SmartMeterRechargeRecord,
  SmartMeterRoom,
} from "@/types/smart-meter";

export function resolveSmartMeterBookingId(bookingId?: string | null) {
  return "643838000353866488" || bookingId?.trim();
}

type RoomDetailsResponse = {
  success: boolean;
  data?: SmartMeterRoom[];
  message?: string;
};

type RechargeResponse = {
  success: boolean;
  data?: {
    success: boolean;
    message: string;
    data?: {
      paymentLink: string;
      rechargeId: string;
    };
  };
  message?: string;
};

type PaymentHistoryResponse = {
  success: boolean;
  data?: {
    totalCount: number;
    recharges: SmartMeterRechargeRecord[];
  };
  message?: string;
};

type RoomConsumptionItem = {
  aliste_room_id: string;
  consumption: {
    success: boolean;
    message?: string;
    data?: {
      deductions: SmartMeterConsumptionDeduction[];
    };
  };
};

type RoomConsumptionResponse = {
  success: boolean;
  data?:
    | RoomConsumptionItem[]
    | {
        success?: boolean;
        message?: string;
        data?: {
          deductions?: SmartMeterConsumptionDeduction[];
        };
      };
  message?: string;
};

function extractConsumptionDeductions(
  payload: unknown,
): SmartMeterConsumptionDeduction[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    const deductions: SmartMeterConsumptionDeduction[] = [];
    payload.forEach((roomItem) => {
      if (!roomItem || typeof roomItem !== "object") return;
      const item = roomItem as RoomConsumptionItem;
      const roomDeductions = item.consumption?.data?.deductions ?? [];
      roomDeductions.forEach((deduction) => {
        deductions.push({ ...deduction, aliste_room_id: item.aliste_room_id });
      });
    });
    return deductions;
  }

  if (typeof payload === "object") {
    const obj = payload as {
      deductions?: SmartMeterConsumptionDeduction[];
      data?: { deductions?: SmartMeterConsumptionDeduction[] } | unknown;
      consumption?: RoomConsumptionItem["consumption"];
    };

    if (Array.isArray(obj.deductions)) return obj.deductions;

    if (obj.data) {
      if (Array.isArray(obj.data))
        return extractConsumptionDeductions(obj.data);
      if (typeof obj.data === "object" && Array.isArray(obj.data.deductions)) {
        return obj.data.deductions;
      }
    }

    if (obj.consumption?.data?.deductions) {
      return obj.consumption.data.deductions;
    }
  }

  return [];
}

export async function getSmartMeterRooms(
  bookingId: string,
  isShortStay = false,
): Promise<RoomDetailsResponse> {
  const resolvedBookingId = resolveSmartMeterBookingId(bookingId);
  try {
    const { data } = await http.get<RoomDetailsResponse>(
      `smart-meter/booking/${encodeURIComponent(resolvedBookingId)}/room`,
      { params: { is_short_stay: isShortStay } },
    );
    return {
      success: Boolean(data?.success),
      data: Array.isArray(data?.data) ? data.data : [],
      message: data?.message,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch meter details";
    return { success: false, data: [], message };
  }
}

export async function rechargeSmartMeter(params: {
  aliste_room_id: string;
  property_id: string;
  amount: number;
  booking_id: string;
  note?: string;
  is_short_stay?: boolean;
}): Promise<RechargeResponse> {
  try {
    const body = new URLSearchParams({
      aliste_room_id: params.aliste_room_id,
      property_id: params.property_id,
      amount: String(params.amount),
      booking_id: resolveSmartMeterBookingId(params.booking_id),
      is_short_stay: (params.is_short_stay ?? false) ? "true" : "false",
    });
    if (params.note) body.append("note", params.note);

    const { data } = await http.post<RechargeResponse>(
      "smart-meter/room/recharge",
      body.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Recharge failed";
    return { success: false, message };
  }
}

export async function getSmartMeterPaymentHistory(
  bookingId: string,
  options?: { status?: string; isShortStay?: boolean },
): Promise<PaymentHistoryResponse> {
  try {
    const { data } = await http.get<PaymentHistoryResponse>(
      "smart-meter/room/payment-history",
      {
        params: {
          bookingId: resolveSmartMeterBookingId(bookingId),
          status: options?.status ?? "success",
          isShortStay: options?.isShortStay ?? false,
        },
      },
    );
    return {
      success: Boolean(data?.success),
      data: data?.data ?? { totalCount: 0, recharges: [] },
      message: data?.message,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch payment history";
    return { success: false, data: { totalCount: 0, recharges: [] }, message };
  }
}

export async function getSmartMeterConsumption(params: {
  booking_id: string;
  startDate: string;
  endDate: string;
}): Promise<{
  success: boolean;
  deductions: SmartMeterConsumptionDeduction[];
  message?: string;
}> {
  try {
    const { data } = await http.post<RoomConsumptionResponse>(
      "smart-meter/room/consumption",
      {
        booking_id: resolveSmartMeterBookingId(params.booking_id),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    );

    if (!data?.success) {
      return {
        success: false,
        deductions: [],
        message: data?.message ?? "Failed to fetch consumption",
      };
    }

    return {
      success: true,
      deductions: extractConsumptionDeductions(data.data),
      message: data.message,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch consumption";
    return { success: false, deductions: [], message };
  }
}

export function getSmartMeterBalance(rooms: SmartMeterRoom[]) {
  return rooms.reduce(
    (total, room) => total + (room.currentBalance ?? room.balance ?? 0),
    0,
  );
}
