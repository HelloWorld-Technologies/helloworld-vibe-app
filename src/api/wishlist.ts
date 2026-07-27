import { http } from '@/api/http';
import type {
  WishlistApiResponse,
  WishlistCardsPage,
  WishlistPropertyCard,
  WishlistPropertyId,
} from '@/types/wishlist';

export const WISHLIST_PAGE_SIZE = 10;

function parseWishlistIds(data: unknown): WishlistPropertyId[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => Number(item))
    .filter((id) => Number.isFinite(id) && id > 0);
}

export async function fetchWishlistPropertyIds(): Promise<WishlistPropertyId[]> {
  try {
    const { data } = await http.get<WishlistApiResponse<WishlistPropertyId[]>>('user/wishlist', {
      params: { srp: true },
    });
    if (!data?.success) return [];
    return parseWishlistIds(data.data);
  } catch {
    return [];
  }
}

export async function fetchWishlistPropertyCards(params: {
  page: number;
  page_size?: number;
}): Promise<WishlistCardsPage> {
  try {
    const { data } = await http.get<WishlistApiResponse<WishlistPropertyCard[]>>('user/wishlist', {
      params: {
        srp: false,
        page: params.page,
        page_size: params.page_size ?? WISHLIST_PAGE_SIZE,
      },
    });

    if (!data?.success) {
      return {
        success: false,
        data: [],
        pageInfo: data?.pageInfo,
        message: data?.message,
      };
    }

    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : [],
      pageInfo: data.pageInfo,
      message: data.message,
    };
  } catch {
    return { success: false, data: [] };
  }
}

export async function addWishlistProperty(
  propertyId: WishlistPropertyId,
): Promise<WishlistApiResponse<unknown>> {
  try {
    const { data } = await http.post<WishlistApiResponse<unknown>>(`user/wishlist/${propertyId}`);
    return data ?? { success: false };
  } catch {
    return { success: false };
  }
}

export async function removeWishlistProperty(
  propertyId: WishlistPropertyId,
): Promise<WishlistApiResponse<unknown>> {
  try {
    const { data } = await http.delete<WishlistApiResponse<unknown>>(`user/wishlist/${propertyId}`);
    return data ?? { success: false };
  } catch {
    return { success: false };
  }
}
