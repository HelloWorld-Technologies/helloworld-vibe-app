/** Normalize Admin / API gender values for display. */
export function normalizeGenderKey(gender?: string | null): string {
  return String(gender || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
}

/**
 * Badge / card label for restricted gender policies.
 * Returns undefined for ALL / unisex / empty so UI does not show a gender chip.
 */
export function getGenderDisplayLabel(gender?: string | null): string | undefined {
  const key = normalizeGenderKey(gender);
  if (!key) return undefined;

  switch (key) {
    case 'MALE':
    case 'BOYS':
    case 'BOYS_ONLY':
    case 'MEN':
    case 'MEN_ONLY':
    case 'MALE_ONLY':
      return 'Men Only';
    case 'FEMALE':
    case 'GIRLS':
    case 'GIRLS_ONLY':
    case 'WOMEN':
    case 'WOMEN_ONLY':
    case 'FEMALE_ONLY':
      return 'Women Only';
    case 'ALL':
    case 'UNISEX':
    case 'COED':
    case 'CO_ED':
    case 'ANY':
    case 'ANY_GENDER':
    case 'ALL_GENDER':
    case 'ALL_GENDERS':
      return undefined;
    default:
      return undefined;
  }
}
