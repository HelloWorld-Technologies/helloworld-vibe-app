import { http } from '@/api/http';
import type {
  HdpApiMoment,
  MomentsListResponse,
  MomentsMediaType,
  MomentsPagination,
} from '@/types/hdp-moments';
import { mapApiMomentsToItems } from '@/utils/hdp-moments';

type MomentsApiResponse = {
  success?: boolean;
  data?: HdpApiMoment[];
  pagination?: MomentsPagination;
};

function isHdpApiMoment(value: unknown): value is HdpApiMoment {
  if (!value || typeof value !== 'object') return false;
  const moment = value as HdpApiMoment;
  return typeof moment.url === 'string' && moment.url.trim().length > 0;
}

export async function getMomentsList(params?: {
  mediaType?: MomentsMediaType;
  page?: number;
  pageSize?: number;
}): Promise<MomentsListResponse> {
  try {
    const { data } = await http.get<MomentsApiResponse>('moments', {
      params: {
        media_type: params?.mediaType ?? 'video',
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
      },
    });

    const items = mapApiMomentsToItems(
      (data?.data ?? []).filter(isHdpApiMoment),
    );

    return {
      success: Boolean(data?.success),
      data: items,
      pagination: data?.pagination,
    };
  } catch {
    return { success: false, data: [] };
  }
}
