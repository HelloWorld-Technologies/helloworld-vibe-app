import type { WishlistPropertyCard } from '@/types/wishlist';
import type { PropertyListing } from '@/types/property';
import { formatPropertyImageUrl } from '@/utils/images';

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function mapWishlistCardToListing(card: WishlistPropertyCard): PropertyListing {
  const location =
    card.locality || card.address?.line2 || card.address?.locality || card.city || 'Coliving PG';

  const roomTypes =
    card.room_types?.map(titleCase) ??
    card.sharing_types?.map(titleCase) ??
    ['Private', 'Double', 'Triple'];

  const badges: PropertyListing['badges'] = [];
  if (card.lightning_deal) {
    badges.push({ label: 'Trending', variant: 'filling-fast' });
  } else if (card.is_filling_fast || card.filling_fast) {
    badges.push({ label: 'Filling Fast', variant: 'filling-fast' });
  }

  const gender = card.gender?.toLowerCase() ?? '';
  if (gender.includes('female') || gender.includes('women')) {
    badges.push({ label: 'Women Only', variant: 'women-only' });
  }

  return {
    id: String(card.id),
    name: card.display_name ?? card.name ?? 'HelloWorld Property',
    slugName: card.name,
    location,
    city: card.city || card.address?.city || undefined,
    locality:
      card.locality ||
      card.address?.locality ||
      card.address?.line2?.split(',').pop()?.trim() ||
      undefined,
    rating: Number(card.rating ?? card.google_rating) || 4.5,
    vibeMatchPercent: undefined,
    startingRent: card.min_rent ?? 0,
    roomTypes,
    images: card.image ? [{ uri: formatPropertyImageUrl(card.image) }] : [],
    badges: badges.length > 0 ? badges : undefined,
  };
}
