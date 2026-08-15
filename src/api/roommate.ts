import { http } from '@/api/http';
import type { RoomMate, RoomMateType } from '@/types/roommate';

function parseMateList(payload: unknown): RoomMate[] {
  const body = (payload as { data?: unknown })?.data ?? payload;
  if (Array.isArray(body)) return body as RoomMate[];
  const record = body as { list?: RoomMate[]; users?: RoomMate[] };
  return record?.list ?? record?.users ?? [];
}

export async function getRoomMates(bookingId: string, inType: RoomMateType): Promise<RoomMate[]> {
  try {
    const { data } = await http.get('hello/room/user', {
      params: {
        booking_id: bookingId,
        in_type: inType,
        status: 'in',
      },
    });
    return parseMateList(data);
  } catch {
    return [];
  }
}

export async function postRoomMateDetails(payload: {
  bookingId: string;
  name: string;
  mobile: string;
  email: string;
  inType: RoomMateType;
}) {
  try {
    const { data } = await http.post('hello/room/user', {
      bookingId: payload.bookingId,
      name: payload.name,
      mobile: payload.mobile,
      email: payload.email,
      inType: payload.inType,
    });
    const body = (data as { data?: unknown })?.data ?? data;
    const record = body as { success?: boolean; message?: string };
    return {
      success: (data as { success?: boolean })?.success !== false && record?.success !== false,
      message: (data as { message?: string })?.message ?? record?.message,
    };
  } catch (error) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      (error instanceof Error ? error.message : 'Failed to add');
    return { success: false, message };
  }
}
