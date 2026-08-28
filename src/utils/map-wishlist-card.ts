import type { WishlistPropertyCard } from '@/types/wishlist';
import type { PropertyListing } from '@/types/property';
import { getGenderDisplayLabel } from '@/utils/gender-label';
import { formatPropertyImageUrl } from '@/utils/images';

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => {
      if (part.length > 1 && part === part.toUpperCase()) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ');
}

export function mapWishlistCardToListing(card: WishlistPropertyCard): PropertyListing {
  const rawLocality =
    card.locality ||
    card.address?.locality ||
    card.address?.line2?.split(',').pop()?.trim() ||
    undefined;
  const locality = rawLocality ? titleCase(rawLocality) : undefined;
  const location = locality || (card.city ? titleCase(card.city) : 'Coliving PG');

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

  const genderLabel = getGenderDisplayLabel(card.gender);
  if (genderLabel) {
    badges.push({ label: genderLabel, variant: 'gender' });
  }

  return {
    id: String(card.id),
    name: card.display_name ?? card.name ?? 'HelloWorld Property',
    slugName: card.name,
    location,
    city: card.city || card.address?.city || undefined,
    locality,
    rating: Number(card.rating ?? card.google_rating) || 4.5,
    vibeMatchPercent: undefined,
    startingRent: card.min_rent ?? 0,
    roomTypes,
    images: card.image ? [{ uri: formatPropertyImageUrl(card.image) }] : [],
    badges: badges.length > 0 ? badges : undefined,
  };
}
