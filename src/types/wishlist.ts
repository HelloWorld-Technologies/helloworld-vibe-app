export type WishlistApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  pageInfo?: WishlistPageInfo;
};

export type WishlistPageInfo = {
  count?: number;
  total?: number;
  /** Next page number, or `false` when there are no more pages. */
  nextPage?: number | boolean | null;
};

export type WishlistPropertyId = number;

export type WishlistPropertyCard = {
  id: number;
  image?: string;
  name?: string;
  display_name?: string;
  address?: {
    line1?: string;
    line2?: string;
    locality?: string;
    city?: string;
  };
  min_rent?: number;
  available_beds?: number;
  gender?: string;
  locality?: string;
  city?: string;
  sold_out?: boolean;
  lightning_deal?: boolean;
  free_rent?: boolean;
  is_filling_fast?: boolean;
  filling_fast?: boolean;
  room_types?: string[];
  sharing_types?: string[];
  rating?: number;
  google_rating?: number;
};

export type WishlistCardsPage = {
  success: boolean;
  data: WishlistPropertyCard[];
  pageInfo?: WishlistPageInfo;
  message?: string;
};
